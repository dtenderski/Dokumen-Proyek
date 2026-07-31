import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import {
  Plus, ChevronLeft, Bot, User, Send, Loader2, X,
  Stethoscope, FileText, Clock, CheckCircle2, AlertCircle,
  Sparkles, ChevronDown, ChevronUp, Flag, Trash2, RefreshCw,
  Building2, GraduationCap, ShieldCheck, Award, FolderOpen,
  MessageSquare, Brain, ShieldAlert, BookmarkPlus,
} from "lucide-react";
import type { BusinessMemoryEntry } from "./BusinessMemory";
import { MemoryFormModal } from "./BusinessMemory";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConsultationCase {
  id: number;
  title: string;
  serviceType: string;
  status: string;
  description?: string;
  aiAnalysis?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface CaseMessage {
  id: number;
  caseId: number;
  role: "user" | "ai";
  content: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: "sbu", label: "SBU Konstruksi", icon: Building2, color: "bg-blue-500" },
  { value: "skk", label: "SKK Tenaga Ahli/Terampil", icon: GraduationCap, color: "bg-violet-500" },
  { value: "legalitas", label: "Legalitas Usaha", icon: ShieldCheck, color: "bg-green-500" },
  { value: "perizinan", label: "Perizinan & OSS-RBA", icon: ShieldCheck, color: "bg-teal-500" },
  { value: "iso", label: "ISO / SMK3", icon: Award, color: "bg-amber-500" },
  { value: "tender", label: "Dokumen Tender", icon: FileText, color: "bg-orange-500" },
  { value: "proyek", label: "Dokumen Proyek", icon: FolderOpen, color: "bg-rose-500" },
  { value: "umum", label: "Konsultasi Umum", icon: MessageSquare, color: "bg-slate-500" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open:      { label: "Aktif", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Clock },
  analyzing: { label: "Dianalisis AI", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Sparkles },
  in_review: { label: "Ditinjau Tim", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", icon: RefreshCw },
  completed: { label: "Selesai", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  closed:    { label: "Ditutup", color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400", icon: X },
};

function serviceLabel(type: string) {
  return SERVICE_TYPES.find(s => s.value === type)?.label ?? type;
}
function serviceIcon(type: string) {
  const Icon = SERVICE_TYPES.find(s => s.value === type)?.icon ?? MessageSquare;
  return Icon;
}
function serviceColor(type: string) {
  return SERVICE_TYPES.find(s => s.value === type)?.color ?? "bg-slate-500";
}

// ─── Create Case Modal ────────────────────────────────────────────────────────

function CreateCaseModal({ onCreated, onClose }: { onCreated: (c: ConsultationCase) => void; onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("sbu");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/klinik/cases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), serviceType, description: description.trim(), priority }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const kasus = await res.json();
      onCreated(kasus);
      toast({ title: "Kasus berhasil dibuat" });
    } catch (err: any) {
      toast({ title: "Gagal membuat kasus", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="w-5 h-5 text-primary" /> Buka Kasus Konsultasi Baru
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Judul Kasus *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="mis. Pengurusan SBU Kontraktor Sipil M1" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Jenis Layanan *</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Deskripsi Kasus</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ceritakan kondisi usaha Anda, dokumen yang sudah dimiliki, dan apa yang ingin dicapai..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Prioritas</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={loading || !title.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Buka Kasus
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Failure detection helper ─────────────────────────────────────────────────

interface FailureSuggestion {
  category: string;
  title: string;
  description: string;
}

function detectFailurePattern(content: string): FailureSuggestion | null {
  const lower = content.toLowerCase();

  const hasFailure  = /gagal|kegagalan|ditolak|penolakan|tidak lolos|tidak lulus|tidak memenuhi|tdk memenuhi/.test(lower);
  const hasRisk     = /risiko|berisiko|waspada|perhatian|peringatan|hati-hati|ancaman/.test(lower);
  const hasExpiry   = /kadaluarsa|kedaluwarsa|expired|masa berlaku.*habis|habis masa/.test(lower);
  const hasProblem  = /masalah|kendala|hambatan|kelalaian|kesalahan|perlu diwaspadai|perlu diperhatikan/.test(lower);

  if (!hasFailure && !hasRisk && !hasExpiry && !hasProblem) return null;

  // Pick the most specific category
  let category = "lainnya";
  if (/tender|penawaran|lelang/.test(lower))                       category = "kegagalan_tender";
  else if (/kadaluarsa|kedaluwarsa|expired|masa berlaku/.test(lower)) category = "dokumen_kadaluarsa";
  else if (/\bsbu\b|sertifikat badan usaha/.test(lower))           category = "penolakan_sbu";
  else if (/\bskk\b|sertifikat kompetensi/.test(lower))            category = "penolakan_skk";
  else if (/izin|perizinan|\boss\b/.test(lower))                   category = "masalah_perizinan";
  else if (/proyek|kontrak|pekerjaan/.test(lower))                 category = "kegagalan_proyek";
  else if (/klausul|perjanjian|risiko kontrak/.test(lower))        category = "risiko_kontrak";
  else if (/vendor|mitra|subkon/.test(lower))                      category = "catatan_vendor";

  // Extract a short title from the first meaningful sentence
  const plain = content.replace(/[#*`>]/g, "").trim();
  const firstSentence = plain.split(/[.\n]/)[0].trim();
  const title = firstSentence.length > 120 ? firstSentence.slice(0, 117) + "…" : firstSentence;

  // Use a trimmed excerpt of the AI reply as description
  const description = plain.length > 600 ? plain.slice(0, 597) + "…" : plain;

  return { category, title, description };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KlinikKonsultasi() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ConsultationCase | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileCases, setShowMobileCases] = useState(false);
  const [memories, setMemories] = useState<BusinessMemoryEntry[]>([]);
  const [showMemoryBanner, setShowMemoryBanner] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Business Memory suggestion state
  const [failureSuggestions, setFailureSuggestions] = useState<Record<number, FailureSuggestion>>({});
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [memorySuggestPrefill, setMemorySuggestPrefill] = useState<FailureSuggestion | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load cases
  const loadCases = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/klinik/cases", { credentials: "include" });
      if (res.ok) setCases(await res.json());
    } catch {}
  }, [user]);

  // Load active memories for warning banner
  const loadMemories = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/memory", { credentials: "include" });
      if (res.ok) {
        const all: BusinessMemoryEntry[] = await res.json();
        setMemories(all.filter(m => m.isActive));
      }
    } catch {}
  }, [user]);

  useEffect(() => { loadCases(); loadMemories(); }, [loadCases, loadMemories]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select case → load messages
  const selectCase = async (kasus: ConsultationCase) => {
    setSelectedCase(kasus);
    setShowMobileCases(false);
    setMessages([]);
    setFailureSuggestions({});
    setDismissedSuggestions(new Set());
    try {
      const res = await fetch(`/api/klinik/cases/${kasus.id}/messages`, { credentials: "include" });
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  // Create case
  const handleCaseCreated = (kasus: ConsultationCase) => {
    setCases(prev => [kasus, ...prev]);
    setShowCreateModal(false);
    selectCase(kasus);
  };

  // Delete case
  const deleteCase = async (kasus: ConsultationCase, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/klinik/cases/${kasus.id}`, { method: "DELETE", credentials: "include" });
      setCases(prev => prev.filter(c => c.id !== kasus.id));
      if (selectedCase?.id === kasus.id) { setSelectedCase(null); setMessages([]); }
      toast({ title: "Kasus dihapus" });
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  // AI Analysis
  const runAnalysis = async () => {
    if (!selectedCase || isAnalyzing) return;
    setIsAnalyzing(true);
    setAuthError(false);
    // Update status to analyzing
    setSelectedCase(prev => prev ? { ...prev, status: "analyzing" } : prev);
    try {
      const res = await fetch(`/api/klinik/cases/${selectedCase.id}/analyze`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401 && err.errorCode === "auth_error") {
          setSelectedCase(prev => prev ? { ...prev, status: "open" } : prev);
          setAuthError(true);
          return;
        }
        if (err.errorCode === "quota_exceeded") throw new Error("Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.");
        if (err.errorCode === "config_error") throw new Error("Konfigurasi layanan AI tidak valid. Hubungi administrator.");
        if (err.errorCode === "server_error") throw new Error("Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.");
        throw new Error(err.message || "Gagal menganalisis");
      }
      const updated = await res.json();
      setSelectedCase(updated);
      setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
      setShowAnalysis(true);
      toast({ title: "Analisis AI selesai" });
    } catch (err: any) {
      setSelectedCase(prev => prev ? { ...prev, status: "open" } : prev);
      toast({ title: "Gagal menganalisis", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedCase || isLoading) return;
    const text = input.trim();
    setInput("");
    setAuthError(false);
    const optimisticMsg: CaseMessage = { id: Date.now(), caseId: selectedCase.id, role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/klinik/cases/${selectedCase.id}/messages`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401 && err.errorCode === "auth_error") {
          setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
          setAuthError(true);
          return;
        }
        if (err.errorCode === "quota_exceeded") throw new Error("Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.");
        if (err.errorCode === "config_error") throw new Error("Konfigurasi layanan AI tidak valid. Hubungi administrator.");
        if (err.errorCode === "server_error") throw new Error("Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.");
        throw new Error(err.message || "Gagal mendapat respons");
      }
      const { userMessage, aiMessage } = await res.json();
      setMessages(prev => [...prev.filter(m => m.id !== optimisticMsg.id), userMessage, aiMessage]);
      // Detect failure / risk patterns in the AI reply
      const suggestion = detectFailurePattern(aiMessage.content);
      if (suggestion) {
        setFailureSuggestions(prev => ({ ...prev, [aiMessage.id]: suggestion }));
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now(), caseId: selectedCase.id, role: "ai", content: `⚠️ ${err.message || "Gagal mendapat respons"}`, createdAt: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Unauthenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Stethoscope className="w-16 h-16 text-primary opacity-60" />
          <h1 className="text-2xl font-bold">Klinik Konsultasi</h1>
          <p className="text-muted-foreground max-w-sm">Buka kasus konsultasi, dapatkan analisis AI tentang kebutuhan dokumen Anda, dan diskusikan langkah-langkah yang diperlukan.</p>
          <a href="/api/login?returnTo=/konsultasi"><Button>Masuk untuk Memulai</Button></a>
        </div>
      </>
    );
  }

  const StatusIcon = selectedCase ? STATUS_CONFIG[selectedCase.status]?.icon ?? Clock : Clock;
  const SvcIcon = selectedCase ? serviceIcon(selectedCase.serviceType) : Stethoscope;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Navbar />

      {showCreateModal && (
        <CreateCaseModal onCreated={handleCaseCreated} onClose={() => setShowCreateModal(false)} />
      )}

      {memorySuggestPrefill && (
        <MemoryFormModal
          initial={memorySuggestPrefill}
          onSaved={(entry) => {
            setMemories(prev => [entry, ...prev]);
            setMemorySuggestPrefill(null);
            toast({ title: "Tersimpan ke Business Memory" });
          }}
          onClose={() => setMemorySuggestPrefill(null)}
        />
      )}

      {/* Header */}
      <div className="border-b bg-white dark:bg-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-1 text-muted-foreground"><ChevronLeft className="w-4 h-4" /> Dashboard</Button></Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Klinik Konsultasi</h1>
              <p className="text-xs text-muted-foreground">Buka kasus · Analisis AI · Diskusi dengan tim</p>
            </div>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Kasus Baru
          </Button>
          <Button variant="outline" size="sm" className="md:hidden gap-1" onClick={() => setShowMobileCases(v => !v)}>
            <FileText className="w-4 h-4" /> ({cases.length})
          </Button>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>

        {/* Left: Cases list */}
        <aside className={`${showMobileCases ? "flex" : "hidden"} md:flex flex-col w-full md:w-72 lg:w-80 border-r bg-white dark:bg-slate-800 absolute md:relative z-10 h-full`}>
          <div className="p-3 border-b">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">Kasus Anda ({cases.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {cases.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground px-4">
                <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">Belum ada kasus</p>
                <p className="text-xs opacity-70 mt-1">Klik "Kasus Baru" untuk memulai konsultasi</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Buka Kasus
                </Button>
              </div>
            ) : (
              cases.map(kasus => {
                const sc = STATUS_CONFIG[kasus.status] ?? STATUS_CONFIG.open;
                const Icon = serviceIcon(kasus.serviceType);
                const isSelected = selectedCase?.id === kasus.id;
                return (
                  <button
                    key={kasus.id}
                    onClick={() => selectCase(kasus)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors group flex items-start gap-2.5 ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "bg-primary-foreground/20" : serviceColor(kasus.serviceType)}`}>
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground" : "text-white"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate leading-snug">{kasus.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : sc.color}`}>
                          {sc.label}
                        </span>
                        {kasus.priority === "urgent" && (
                          <Flag className={`w-3 h-3 ${isSelected ? "text-primary-foreground/70" : "text-red-500"}`} />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={e => deleteCase(kasus, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-red-100 hover:text-red-600"}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right: Case workspace */}
        <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-w-0">
          {!selectedCase ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Klinik Konsultasi</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Buka kasus untuk layanan yang Anda butuhkan. AI akan menganalisis situasi Anda, mengidentifikasi dokumen yang diperlukan, dan memberikan panduan langkah demi langkah.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 max-w-xl w-full">
                {SERVICE_TYPES.slice(0, 4).map(s => (
                  <Card key={s.value} className="text-left cursor-pointer hover:border-primary transition-colors" onClick={() => setShowCreateModal(true)}>
                    <CardContent className="p-3">
                      <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                        <s.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-medium leading-snug">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2 mt-2">
                <Plus className="w-4 h-4" /> Buka Kasus Pertama
              </Button>
            </div>
          ) : (
            <>
              {/* Business Memory warning banner */}
              {memories.length > 0 && showMemoryBanner && (
                <div className="border-b bg-amber-50 dark:bg-amber-900/15 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Brain className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        ⚠️ Business Memory Aktif — AI akan mempertimbangkan riwayat bisnis Anda
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {memories.slice(0, 3).map(m => (
                          <span key={m.id} className="text-[10px] bg-amber-200 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            {m.title.length > 45 ? m.title.slice(0, 45) + "…" : m.title}
                          </span>
                        ))}
                        {memories.length > 3 && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400">+{memories.length - 3} lainnya</span>
                        )}
                      </div>
                      <Link href="/business-memory">
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 underline cursor-pointer mt-1 inline-block">
                          Kelola Business Memory →
                        </span>
                      </Link>
                    </div>
                    <button
                      onClick={() => setShowMemoryBanner(false)}
                      className="text-amber-600 hover:text-amber-800 p-0.5 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Case header */}
              <div className="border-b bg-white dark:bg-slate-800 px-4 py-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className={`w-9 h-9 rounded-lg ${serviceColor(selectedCase.serviceType)} flex items-center justify-center flex-shrink-0`}>
                    <SvcIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold truncate">{selectedCase.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xs text-muted-foreground">{serviceLabel(selectedCase.serviceType)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[selectedCase.status]?.color}`}>
                        {STATUS_CONFIG[selectedCase.status]?.label}
                      </span>
                      {selectedCase.priority === "urgent" && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Urgent</Badge>
                      )}
                    </div>
                  </div>
                  {!selectedCase.aiAnalysis ? (
                    <Button size="sm" onClick={runAnalysis} disabled={isAnalyzing} className="gap-1.5 flex-shrink-0">
                      {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {isAnalyzing ? "Menganalisis..." : "Analisis AI"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setShowAnalysis(v => !v)} className="gap-1.5 flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Analisis
                      {showAnalysis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedCase(null); setMessages([]); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Description */}
                {selectedCase.description && (
                  <p className="text-xs text-muted-foreground mt-2 pl-12 leading-relaxed">{selectedCase.description}</p>
                )}

                {/* AI Analysis panel */}
                {selectedCase.aiAnalysis && showAnalysis && (
                  <div className="mt-3 ml-0 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Analisis AI</span>
                    </div>
                    <div className="prose prose-xs dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{selectedCase.aiAnalysis}</ReactMarkdown>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs gap-1" onClick={runAnalysis} disabled={isAnalyzing}>
                      <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} /> Perbarui Analisis
                    </Button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {authError && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-sm space-y-2">
                      <div className="flex items-start gap-1.5">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Silakan masuk terlebih dahulu untuk menggunakan fitur ini.</p>
                      </div>
                      <a
                        href="/api/login?returnTo=/konsultasi"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-colors"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Masuk untuk melanjutkan
                      </a>
                    </div>
                  </div>
                )}
                {messages.length === 0 && !authError && (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Mulai diskusi tentang kasus ini</p>
                    <p className="text-xs opacity-70 mt-1">Tanyakan apa saja — persyaratan, dokumen, prosedur, estimasi biaya & waktu</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`flex gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 border rounded-tl-sm"
                      }`}>
                        {msg.role === "ai" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {/* Business Memory suggestion banner */}
                    {msg.role === "ai" &&
                      failureSuggestions[msg.id] &&
                      !dismissedSuggestions.has(msg.id) && (
                      <div className="ml-11 max-w-[80%] flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl px-3 py-2 text-xs shadow-sm">
                        <BookmarkPlus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                        <span className="text-violet-800 dark:text-violet-300 flex-1 leading-snug">
                          Konsultasi ini mengandung pola risiko/kegagalan. Simpan ke Business Memory?
                        </span>
                        <Button
                          size="sm"
                          className="h-6 px-2.5 text-[11px] bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0"
                          onClick={() => {
                            setMemorySuggestPrefill(failureSuggestions[msg.id]);
                          }}
                        >
                          Simpan
                        </Button>
                        <button
                          className="text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 flex-shrink-0 p-0.5"
                          onClick={() => setDismissedSuggestions(prev => new Set([...prev, msg.id]))}
                          title="Abaikan"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t bg-white dark:bg-slate-800 p-3">
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Tanyakan tentang ${serviceLabel(selectedCase.serviceType)}...`}
                    className="resize-none min-h-[44px] max-h-32 text-sm"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isLoading} className="h-11 w-11 p-0">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  AI konsultan DokumenProyek · Powered by Gustafta Framework · Enter untuk kirim
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
