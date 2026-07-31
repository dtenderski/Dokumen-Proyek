import type { Express } from "express";
import { authStorage } from "../replit_integrations/auth/storage";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

// In-memory OTP store: phone → { otp, expires }
const otpStore = new Map<string, { otp: string; expires: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (now > v.expires) otpStore.delete(k);
}, 15 * 60_000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalisePhone(raw: string): string {
  // Strip spaces/dashes, convert 08xx → 628xx
  let p = raw.replace(/[\s\-().]/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p.startsWith("62")) p = "62" + p;
  return p;
}

async function sendWaOtp(phone: string, otp: string): Promise<void> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) throw new Error("FONNTE_TOKEN not set");

  const message =
    `*DokumenProyek.com*\n\nKode verifikasi Anda:\n\n` +
    `*${otp}*\n\nBerlaku 10 menit. Jangan bagikan ke siapapun.`;

  const body = new URLSearchParams({ target: phone, message });
  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json() as any;
  if (!data.status) {
    throw new Error(`Fonnte error: ${JSON.stringify(data)}`);
  }
}

export function setupFonnte(app: Express) {
  if (!process.env.FONNTE_TOKEN) {
    console.warn("[Auth] FONNTE_TOKEN not set — WhatsApp OTP disabled.");
  }

  // POST /api/auth/wa-otp/send
  app.post("/api/auth/wa-otp/send", async (req, res) => {
    const { phone } = req.body as { phone?: string };

    if (!phone || phone.trim().length < 9) {
      return res.status(400).json({ error: "Nomor WhatsApp tidak valid." });
    }
    if (!process.env.FONNTE_TOKEN) {
      return res.status(503).json({ error: "WhatsApp OTP belum dikonfigurasi." });
    }

    const normalised = normalisePhone(phone.trim());

    const existing = otpStore.get(normalised);
    if (existing && existing.expires > Date.now() + 9 * 60_000) {
      return res.status(429).json({ error: "OTP sudah dikirim. Tunggu 1 menit sebelum meminta ulang." });
    }

    const otp = generateOTP();
    otpStore.set(normalised, { otp, expires: Date.now() + 10 * 60_000 });

    try {
      await sendWaOtp(normalised, otp);
      return res.json({ ok: true });
    } catch (err) {
      console.error("[WA OTP] Send error:", err);
      otpStore.delete(normalised);
      return res.status(500).json({ error: "Gagal mengirim pesan WhatsApp. Cek konfigurasi Fonnte." });
    }
  });

  // POST /api/auth/wa-otp/verify
  app.post("/api/auth/wa-otp/verify", async (req, res) => {
    const { phone, otp } = req.body as { phone?: string; otp?: string };

    if (!phone || !otp) {
      return res.status(400).json({ error: "Nomor WA dan kode OTP diperlukan." });
    }

    const normalised = normalisePhone(phone.trim());
    const entry = otpStore.get(normalised);

    if (!entry || Date.now() > entry.expires) {
      return res.status(400).json({ error: "Kode OTP tidak valid atau sudah kedaluwarsa." });
    }
    if (entry.otp !== String(otp).trim()) {
      return res.status(400).json({ error: "Kode OTP salah. Periksa kembali pesan WhatsApp Anda." });
    }

    otpStore.delete(normalised);

    try {
      // Look up or create user by phone (stored as pseudo-email)
      const pseudoEmail = `wa:${normalised}`;
      const [existing] = await db.select().from(users).where(eq(users.id, `phone:${normalised}`));
      const userId = existing?.id || `phone:${normalised}`;

      await authStorage.upsertUser({ id: userId, email: pseudoEmail });
      const [dbUser] = await db.select().from(users).where(eq(users.id, userId));

      const sessionUser = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        profileImageUrl: dbUser.profileImageUrl,
        provider: "whatsapp",
        phone: normalised,
      };

      (req as any).login(sessionUser, (err: any) => {
        if (err) return res.status(500).json({ error: "Gagal membuat sesi." });
        const returnTo = (req.session as any).returnTo || "/";
        delete (req.session as any).returnTo;
        return res.json({ ok: true, redirectTo: returnTo });
      });
    } catch (err) {
      console.error("[WA OTP] Verify error:", err);
      return res.status(500).json({ error: "Terjadi kesalahan server." });
    }
  });
}
