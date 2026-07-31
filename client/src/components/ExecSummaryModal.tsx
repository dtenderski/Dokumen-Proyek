import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  X, Sparkles, Loader2, Copy, Download, Check,
  FileText, FolderOpen, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ExecSummaryModalProps {
  sourceType: "project" | "document";
  sourceId: number;
  sourceName: string;
  onClose: () => void;
}

export function ExecSummaryModal({ sourceType, sourceId, sourceName, onClose }: ExecSummaryModalProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exec-summary", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType, sourceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.errorCode === "quota_exceeded") throw new Error("Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.");
        if (err.errorCode === "config_error") throw new Error("Konfigurasi layanan AI tidak valid. Hubungi administrator.");
        if (err.errorCode === "server_error") throw new Error("Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.");
        throw new Error(err.message || "Gagal generate ringkasan");
      }
      const data = await res.json();
      setSummary(data.summary);
      setGeneratedAt(data.generatedAt);
    } catch (err: any) {
      toast({ title: "Gagal generate ringkasan", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: "Ringkasan disalin ke clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Exec-Summary-${sourceName.replace(/[^a-zA-Z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "File berhasil diunduh" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold">Executive Summary</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {sourceType === "project"
                ? <FolderOpen className="w-3 h-3" />
                : <FileText className="w-3 h-3" />}
              <span className="truncate">{sourceName}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!summary && !loading && (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Generate Ringkasan Eksekutif</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  AI akan menganalisis {sourceType === "project" ? "data proyek, riwayat update, dan transaksi keuangan" : "isi dokumen"} lalu menyusun ringkasan satu halaman siap presentasi ke klien atau owner.
                </p>
              </div>
              <Button onClick={generate} className="gap-2 px-6">
                <Sparkles className="w-4 h-4" />
                Generate Sekarang
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-violet-500 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold">Menyusun ringkasan eksekutif...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI sedang menganalisis dan menyusun dokumen
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {summary && !loading && (
            <div>
              {/* Summary content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>

              {/* Footer meta */}
              <div className="mt-5 pt-4 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Gustafta Framework · OpenClaw AI (GPT-4o)</span>
                {generatedAt && (
                  <span className="ml-auto">
                    {new Date(generatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {summary && !loading && (
          <div className="border-t px-5 py-3 flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={generate} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Generate Ulang
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Tersalin!" : "Salin"}
              </Button>
              <Button size="sm" onClick={handleDownload} className="gap-1.5">
                <Download className="w-3.5 h-3.5" /> Unduh .md
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
