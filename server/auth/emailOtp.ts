import type { Express } from "express";
import { authStorage } from "../replit_integrations/auth/storage";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

// ─── In-memory OTP store ───────────────────────────────────────────────────
// email → { otp, expires }
const otpStore = new Map<string, { otp: string; expires: number }>();

// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore) {
    if (now > entry.expires) otpStore.delete(email);
  }
}, 15 * 60_000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Send via Resend API — no IP restrictions, no SMTP needed */
async function sendOtpEmail(toEmail: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY!;
  const senderEmail = process.env.RESEND_SENDER_EMAIL || "noreply@dokumenproyek.com";

  const body = {
    from: `DokumenProyek.com <${senderEmail}>`,
    to: [toEmail],
    subject: `${otp} — Kode Verifikasi DokumenProyek.com`,
    text: `Kode verifikasi Anda: ${otp}\n\nBerlaku selama 10 menit.\nJangan bagikan kode ini ke siapapun.`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:32px auto;">
    <tr><td style="background:#0f172a;padding:32px 24px;border-radius:12px;">

      <!-- Brand -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#f8fafc;">
              Dokumen<span style="color:#f59e0b;">Proyek</span><span style="color:#f8fafc;">.com</span>
            </p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Platform Dokumen Usaha Konstruksi #1 Indonesia</p>
          </td>
        </tr>
      </table>

      <!-- OTP Box -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:28px 24px;text-align:center;">
            <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;">Kode verifikasi masuk Anda:</p>
            <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:14px;color:#f59e0b;">${otp}</p>
            <p style="margin:16px 0 0;color:#64748b;font-size:12px;">
              Berlaku selama <strong style="color:#94a3b8;">10 menit</strong>
            </p>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <p style="margin:24px 0 0;color:#475569;font-size:11px;text-align:center;line-height:1.6;">
        Jika Anda tidak meminta kode ini, abaikan email ini.<br>
        DokumenProyek.com tidak pernah meminta kode Anda melalui telepon atau chat.
      </p>

    </td></tr>
  </table>
</body>
</html>`,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Resend API error ${res.status}: ${detail}`);
  }
}

// ─── Routes ────────────────────────────────────────────────────────────────
export function setupEmailOtp(app: Express) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Auth] RESEND_API_KEY not set — Email OTP login disabled.");
  }

  // POST /api/auth/email-otp/send
  app.post("/api/auth/email-otp/send", async (req, res) => {
    const { email } = req.body as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Format email tidak valid." });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(503).json({ error: "Email OTP belum dikonfigurasi di server." });
    }

    const normalised = email.trim().toLowerCase();

    // Rate-limit: only 1 OTP per minute per email
    const existing = otpStore.get(normalised);
    if (existing && existing.expires > Date.now() + 9 * 60_000) {
      return res.status(429).json({ error: "OTP sudah dikirim. Tunggu 1 menit sebelum meminta ulang." });
    }

    const otp = generateOTP();
    otpStore.set(normalised, { otp, expires: Date.now() + 10 * 60_000 });

    try {
      await sendOtpEmail(normalised, otp);
      return res.json({ ok: true });
    } catch (err) {
      console.error("[EmailOTP] Failed to send:", err);
      otpStore.delete(normalised);
      return res.status(500).json({ error: "Gagal mengirim email. Pastikan konfigurasi SMTP sudah benar." });
    }
  });

  // POST /api/auth/email-otp/verify
  app.post("/api/auth/email-otp/verify", async (req, res) => {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email || !otp) {
      return res.status(400).json({ error: "Email dan kode OTP diperlukan." });
    }

    const normalised = email.trim().toLowerCase();
    const entry = otpStore.get(normalised);

    if (!entry || Date.now() > entry.expires) {
      return res.status(400).json({ error: "Kode OTP tidak valid atau sudah kedaluwarsa. Minta ulang kode baru." });
    }

    if (entry.otp !== String(otp).trim()) {
      return res.status(400).json({ error: "Kode OTP salah. Periksa kembali email Anda." });
    }

    // Correct — clear stored OTP
    otpStore.delete(normalised);

    try {
      // Look up by email first (unified account regardless of login method)
      let userId: string;
      const [existingByEmail] = await db.select().from(users).where(eq(users.email, normalised));

      if (existingByEmail) {
        userId = existingByEmail.id;
        // Update email-verified flag by touching updatedAt
        await authStorage.upsertUser({ id: userId, email: normalised });
      } else {
        userId = `email:${normalised}`;
        await authStorage.upsertUser({ id: userId, email: normalised });
      }

      const [dbUser] = await db.select().from(users).where(eq(users.id, userId));

      const sessionUser = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        profileImageUrl: dbUser.profileImageUrl,
        provider: "email",
      };

      (req as any).login(sessionUser, (err: any) => {
        if (err) {
          console.error("[EmailOTP] Session login error:", err);
          return res.status(500).json({ error: "Gagal membuat sesi. Coba lagi." });
        }
        const returnTo = (req.session as any).returnTo || "/";
        delete (req.session as any).returnTo;
        return res.json({ ok: true, redirectTo: returnTo });
      });
    } catch (err) {
      console.error("[EmailOTP] Verify DB error:", err);
      return res.status(500).json({ error: "Terjadi kesalahan server. Coba lagi." });
    }
  });
}
