import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type LoginMethod = "email" | "whatsapp";
type Step = "method" | "input" | "otp" | "success";

interface AuthConfig {
  google: boolean;
  email: boolean;
  whatsapp: boolean;
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [activeMethod, setActiveMethod] = useState<LoginMethod>("email");
  const [step, setStep] = useState<Step>("method");

  const [contact, setContact] = useState(""); // email or phone
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Fetch which auth methods are enabled
  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({ google: false, email: true, whatsapp: false }));
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      const params = new URLSearchParams(window.location.search);
      navigate(params.get("returnTo") || "/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show error from query string (e.g. google_failed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_failed") {
      setError("Login Google gagal. Coba lagi atau gunakan metode lain.");
    }
  }, []);

  if (isLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  const hasOtpMethods = config.email || config.whatsapp;

  // ── Google Login ──────────────────────────────────────────────────────────
  function handleGoogleLogin() {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("returnTo") || "";
    window.location.href = returnTo
      ? `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`
      : "/api/auth/google";
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");

    if (!contact.trim()) {
      setError(activeMethod === "email" ? "Masukkan alamat email Anda." : "Masukkan nomor WhatsApp Anda.");
      return;
    }

    setBusy(true);
    const endpoint = activeMethod === "email"
      ? "/api/auth/email-otp/send"
      : "/api/auth/wa-otp/send";
    const body = activeMethod === "email"
      ? { email: contact.trim().toLowerCase() }
      : { phone: contact.trim() };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim OTP.");
      } else {
        const dest = activeMethod === "email"
          ? `Kode dikirim ke ${contact}. Cek folder Spam jika tidak muncul.`
          : `Kode dikirim ke WhatsApp ${contact}.`;
        setInfo(dest);
        setStep("otp");
      }
    } catch {
      setError("Koneksi gagal. Periksa internet Anda.");
    } finally {
      setBusy(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Masukkan 6 digit kode yang diterima.");
      return;
    }

    setBusy(true);
    const endpoint = activeMethod === "email"
      ? "/api/auth/email-otp/verify"
      : "/api/auth/wa-otp/verify";
    const body = activeMethod === "email"
      ? { email: contact.trim().toLowerCase(), otp: otp.trim() }
      : { phone: contact.trim(), otp: otp.trim() };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verifikasi gagal.");
      } else {
        setStep("success");
        setTimeout(() => { window.location.href = data.redirectTo || "/"; }, 1200);
      }
    } catch {
      setError("Koneksi gagal. Periksa internet Anda.");
    } finally {
      setBusy(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    setError(""); setOtp(""); setBusy(true);
    const endpoint = activeMethod === "email" ? "/api/auth/email-otp/send" : "/api/auth/wa-otp/send";
    const body = activeMethod === "email"
      ? { email: contact.trim().toLowerCase() }
      : { phone: contact.trim() };
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Gagal mengirim ulang.");
      else setInfo("Kode baru telah dikirim.");
    } catch { setError("Koneksi gagal."); }
    finally { setBusy(false); }
  }

  function switchMethod(m: LoginMethod) {
    setActiveMethod(m);
    setContact(""); setOtp(""); setError(""); setInfo("");
  }

  const isEmail = activeMethod === "email";
  const inputLabel = isEmail ? "Alamat Email" : "Nomor WhatsApp";
  const inputPlaceholder = isEmail ? "nama@perusahaan.com" : "08xx-xxxx-xxxx";
  const inputType = isEmail ? "email" : "tel";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              Dokumen<span className="text-amber-400">Proyek</span><span className="text-white">.com</span>
            </span>
          </a>
          <p className="mt-1.5 text-slate-400 text-sm">Platform Dokumen Usaha Konstruksi #1 Indonesia</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* SUCCESS */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white font-semibold text-lg">Berhasil masuk!</p>
              <p className="text-slate-400 text-sm">Mengalihkan ke dashboard…</p>
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin mt-1" />
            </div>
          )}

          {/* METHOD SELECTION */}
          {step === "method" && (
            <>
              <h1 className="text-white font-bold text-xl mb-1">Masuk ke akun Anda</h1>
              <p className="text-slate-400 text-sm mb-6">Pilih metode masuk yang Anda inginkan</p>

              {error && <ErrorBox message={error} className="mb-4" />}

              {/* Google */}
              {config.google && (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 h-11 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-colors text-sm shadow"
                  >
                    <GoogleIcon />
                    Masuk dengan Google
                  </button>
                  {hasOtpMethods && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-slate-500 text-xs">atau</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  )}
                </>
              )}

              {/* OTP method tabs */}
              {hasOtpMethods && (
                <div className="space-y-2.5">
                  {config.email && (
                    <button
                      onClick={() => { setError(""); setStep("input"); setActiveMethod("email"); }}
                      className="w-full flex items-center justify-center gap-2.5 h-11 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4 text-amber-400" />
                      Masuk dengan Email OTP
                    </button>
                  )}
                  {config.whatsapp && (
                    <button
                      onClick={() => { setError(""); setStep("input"); setActiveMethod("whatsapp"); }}
                      className="w-full flex items-center justify-center gap-2.5 h-11 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      Masuk dengan WhatsApp OTP
                    </button>
                  )}
                </div>
              )}

              <p className="mt-6 text-center text-slate-600 text-xs">
                Dengan masuk, Anda menyetujui{" "}
                <a href="/syarat-ketentuan" className="text-amber-500 hover:underline">Syarat & Ketentuan</a>{" "}
                dan <a href="/kebijakan-privasi" className="text-amber-500 hover:underline">Kebijakan Privasi</a>.
              </p>
            </>
          )}

          {/* INPUT STEP */}
          {step === "input" && (
            <>
              <button
                onClick={() => { setStep("method"); setError(""); setInfo(""); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>

              {/* Method switcher (only show if both available) */}
              {config.email && config.whatsapp && (
                <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
                  {(["email", "whatsapp"] as LoginMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMethod(m)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors",
                        activeMethod === m
                          ? "bg-amber-500 text-slate-900"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      )}
                    >
                      {m === "email"
                        ? <><Mail className="w-3.5 h-3.5" /> Email</>
                        : <><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</>
                      }
                    </button>
                  ))}
                </div>
              )}

              <h1 className="text-white font-bold text-xl mb-1">
                {isEmail ? "Masuk dengan Email" : "Masuk dengan WhatsApp"}
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                {isEmail
                  ? "Kami akan mengirim kode 6 digit ke email Anda"
                  : "Kami akan mengirim kode 6 digit via WhatsApp"}
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">{inputLabel}</label>
                  <Input
                    type={inputType}
                    placeholder={inputPlaceholder}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    autoFocus autoComplete={isEmail ? "email" : "tel"}
                    className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500 h-11 focus:border-amber-500/50"
                  />
                </div>
                {error && <ErrorBox message={error} />}
                <Button type="submit" disabled={busy}
                  className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl">
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengirim…</> : "Kirim Kode OTP"}
                </Button>
              </form>
            </>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <>
              <button
                onClick={() => { setStep("input"); setError(""); setInfo(""); setOtp(""); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {isEmail ? "Ganti email" : "Ganti nomor"}
              </button>

              <h1 className="text-white font-bold text-xl mb-1">
                {isEmail ? "Cek email Anda" : "Cek WhatsApp Anda"}
              </h1>
              <p className="text-slate-400 text-sm mb-1">Kode 6 digit dikirim ke</p>
              <p className="text-amber-400 text-sm font-semibold mb-5 truncate">{contact}</p>

              {info && (
                <div className="mb-4 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-emerald-400 text-sm">{info}</p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">Kode OTP</label>
                  <Input
                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus autoComplete="one-time-code"
                    className="bg-slate-800 border-white/10 text-white placeholder:text-slate-600 h-14 text-center text-2xl font-bold tracking-[0.4em] focus:border-amber-500/50"
                  />
                </div>
                {error && <ErrorBox message={error} />}
                <Button type="submit" disabled={busy || otp.length !== 6}
                  className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl disabled:opacity-50">
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Memverifikasi…</> : "Verifikasi & Masuk"}
                </Button>
              </form>

              <button onClick={handleResend} disabled={busy}
                className="mt-4 w-full text-center text-slate-500 hover:text-slate-300 text-sm transition-colors disabled:opacity-50">
                Tidak menerima? <span className="text-amber-500">Kirim ulang</span>
              </button>
              <p className="mt-2 text-center text-slate-600 text-xs">Kode berlaku 10 menit</p>
            </>
          )}

        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Kembali ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3", className)}>
      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}
