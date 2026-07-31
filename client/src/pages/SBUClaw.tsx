import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft, Loader2, CheckCircle2, Shield, Zap,
  Building2, FileCheck, Target, FileText, ArrowRight, Lock,
  History, Trash2, Plus, MessageCircle, AlertTriangle, TrendingUp,
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
  { id: 0, label: "Data Perusahaan", icon: Building2,  desc: "Profil & kualifikasi" },
  { id: 1, label: "Cek Kelengkapan", icon: FileCheck,  desc: "AI periksa persyaratan" },
  { id: 2, label: "Strategi",        icon: Target,     desc: "Rencana pengajuan" },
  { id: 3, label: "Draft Dokumen",   icon: FileText,   desc: "Dokumen siap pakai" },
];

interface CompanyInput {
  namaPerusahaan: string; npwp: string; jenisUsaha: string;
  subklasifikasi: string; kualifikasi: string; pengalaman: string; kendala: string;
}

interface PipelineSession {
  id: number;
  title: string;
  stage: number;
  inputData: string;
  results: string;
  updatedAt: string;
}

const DEFAULT_INPUT: CompanyInput = {
  namaPerusahaan: "", npwp: "", jenisUsaha: "jasa_pelaksana", subklasifikasi: "", kualifikasi: "K1", pengalaman: "", kendala: "",
};

export default function SBUClaw() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stage, setStage]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<PipelineSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [results, setResults] = useState<Record<number, string>>({});
  const [input, setInput] = useState<CompanyInput>(DEFAULT_INPUT);

  const sessionIdRef = useRef<number | null>(null);
  sessionIdRef.current = sessionId;

  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/pipeline-sessions?type=sbu", { credentials: "include" });
      if (res.ok) setSessions(await res.json());
    } finally {
      setSessionsLoading(false);
    }
  };

  const saveProgress = async (
    newStage: number,
    newResults: Record<number, string>,
    newInput: CompanyInput,
    currentSessionId: number | null
  ) => {
    setSaving(true);
    try {
      const title = newInput.namaPerusahaan || "SBUClaw Baru";
      const payload = {
        stage: newStage,
        inputData: JSON.stringify(newInput),
        results: JSON.stringify(newResults),
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
          body: JSON.stringify({ pipelineType: "sbu", ...payload }),
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
    setGateOpen(false);
    setSessionId(null);
    setShowHistory(false);
  };

  const callAI = async (targetStage: number) => {
    setLoading(true); setGateOpen(false);
    try {
      const res = await fetch("/api/sbu-claw/analyze", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage, input, previousResults: results }),
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
      await saveProgress(targetStage, newResults, input, sessionIdRef.current);
    } catch (err: any) {
      toast({ title: "Gagal menganalisis", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!user) {
    const WA = "https://wa.me/6281287941900?text=Halo%2C+saya+tertarik+dengan+SBUClaw.+Bisa+info+lebih+lanjut%3F";
    const FEATURES = [
      { icon: Building2,  label: "Profil & Kualifikasi",  desc: "Input data BUJK, NPWP, subklasifikasi — AI memetakan kesiapan pengajuan SBU Anda." },
      { icon: FileCheck,  label: "Cek Kelengkapan AI",    desc: "Sistem AI memeriksa seluruh persyaratan LPJK dan menandai dokumen yang kurang." },
      { icon: Target,     label: "Strategi Pengajuan",    desc: "Jalur paling cepat dan aman untuk mengajukan SBU sesuai kualifikasi perusahaan." },
      { icon: FileText,   label: "Draft Dokumen",         desc: "Dokumen pendukung pengajuan SBU siap pakai — tinggal dilengkapi dan disubmit." },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300 text-xs font-semibold tracking-wide uppercase">Pipeline AI · by Gustafta</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              SBU Kedaluwarsa<br />
              <span className="text-green-400">= Gugur di Tender.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              SBUClaw memandu pipeline 4-tahap persiapan SBU LPJK — dari cek kelengkapan
              dokumen hingga draft pengajuan — sehingga tidak ada yang terlewat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WA} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 w-full sm:w-auto h-12 px-8">
                  <MessageCircle className="w-4 h-4" />Hubungi via WhatsApp
                </Button>
              </a>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-green-500/40 text-green-300 hover:bg-green-500/10 font-semibold gap-2 w-full sm:w-auto h-12 px-8">
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
                  <s.icon className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-medium text-slate-300">{s.label}</span>
                </div>
                {i < STAGES.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-600" />}
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {FEATURES.map((f) => (
              <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-green-500/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                  <f.icon className="w-4.5 h-4.5 text-green-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{f.label}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Akses SBUClaw</h2>
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
                <Button variant="outline" className="border-green-500/40 text-green-300 hover:bg-green-500/10 gap-2 h-11 px-7">
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
      <div className="border-b bg-white dark:bg-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <Link href="/dashboard"><Button variant="ghost" size="sm" className="gap-1 text-muted-foreground"><ChevronLeft className="w-4 h-4" />Dashboard</Button></Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Shield className="w-4 h-4 text-green-600" /></div>
            <div>
              <h1 className="text-sm font-semibold">SBUClaw</h1>
              <p className="text-xs text-muted-foreground">Pipeline AI · Cek Kelengkapan → Strategi → Draft</p>
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

      <div className="max-w-4xl mx-auto w-full p-4 flex flex-col gap-5">
        {/* History panel */}
        {showHistory && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><History className="w-4 h-4" />Riwayat Analisis SBU</h3>
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
                      {s.stage >= 3 && <Badge className="text-xs bg-green-100 text-green-700 shrink-0">Selesai</Badge>}
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

        {/* Stepper */}
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center gap-1 flex-1 ${i <= stage ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${i < stage ? "bg-primary border-primary text-primary-foreground" : i === stage ? "bg-primary/10 border-primary text-primary" : "bg-white dark:bg-slate-800 border-border text-muted-foreground"}`}>
                  {i < stage ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && <div className={`h-0.5 flex-1 mx-1 rounded ${i < stage ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Form */}
        {stage === 0 && (
          <Card><CardContent className="p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-green-500" />Data Perusahaan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Nama Perusahaan *</Label><Input value={input.namaPerusahaan} onChange={e => setInput(p => ({ ...p, namaPerusahaan: e.target.value }))} placeholder="PT / CV ..." /></div>
              <div className="space-y-1.5"><Label>NPWP</Label><Input value={input.npwp} onChange={e => setInput(p => ({ ...p, npwp: e.target.value }))} placeholder="XX.XXX.XXX.X-XXX.XXX" /></div>
              <div className="space-y-1.5"><Label>Jenis Usaha</Label>
                <Select value={input.jenisUsaha} onValueChange={v => setInput(p => ({ ...p, jenisUsaha: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jasa_pelaksana">Jasa Pelaksana (Kontraktor)</SelectItem>
                    <SelectItem value="jasa_perencana">Jasa Perencana/Pengawas (Konsultan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Kualifikasi Target</Label>
                <Select value={input.kualifikasi} onValueChange={v => setInput(p => ({ ...p, kualifikasi: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "K1", l: "K1 — Kecil 1 (s.d. Rp 2M)" },
                      { v: "K2", l: "K2 — Kecil 2 (s.d. Rp 7,5M)" },
                      { v: "K3", l: "K3 — Kecil 3 (s.d. Rp 15M)" },
                      { v: "M",  l: "Menengah (s.d. Rp 50M)" },
                      { v: "B",  l: "Besar (di atas Rp 50M)" },
                    ].map(k => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Subklasifikasi / Bidang Pekerjaan *</Label><Input value={input.subklasifikasi} onChange={e => setInput(p => ({ ...p, subklasifikasi: e.target.value }))} placeholder="e.g. BG007 Jasa Pelaksana Bangunan Gedung" /></div>
            </div>
            <div className="space-y-1.5"><Label>Pengalaman Proyek (ringkas)</Label><Textarea value={input.pengalaman} onChange={e => setInput(p => ({ ...p, pengalaman: e.target.value }))} placeholder="Sebutkan proyek-proyek relevan yang pernah dikerjakan..." rows={2} /></div>
            <div className="space-y-1.5"><Label>Kendala / Pertanyaan Spesifik</Label><Textarea value={input.kendala} onChange={e => setInput(p => ({ ...p, kendala: e.target.value }))} placeholder="Apa yang paling membingungkan dalam proses SBU Anda?" rows={2} /></div>
            <div className="flex justify-end">
              <Button onClick={() => callAI(1)} disabled={!input.namaPerusahaan || !input.subklasifikasi || loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}Cek Kelengkapan
              </Button>
            </div>
          </CardContent></Card>
        )}

        {[1,2,3].map(s => stage >= s && results[s] && (
          <Card key={s} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                {s === 1 && <><FileCheck className="w-4 h-4 text-blue-500" />Cek Kelengkapan SBU</>}
                {s === 2 && <><Target className="w-4 h-4 text-green-500" />Strategi Pengajuan</>}
                {s === 3 && <><FileText className="w-4 h-4 text-violet-500" />Draft Dokumen</>}
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{results[s]}</ReactMarkdown></div>
              {stage === s && gateOpen && s < 3 && (
                <div className="mt-4 flex items-center gap-3 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" />Tinjau hasil — klik untuk lanjut</div>
                  <Button size="sm" onClick={() => callAI(s + 1)} disabled={loading} className="ml-auto gap-2">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    {s === 1 ? "Susun Strategi" : "Buat Draft Dokumen"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {loading && <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">AI sedang menganalisis...</span></div>}
        {stage >= 3 && !loading && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={startNew}>Analisis Perusahaan Lain</Button>
          </div>
        )}
      </div>
    </div>
  );
}
