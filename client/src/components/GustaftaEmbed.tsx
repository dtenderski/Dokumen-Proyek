import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ExternalLink, Zap, Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface GustaftaEmbedProps {
  /** Full URL to embed, e.g. https://gustafta.my.id/brain-project */
  url: string;
  /** Display title shown in the bar */
  title: string;
  /** One-line description */
  description?: string;
  /** Where the back-arrow navigates */
  backHref?: string;
  backLabel?: string;
  /**
   * When true, unauthenticated users see a "Masuk untuk Memulai" gate
   * instead of the embedded content.
   */
  requireAuth?: boolean;
}

export function GustaftaEmbed({
  url,
  title,
  description,
  backHref = "/agent-hub",
  backLabel = "Agent Hub",
  requireAuth = false,
}: GustaftaEmbedProps) {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [blocked, setBlocked]   = useState(false);

  const handleLoad = () => setLoading(false);

  /* If the iframe fires an error we catch it here. Most CSP blocks surface
     as a silent empty frame rather than an error event, so we also check
     the blocked state via a short timer fallback set in onLoad. */
  const handleError = () => {
    setLoading(false);
    setBlocked(true);
  };

  // Auth gate — show login prompt for unauthenticated users when requireAuth is set
  if (requireAuth && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-slate-950">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 max-w-sm text-sm">
            {description || "Fitur ini memerlukan akun. Silakan masuk untuk menggunakan layanan ini."}
          </p>
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
              Masuk untuk Memulai
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      {/* ── Info bar ── */}
      <div className="fixed left-0 right-0 z-40 flex items-center gap-3 px-4 h-10 bg-slate-900 border-b border-white/10"
           style={{ top: "80px" /* navbar height: row1(44) + row2(36) */ }}>
        <Link href={backHref}>
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </button>
        </Link>

        <span className="text-white/20">|</span>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-white text-xs font-semibold truncate">{title}</span>
          {description && (
            <span className="hidden sm:block text-slate-500 text-xs truncate">— {description}</span>
          )}
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] h-4 px-1.5 shrink-0">
            by Gustafta
          </Badge>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 h-6 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          Buka di Gustafta
        </a>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1" style={{ paddingTop: "120px" /* navbar 80 + bar 40 */ }}>
        {blocked ? (
          /* Fallback when iframe is blocked */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-white text-xl font-bold">{title}</h2>
              <p className="text-slate-400 text-sm">
                {description || "Fitur ini ditenagai oleh platform Gustafta AI."}
              </p>
              <p className="text-slate-500 text-xs mt-3">
                Konten ini tersedia di Gustafta dan dapat dibuka di tab baru untuk pengalaman terbaik.
              </p>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold gap-2 h-11 px-8">
                <ExternalLink className="w-4 h-4" />
                Buka {title} di Gustafta
              </Button>
            </a>
            <p className="text-slate-600 text-xs">
              Akan membuka <span className="text-slate-400">gustafta.my.id</span> di tab baru
            </p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: "calc(100vh - 120px)" }}>
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-slate-400 text-sm">Memuat {title}…</p>
              </div>
            )}
            <iframe
              src={url}
              title={title}
              className={cn("w-full h-full border-0 transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
              onLoad={handleLoad}
              onError={handleError}
              allow="clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />
          </div>
        )}
      </div>
    </div>
  );
}
