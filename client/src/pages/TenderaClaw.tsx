import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft, Loader2, ChevronRight, CheckCircle2,
  FileSearch, Target, Lightbulb, FileText, Zap,
  Lock, AlertCircle, BarChart3, ArrowRight, History, Trash2, Plus,
  MessageCircle, Shield, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";

const STAGES = [
  { id: 0, label: "Input Tender",   icon: FileSearch,   desc: "Data proyek & persyaratan" },
  { id: 1, label: "Kelayakan",      icon: BarChart3,    desc: "Analisis AI: go/no-go" },
  { id: 2, label: "Strategi",       icon: Target,       desc: "Strategi penawaran optimal" },
  { id: 3, label: "Draft Dokumen",  icon: FileText,     desc: "Dokumen siap pakai" },
];

interface TenderInput {
  namaProyek: string; nilaiHPS: string; batasWaktu: string;
  jenisTender: string; instansi: string; persyaratan: string;
}

interface PipelineSession {
  id: number;
  title: string;
  stage: number;
  inputData: string;
  results: string;
  draftType: string | null;
  updatedAt: string;
}

const DEFAULT_INPUT: TenderInput = {
  namaProyek: "", nilaiHPS: "", batasWaktu: "", jenisTender: "pengadaan_barang", instansi: "", persyaratan: "",
};

export default function TenderaClaw() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stage, setStage]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [gateOpen, setGateOpen]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions]   = useState<PipelineSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [input, setInput] = useState<TenderInput>(DEFAULT_INPUT);
  const [results, setResults] = useState<Record<number, string>>({});
  const [draftType, setDraftType] = useState("metode_pelaksanaan");

  // Auto-save ref to avoid stale closures
  const sessionIdRef = useRef<number | null>(null);
  sessionIdRef.current = sessionId;

  // Load session list on mount
  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/pipeline-sessions?type=tendera", { credentials: "include" });
      if (res.ok) setSessions(await res.json());
    } finally {
      setSessionsLoading(false);
    }
  };

  const saveProgress = async (
    newStage: number,
    newResults: Record<number, string>,
    newInput: TenderInput,
    newDraftType: string,
    currentSessionId: number | null
  ) => {
    setSaving(true);
    try {
      const title = newInput.namaProyek || "TenderaClaw Baru";
      const payload = {
        stage: newStage,
        inputData: JSON.stringify(newInput),
        results: JSON.stringify(newResults),
        draftType: newDraftType,
        title,
      };

      if (currentSessionId) {
        await fetch(`/api/pipeline-sessions/${currentSessionId}`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const res = await fetch("/api/pipeline-sessions", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pipelineType: "tendera", ...payload }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.id);
          sessionIdRef.current = data.id;
        }
      }
      await loadSessions();
    } catch {
      // silent — saving is best-effort
    } finally {
      setSaving(false);
    }
  };

  const loadSession = (s: PipelineSession) => {
    try {
      const parsedInput = JSON.parse(s.inputData);
      const parsedResults = JSON.parse(s.results);
      setInput(parsedInput);
      setResults(parsedResults);
      setStage(s.stage);
      setDraftType(s.draftType || "metode_pelaksanaan");
      setSessionId(s.id);
      // Open the gate when restoring a mid-pipeline session so the user can
      // continue to the next stage. No gate needed at stage 0 (input) or
      // stage 3 (final — pipeline complete).
      setGateOpen(s.stage > 0 && s.stage < 3);
      setShowHistory(false);
      toast({ title: "Sesi dimuat", description: `Melanjutkan: ${s.title}` });
    } catch {
      toast({ title: "Gagal memuat sesi", variant: "destructive" });
    }
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/pipeline-sessions/${id}`, { method: "DELETE", credentials: "include" });
      if (sessionId === id) startNew();
      await loadSessions();
      toast({ title: "Sesi dihapus" });
    } catch {
      toast({ title: "Gagal menghapus sesi", variant: "destructive" });
    }
  };

  const startNew = () => {
    setStage(0);
    setResults({});
    setInput(DEFAULT_INPUT);
    setDraftType("metode_pelaksanaan");
    setGateOpen(false);
    setSessionId(null);
    setShowHistory(false);
  };

  const callAI = async (targetStage: number) => {
    setLoading(true);
    setGateOpen(false);
    try {
      const res = await fetch("/api/tendera-claw/analyze", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage, input, previousResults: results, draftType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.errorCode === "quota_exceeded") throw new Error("Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.");
        if (err.errorCode === "config_error") throw new Error("Konfigurasi layanan AI tidak valid. Hubungi administrator.");
        if (err.errorCode === "server_error") throw new Error("Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.");
        throw new Error(err.message || "Gagal menganalisis");
      }
      const data = await res.json();
      const newResults = { ...results, [targetStage]: data.result };
      setResults(newResults);
      setStage(targetStage);
      setGateOpen(true);
      // Save after each AI stage completes
      await saveProgress(targetStage, newResults, input, draftType, sessionIdRef.current);
    } catch (err: any) {
      toast({ title: "Gagal menganalisis", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = input.namaProyek && input.nilaiHPS && input.instansi;

  if (!user) {
    const WA = "https://wa.me/6281287941900?text=Halo%2C+saya+tertarik+dengan+TenderaClaw.+Bisa+info+lebih+lanjut%3F";
    const FEATURES = [
      { icon: BarChart3,  label: "Analisis Kelayakan",   desc: "AI menilai go/no-go tender dalam hitungan detik — nilaiHPS, waktu, persyaratan." },
      { icon: Target,     label: "Strategi Penawaran",   desc: "Rekomendasi harga, posisi kompetitif, dan pendekatan untuk memenangkan tender." },
      { icon: FileText,   label: "Draft Dokumen Siap",   desc: "Metode pelaksanaan, jadwal, struktur organisasi — siap diedit dan disubmit." },
      { icon: TrendingUp, label: "Riwayat Pipeline",     desc: "Setiap sesi tersimpan otomatis — lanjut kapan saja, pantau progres per proyek." },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase">Pipeline AI · by Gustafta</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Analisis Tender Salah<br />
              <span className="text-amber-400">= Rugi Miliaran.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              TenderaClaw menjalankan pipeline 4-tahap — kelayakan, strategi, hingga draft dokumen —
              sehingga Anda masuk tender dengan persiapan penuh, bukan spekulasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WA} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 w-full sm:w-auto h-12 px-8">
                  <MessageCircle className="w-4 h-4" />Hubungi via WhatsApp
                </Button>
              </a>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold gap-2 w-full sm:w-auto h-12 px-8">
                  <Zap className="w-4 h-4" />Daftar &amp; Coba Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5">
                  <s.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">{s.label}</span>
                </div>
                {i < STAGES.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-600" />}
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {FEATURES.map((f) => (
              <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <f.icon className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{f.label}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8 text-center">
            <Shield className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Akses TenderaClaw</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Tersedia untuk pengguna terdaftar. Hubungi tim kami untuk info paket dan harga.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WA} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 h-11 px-7">
                  <MessageCircle className="w-4 h-4" />Tanya via WhatsApp
                </Button>
              </a>
              <Link href="/auth">
                <Button variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-2 h-11 px-7">
                  <ArrowRight className="w-4 h-4" />Masuk / Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Navbar />
      {/* Header */}
      <div className="border-b bg-white dark:bg-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
          <Link href="/dashboard"><Button variant="ghost" size="sm" className="gap-1 text-muted-foreground"><ChevronLeft className="w-4 h-4" />Dashboard</Button></Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">TenderaClaw</h1>
              <p className="text-xs text-muted-foreground">Pipeline AI · Analisis → Strategi → Draft</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Menyimpan...</span>}
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowHistory(v => !v)}>
              <History className="w-3.5 h-3.5" />{showHistory ? "Tutup" : "Riwayat"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={startNew}>
              <Plus className="w-3.5 h-3.5" />Baru
            </Button>
            <Badge variant="outline" className="text-xs gap-1"><Zap className="w-3 h-3 text-amber-500" />Gustafta CLAW</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-6">
        {/* History panel */}
        {showHistory && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><History className="w-4 h-4" />Riwayat Analisis</h3>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat analisis.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => loadSession(s)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${s.id === sessionId ? "border-primary bg-primary/5" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Tahap {s.stage} / 3 · {new Date(s.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {s.stage >= 3 && <Badge className="text-xs bg-violet-100 text-violet-700 shrink-0">Selesai</Badge>}
                      <Button
                        variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => deleteSession(s.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stage stepper */}
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1 flex-1 ${i <= stage ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  i < stage ? "bg-primary border-primary text-primary-foreground"
                  : i === stage ? "bg-primary/10 border-primary text-primary"
                  : "bg-white dark:bg-slate-800 border-border text-muted-foreground"
                }`}>
                  {i < stage ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded ${i < stage ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Stage 0: Form input */}
        {stage === 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><FileSearch className="w-4 h-4 text-amber-500" />Data Tender</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama Proyek / Paket *</Label>
                  <Input value={input.namaProyek} onChange={e => setInput(p => ({ ...p, namaProyek: e.target.value }))} placeholder="e.g. Pembangunan Gedung Kantor Dinas..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Nilai HPS (Rp) *</Label>
                  <Input value={input.nilaiHPS} onChange={e => setInput(p => ({ ...p, nilaiHPS: e.target.value }))} placeholder="e.g. 5.000.000.000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Instansi Pengguna Jasa *</Label>
                  <Input value={input.instansi} onChange={e => setInput(p => ({ ...p, instansi: e.target.value }))} placeholder="e.g. Dinas PU Kota Bandung" />
                </div>
                <div className="space-y-1.5">
                  <Label>Batas Akhir Penawaran</Label>
                  <Input type="date" value={input.batasWaktu} onChange={e => setInput(p => ({ ...p, batasWaktu: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Jenis Pengadaan</Label>
                  <Select value={input.jenisTender} onValueChange={v => setInput(p => ({ ...p, jenisTender: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pengadaan_barang">Pengadaan Barang</SelectItem>
                      <SelectItem value="jasa_konsultansi">Jasa Konsultansi</SelectItem>
                      <SelectItem value="pekerjaan_konstruksi">Pekerjaan Konstruksi</SelectItem>
                      <SelectItem value="jasa_lainnya">Jasa Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Persyaratan & Kualifikasi (opsional)</Label>
                <Textarea value={input.persyaratan} onChange={e => setInput(p => ({ ...p, persyaratan: e.target.value }))} placeholder="e.g. SBU GD 007, SKK Ahli Madya, Pengalaman min. 3 proyek sejenis, ISO 9001..." rows={3} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => callAI(1)} disabled={!canSubmit || loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                  Analisis Kelayakan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage 1+: AI Results */}
        {stage >= 1 && results[1] && (
          <ResultCard
            stageNum={1} title="Analisis Kelayakan" icon={BarChart3} color="blue"
            content={results[1]} isActive={stage === 1}
            gate={stage === 1 && gateOpen}
            onNext={() => callAI(2)} nextLabel="Susun Strategi Penawaran"
            loading={loading && stage === 1}
          />
        )}
        {stage >= 2 && results[2] && (
          <ResultCard
            stageNum={2} title="Strategi Penawaran" icon={Target} color="green"
            content={results[2]} isActive={stage === 2}
            gate={stage === 2 && gateOpen}
            onNext={() => callAI(3)} nextLabel="Buat Draft Dokumen"
            loading={loading && stage === 2}
            extraBefore={stage === 2 && gateOpen ? (
              <div className="flex items-center gap-3 mt-3">
                <Label className="text-xs">Draft yang ingin dibuat:</Label>
                <Select value={draftType} onValueChange={setDraftType}>
                  <SelectTrigger className="w-56 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metode_pelaksanaan">Metode Pelaksanaan</SelectItem>
                    <SelectItem value="jadwal_pelaksanaan">Jadwal Pelaksanaan</SelectItem>
                    <SelectItem value="rencana_k3">Rencana K3 Konstruksi</SelectItem>
                    <SelectItem value="surat_penawaran">Surat Penawaran Harga</SelectItem>
                    <SelectItem value="daftar_personil">Daftar Personil Inti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          />
        )}
        {stage >= 3 && results[3] && (
          <ResultCard
            stageNum={3} title="Draft Dokumen" icon={FileText} color="violet"
            content={results[3]} isActive={stage === 3}
            gate={false}
            loading={loading && stage === 3}
            finalBadge
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Gustafta AI sedang menganalisis...</span>
          </div>
        )}

        {stage >= 3 && !loading && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={startNew}>
              Analisis Tender Baru
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ stageNum, title, icon: Icon, color, content, isActive, gate, onNext, nextLabel, loading, extraBefore, finalBadge }: any) {
  const colors: any = {
    blue:   "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10",
    green:  "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10",
    violet: "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/10",
  };
  const iconColors: any = { blue: "text-blue-600", green: "text-green-600", violet: "text-violet-600" };
  return (
    <Card className={`border ${colors[color]}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-4 h-4 ${iconColors[color]}`} />
          <span className="font-semibold text-sm">{title}</span>
          {finalBadge && <Badge className="ml-auto text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Selesai</Badge>}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {extraBefore}
        {gate && onNext && (
          <div className="mt-4 flex items-center gap-3 pt-3 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Tinjau hasil di atas — klik untuk lanjut
            </div>
            <Button size="sm" onClick={onNext} disabled={loading} className="ml-auto gap-2">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              {nextLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
