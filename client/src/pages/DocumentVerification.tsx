import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Shield, QrCode, CheckCircle, XCircle, FileText,
  Calendar, Building2, User, Search, Clock, History, Loader2, AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DocumentVerification as DVType } from "@shared/schema";

const DOC_TYPES = [
  { value: "sbu", label: "SBU (Sertifikat Badan Usaha)" },
  { value: "skk", label: "SKK (Sertifikat Kompetensi Kerja)" },
  { value: "nib", label: "NIB (Nomor Induk Berusaha)" },
  { value: "npwp", label: "NPWP Badan Usaha" },
  { value: "kontrak", label: "Kontrak/SPK" },
  { value: "lainnya", label: "Dokumen Lainnya" },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; text: string; icon: any }> = {
  pending: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", text: "Sedang Diverifikasi", icon: Clock },
  verified: { color: "text-green-700", bg: "bg-green-50 border-green-200", text: "Dokumen Terverifikasi", icon: CheckCircle },
  not_found: { color: "text-red-700", bg: "bg-red-50 border-red-200", text: "Dokumen Tidak Ditemukan", icon: XCircle },
  expired: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", text: "Dokumen Kedaluwarsa", icon: AlertCircle },
  invalid: { color: "text-red-700", bg: "bg-red-50 border-red-200", text: "Dokumen Tidak Valid", icon: XCircle },
};

export default function DocumentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [docType, setDocType] = useState("sbu");
  const [docNumber, setDocNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [notes, setNotes] = useState("");
  const [lastResult, setLastResult] = useState<DVType | null>(null);
  const [pollingId, setPollingId] = useState<number | null>(null);

  // History for authenticated users
  const { data: history = [], refetch: refetchHistory } = useQuery<DVType[]>({
    queryKey: ["/api/verifications"],
    enabled: !!user,
  });

  // Poll result of a pending verification every 2 seconds
  const { data: polledResult } = useQuery<DVType>({
    queryKey: ["/api/verifications", pollingId],
    enabled: !!pollingId,
    refetchInterval: (data: any) => {
      if (data?.status === "pending") return 2000;
      return false;
    },
  });

  // Merge polled result into lastResult
  const displayResult = polledResult || lastResult;
  if (polledResult && polledResult.status !== "pending" && pollingId) {
    if (lastResult?.id === polledResult.id && lastResult?.status === "pending") {
      setTimeout(() => {
        setLastResult(polledResult);
        setPollingId(null);
        refetchHistory();
      }, 100);
    }
  }

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        documentType: docType,
        documentNumber: docNumber.trim(),
        holderName: holderName.trim(),
        requestNotes: notes.trim() || undefined,
      };
      if (user) payload.userId = user.id;
      const res = await apiRequest("POST", "/api/verifications", payload);
      return res.json() as Promise<DVType>;
    },
    onSuccess: (data) => {
      setLastResult(data);
      if (data.status === "pending") {
        setPollingId(data.id);
      }
      toast({ title: "Permintaan verifikasi dikirim", description: "Hasil akan muncul dalam beberapa detik." });
      refetchHistory();
    },
    onError: (err: any) => {
      toast({ title: "Gagal mengirim verifikasi", description: err.message, variant: "destructive" });
    },
  });

  function handleVerify() {
    if (!docNumber.trim() || !holderName.trim()) return;
    setLastResult(null);
    setPollingId(null);
    verifyMutation.mutate();
  }

  function reset() {
    setLastResult(null);
    setPollingId(null);
    setDocNumber("");
    setHolderName("");
    setNotes("");
  }

  const result = displayResult;
  const statusCfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.pending) : null;
  const StatusIcon = statusCfg?.icon ?? Clock;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Verifikasi Dokumen</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <QrCode className="w-3 h-3 mr-1" />
            Sistem Verifikasi
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Form Verifikasi */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Verifikasi Keaslian Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Masukkan detail dokumen yang ingin diverifikasi keasliannya melalui sistem kami.
            </p>

            <div className="space-y-2">
              <Label htmlFor="docType">Jenis Dokumen</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger id="docType" data-testid="select-doc-type">
                  <SelectValue placeholder="Pilih jenis dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docNumber">Nomor Dokumen</Label>
              <Input
                id="docNumber"
                placeholder="Contoh: SBU-K2-2025-001234"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                data-testid="input-document-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holderName">Nama Pemegang Dokumen / Perusahaan</Label>
              <Input
                id="holderName"
                placeholder="Contoh: PT Konstruksi Maju Bersama"
                value={holderName}
                onChange={e => setHolderName(e.target.value)}
                data-testid="input-holder-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
              <Input
                id="notes"
                placeholder="Contoh: Ingin verifikasi masa berlaku SBU"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                data-testid="input-notes"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={!docNumber.trim() || !holderName.trim() || verifyMutation.isPending}
              data-testid="button-verify"
            >
              {verifyMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengirim Permintaan...</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" />Verifikasi Sekarang</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Hasil Verifikasi */}
        {result && statusCfg && (
          <Card className={`mb-6 border ${statusCfg.bg}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  result.status === "verified" ? "bg-green-500" :
                  result.status === "pending" ? "bg-amber-400" : "bg-red-500"
                }`}>
                  {result.status === "pending" ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <StatusIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${statusCfg.color}`}>{statusCfg.text}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: #{result.id} &bull; {new Date(result.createdAt!).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Jenis Dokumen</p>
                    <p className="font-medium text-sm">
                      {DOC_TYPES.find(d => d.value === result.documentType)?.label ?? result.documentType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
                  <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Dokumen</p>
                    <p className="font-medium text-sm font-mono">{result.documentNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
                  <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pemegang Dokumen</p>
                    <p className="font-medium text-sm">{result.holderName}</p>
                  </div>
                </div>

                {result.verificationResult && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground mb-1">Hasil Verifikasi</p>
                    <p className="text-sm">{result.verificationResult}</p>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full mt-4" onClick={reset} data-testid="button-verify-another">
                Verifikasi Dokumen Lain
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Riwayat Verifikasi - hanya untuk user login */}
        {user && history.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5" />
                Riwayat Verifikasi Anda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.slice(0, 5).map(item => {
                const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                const Ico = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-slate-800">
                    <Ico className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.documentNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {DOC_TYPES.find(d => d.value === item.documentType)?.label ?? item.documentType} &bull; {item.holderName}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${cfg.color}`}
                      data-testid={`badge-status-${item.id}`}
                    >
                      {cfg.text}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Panduan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="w-5 h-5" />
              Cara Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {[
                "Pilih jenis dokumen yang ingin diverifikasi (SBU, SKK, NIB, NPWP, dll.)",
                "Masukkan nomor dokumen sesuai yang tertera pada sertifikat atau dokumen resmi",
                "Isi nama perusahaan/individu pemegang dokumen",
                "Klik Verifikasi — sistem akan mengecek keaslian dan masa berlaku dokumen",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Catatan:</strong> Hasil verifikasi bersifat informatif berdasarkan data yang Anda input.
                Untuk verifikasi resmi SBU/SKK, kunjungi langsung portal LPJK atau BNSP.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
