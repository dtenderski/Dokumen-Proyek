import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Zap, Shield, TrendingUp, Users, RefreshCw, Play,
  Clock, AlertTriangle, Info, CheckCircle2, ExternalLink,
  Building2, FileSearch, Briefcase, ChevronDown, ChevronUp,
  Plus, X, MapPin, DollarSign, Tag, CalendarDays, Loader2,
  MessageCircle, ArrowRight, Network, CalendarClock, Target,
} from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonitoringSession {
  id: number;
  team: string;
  triggeredBy: string;
  status: string;
  summary: string | null;
  findingsCount: number | null;
  startedAt: string;
  completedAt: string | null;
}

interface TeamStatus {
  team: string;
  name: string;
  description: string;
  latestSession: MonitoringSession | null;
}

interface Finding {
  id: number;
  team: string;
  category: string | null;
  title: string;
  description: string | null;
  urgency: string;
  sourceUrl: string | null;
  entityName: string | null;
  entityCode: string | null;
  expiryDate: string | null;
  createdAt: string;
}

interface FreelanceListing {
  id: number;
  userId: string;
  listingType: string;
  category: string;
  title: string;
  description: string | null;
  location: string | null;
  contact: string | null;
  budget: string | null;
  requirements: string | null;
  status: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TEAM_META: Record<string, { icon: React.ReactNode; color: string; accent: string }> = {
  "sbu-skk": {
    icon: <Shield className="w-5 h-5" />,
    color: "from-blue-600 to-blue-800",
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  "bujk": {
    icon: <Building2 className="w-5 h-5" />,
    color: "from-emerald-600 to-emerald-800",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  "tender": {
    icon: <FileSearch className="w-5 h-5" />,
    color: "from-orange-600 to-orange-800",
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  "freelance": {
    icon: <Users className="w-5 h-5" />,
    color: "from-purple-600 to-purple-800",
    accent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  "bujk-profil": {
    icon: <Target className="w-5 h-5" />,
    color: "from-rose-600 to-rose-800",
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
};

const URGENCY_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  high: { label: "Mendesak", cls: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> },
  medium: { label: "Perhatian", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertTriangle className="w-3 h-3" /> },
  low: { label: "Info", cls: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  info: { label: "Info", cls: "bg-slate-100 text-slate-600 border-slate-200", icon: <Info className="w-3 h-3" /> },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

// ─── FindingCard ──────────────────────────────────────────────────────────────
function FindingCard({ f }: { f: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const urg = URGENCY_CONFIG[f.urgency] || URGENCY_CONFIG.info;
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 mt-0.5 ${urg.cls}`}>
          {urg.icon}{urg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{f.title}</p>
          {f.entityName && <p className="text-xs text-slate-500 mt-0.5">{f.entityName}{f.entityCode ? ` · ${f.entityCode}` : ""}</p>}
          {f.category && <span className="text-xs text-slate-400">{f.category}</span>}
        </div>
        <div className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700 pt-2 space-y-2">
          {f.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0.5 prose-ul:my-0.5 text-slate-600 dark:text-slate-300">
              <ReactMarkdown>{f.description}</ReactMarkdown>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {f.expiryDate && (
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Kadaluarsa: {f.expiryDate}</span>
            )}
            {f.sourceUrl && (
              <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="w-3 h-3" />Sumber
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TeamPanel ────────────────────────────────────────────────────────────────
function TeamPanel({ ts, onRun, running }: { ts: TeamStatus; onRun: (team: string) => void; running: boolean }) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loadingFindings, setLoadingFindings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const meta = TEAM_META[ts.team];
  const sess = ts.latestSession;

  const loadFindings = useCallback(async () => {
    setLoadingFindings(true);
    try {
      const r = await fetch(`/api/multiclaw/findings/${ts.team}`, { credentials: "include" });
      if (r.ok) setFindings(await r.json());
    } finally {
      setLoadingFindings(false);
    }
  }, [ts.team]);

  useEffect(() => { if (expanded) loadFindings(); }, [expanded, loadFindings]);

  const highCount = findings.filter(f => f.urgency === "high").length;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`bg-gradient-to-r ${meta.color} text-white p-4`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">{meta.icon}</div>
            <div>
              <p className="font-semibold text-sm leading-tight">{ts.name}</p>
              <p className="text-xs text-white/75 mt-0.5">{ts.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs h-8"
            onClick={() => onRun(ts.team)}
            disabled={running}
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {running ? "Menjalankan…" : "Jalankan"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {sess ? timeAgo(sess.startedAt) : "Belum pernah dijalankan"}
        </span>
        {sess && (
          <>
            <span className={`flex items-center gap-1 font-medium ${
              sess.status === "completed" ? "text-emerald-600" :
              sess.status === "failed" ? "text-red-500" : "text-yellow-500"
            }`}>
              {sess.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> :
               sess.status === "failed" ? <AlertTriangle className="w-3 h-3" /> :
               <Loader2 className="w-3 h-3 animate-spin" />}
              {sess.status === "completed" ? "Selesai" : sess.status === "failed" ? "Gagal" : "Berjalan"}
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {sess.findingsCount ?? 0} temuan
            </span>
            {highCount > 0 && (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <AlertTriangle className="w-3 h-3" />{highCount} mendesak
              </span>
            )}
          </>
        )}
      </div>

      {/* Summary */}
      {sess?.summary && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-0 text-slate-600 dark:text-slate-400 italic text-xs">
            <ReactMarkdown>{sess.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Findings toggle */}
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <span>Lihat Temuan</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 max-h-72 overflow-y-auto">
          {loadingFindings ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : findings.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada temuan. Jalankan monitoring untuk mulai.</p>
          ) : (
            findings.slice(0, 20).map(f => <FindingCard key={f.id} f={f} />)
          )}
        </div>
      )}
    </div>
  );
}

// ─── FreelanceBoard ───────────────────────────────────────────────────────────
function FreelanceBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<FreelanceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    listingType: "offer",
    category: "SKK",
    title: "",
    description: "",
    location: "",
    contact: "",
    budget: "",
    requirements: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/multiclaw/freelance", { credentials: "include" });
      if (r.ok) setListings(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title.trim()) { toast({ title: "Judul wajib diisi", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const r = await fetch("/api/multiclaw/freelance", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Listing berhasil ditambahkan" });
      setShowForm(false);
      setForm({ listingType: "offer", category: "SKK", title: "", description: "", location: "", contact: "", budget: "", requirements: "" });
      await load();
    } catch {
      toast({ title: "Gagal menambahkan listing", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeListing = async (id: number) => {
    await fetch(`/api/multiclaw/freelance/${id}/close`, { method: "PATCH", credentials: "include" });
    setListings(prev => prev.filter(l => l.id !== id));
    toast({ title: "Listing ditutup" });
  };

  const offersLists = listings.filter(l => l.listingType === "offer");
  const seekLists = listings.filter(l => l.listingType === "seek");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{listings.length} listing aktif</p>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1" />Tambah Listing
        </Button>
      </div>

      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Listing Baru</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipe</label>
              <select value={form.listingType} onChange={e => setForm(f => ({ ...f, listingType: e.target.value }))}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 dark:border-slate-600">
                <option value="offer">Tawarkan Diri (SKK cari kerja)</option>
                <option value="seek">Cari Tenaga Ahli (BUJK)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 dark:border-slate-600">
                <option value="SKK">SKK / Tenaga Ahli</option>
                <option value="BUJK">BUJK / Perusahaan</option>
              </select>
            </div>
          </div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Judul *" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat" rows={2}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600 resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Lokasi" className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 dark:border-slate-600" />
            <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="Budget / Gaji" className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
            placeholder="Kontak (WA / email)" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600" />
          <input value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
            placeholder="Persyaratan / kualifikasi" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600" />
          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Simpan Listing
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Belum ada listing. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Offers */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Tawarkan Diri</Badge>
              <span className="text-xs font-normal text-slate-400">SKK cari kerja ({offersLists.length})</span>
            </h3>
            <div className="space-y-2">
              {offersLists.map(l => <ListingCard key={l.id} l={l} onClose={closeListing} currentUserId={user?.id} />)}
              {offersLists.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada</p>}
            </div>
          </div>
          {/* Seeks */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Cari Tenaga Ahli</Badge>
              <span className="text-xs font-normal text-slate-400">BUJK cari SKK ({seekLists.length})</span>
            </h3>
            <div className="space-y-2">
              {seekLists.map(l => <ListingCard key={l.id} l={l} onClose={closeListing} currentUserId={user?.id} />)}
              {seekLists.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingCard({ l, onClose, currentUserId }: { l: FreelanceListing; onClose: (id: number) => void; currentUserId?: string }) {
  const isOwner = !!currentUserId && l.userId === currentUserId;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{l.title}</p>
        {isOwner && (
          <button onClick={() => onClose(l.id)} className="shrink-0 text-slate-300 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {l.description && <p className="text-xs text-slate-500">{l.description}</p>}
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {l.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</span>}
        {l.budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{l.budget}</span>}
        {l.requirements && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{l.requirements}</span>}
      </div>
      {l.contact && (
        <p className="text-xs text-primary font-medium">📞 {l.contact}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MultiClaw() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<TeamStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [runningTeam, setRunningTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [nextRun, setNextRun] = useState<Date | null>(null);
  const [intervalHours, setIntervalHours] = useState(24);

  const loadStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/multiclaw/status", { credentials: "include" });
      if (r.status === 403) { setForbidden(true); return; }
      if (r.ok) setTeams(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const r = await fetch("/api/multiclaw/schedule", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        if (data.nextRun) setNextRun(new Date(data.nextRun));
        if (data.intervalHours) setIntervalHours(data.intervalHours);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStatus(); loadSchedule(); }, [loadStatus, loadSchedule]);

  // Poll when a team is running
  useEffect(() => {
    if (!runningTeam) return;
    const interval = setInterval(async () => {
      await loadStatus();
      const t = teams.find(t => t.team === runningTeam);
      if (t?.latestSession?.status === "completed" || t?.latestSession?.status === "failed") {
        setRunningTeam(null);
        toast({
          title: t.latestSession.status === "completed" ? "Monitoring selesai!" : "Monitoring gagal",
          description: t.latestSession.summary || undefined,
        });
        clearInterval(interval);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [runningTeam, teams, loadStatus, toast]);

  const handleRun = async (team: string) => {
    if (runningTeam) return;
    setRunningTeam(team);
    try {
      const r = await fetch("/api/multiclaw/run", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team }),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Monitoring dimulai…", description: "Agen OpenClaw sedang bekerja." });
    } catch {
      setRunningTeam(null);
      toast({ title: "Gagal menjalankan monitoring", variant: "destructive" });
    }
  };

  const handleRunAll = async () => {
    if (runningTeam) return;
    toast({ title: "MultiClaw menjalankan semua tim…" });
    for (const t of ["sbu-skk", "bujk", "tender", "bujk-profil"]) {
      await fetch("/api/multiclaw/run", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: t }),
      });
      await new Promise(r => setTimeout(r, 800));
    }
    setRunningTeam("sbu-skk");
  };

  const totalFindings = teams.reduce((sum, t) => sum + (t.latestSession?.findingsCount ?? 0), 0);
  const activeTeams = teams.filter(t => t.latestSession?.status === "completed").length;

  // Superadmin gate — shown to logged-in non-admin users
  if (user && forbidden) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Akses Dibatasi</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Halaman ini hanya dapat diakses oleh <span className="text-white font-semibold">Superadmin</span> platform.
              Jika Anda merasa ini keliru, hubungi administrator sistem.
            </p>
            <Link href="/">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    const WA = "https://wa.me/6281287941900?text=Halo%2C+saya+tertarik+dengan+MultiClaw.+Bisa+info+lebih+lanjut%3F";
    const MONITORS = [
      { icon: Shield,    color: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/10",   label: "SBU / SKK Monitor",     desc: "Pantau status kedaluwarsa SBU dan SKK seluruh personel — notifikasi otomatis sebelum terlambat." },
      { icon: Building2, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", label: "BUJK Intelligence",      desc: "Monitor kualifikasi BUJK, perubahan regulasi, dan status badan usaha jasa konstruksi." },
      { icon: FileSearch,color: "text-orange-400",  border: "border-orange-500/20",  bg: "bg-orange-500/10",  label: "Tender Watch",           desc: "Pantau paket tender aktif, deadline, dan peluang baru yang cocok dengan profil perusahaan." },
      { icon: Users,     color: "text-purple-400",  border: "border-purple-500/20",  bg: "bg-purple-500/10",  label: "Freelance Network",      desc: "Monitor listing tenaga ahli dan subkontraktor — cocokkan kebutuhan proyek secara real-time." },
      { icon: Target,    color: "text-rose-400",    border: "border-rose-500/20",    bg: "bg-rose-500/10",    label: "Profil BUJK & ISO/K3",   desc: "Kumpulkan profil BUJK strategis, perusahaan konstruksi/ESDM/manufaktur yang mengurus atau punya ISO (masa berakhir), penerapan K3, dan peluang pemasaran layanan." },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Network className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary text-xs font-semibold tracking-wide uppercase">Intelligence Hub · by Gustafta</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Pantau 5 Tim Pengadaan<br />
              <span className="text-primary">Sekaligus, Real-Time.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              MultiClaw menjalankan agen AI secara paralel — SBU/SKK, BUJK, Tender, Freelance, dan Profil BUJK Strategis —
              sehingga tidak ada peluang atau risiko yang terlewat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WA} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 w-full sm:w-auto h-12 px-8">
                  <MessageCircle className="w-4 h-4" />Hubungi via WhatsApp
                </Button>
              </a>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-semibold gap-2 w-full sm:w-auto h-12 px-8">
                  <Zap className="w-4 h-4" />Daftar &amp; Coba Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 monitor cards */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {MONITORS.map((m) => (
              <div key={m.label} className={`bg-slate-900 border ${m.border} rounded-xl p-5 hover:bg-slate-800/60 transition-colors`}>
                <div className={`w-9 h-9 rounded-lg ${m.bg} border ${m.border} flex items-center justify-center mb-3`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{m.label}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { value: "5", label: "Tim Paralel" },
              { value: "24/7", label: "AI Aktif" },
              { value: "Real-time", label: "Intelligence" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold text-primary mb-0.5">{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-orange-500/5 border border-primary/20 rounded-2xl p-8 text-center">
            <Bot className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Akses MultiClaw Intelligence Hub</h2>
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
                <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 gap-2 h-11 px-7">
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary to-orange-500 rounded-xl shadow-lg shadow-primary/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">MultiClaw Intelligence Hub</h1>
                  <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
                    BY GUSTAFTA
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">Sistem monitoring multi-agen untuk industri konstruksi Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { loadStatus(); loadSchedule(); }}
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />Refresh
              </Button>
              <Button size="sm" onClick={handleRunAll} disabled={!!runningTeam}
                className="bg-primary hover:bg-primary/90">
                {runningTeam ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Bot className="w-3.5 h-3.5 mr-1" />}
                Jalankan Semua
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tim Aktif", value: activeTeams.toString(), icon: <Bot className="w-4 h-4 text-primary" /> },
              { label: "Total Temuan", value: totalFindings.toString(), icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
              { label: "OpenClaw Engines", value: "4", icon: <Zap className="w-4 h-4 text-orange-400" /> },
              {
                label: "Jadwal Berikutnya",
                value: nextRun
                  ? nextRun.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
                  : "—",
                sub: nextRun
                  ? nextRun.toLocaleDateString("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" })
                  : `Tiap ${intervalHours} jam`,
                icon: <CalendarClock className="w-4 h-4 text-sky-400" />,
              },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
                <div className="p-1.5 bg-slate-700 rounded-lg">{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight">{s.value}</p>
                  {"sub" in s && s.sub && <p className="text-xs text-sky-400 font-medium leading-tight">{s.sub}</p>}
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400">
              <Bot className="w-3.5 h-3.5 mr-1.5" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="sbu-skk" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
              <Shield className="w-3.5 h-3.5 mr-1.5" />SBU & SKK
            </TabsTrigger>
            <TabsTrigger value="bujk" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />BUJK
            </TabsTrigger>
            <TabsTrigger value="tender" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-400">
              <FileSearch className="w-3.5 h-3.5 mr-1.5" />Tender
            </TabsTrigger>
            <TabsTrigger value="freelance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              <Users className="w-3.5 h-3.5 mr-1.5" />Freelance Board
            </TabsTrigger>
            <TabsTrigger value="bujk-profil" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-400">
              <Target className="w-3.5 h-3.5 mr-1.5" />Profil BUJK
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map(ts => (
                  <TeamPanel
                    key={ts.team}
                    ts={ts}
                    onRun={handleRun}
                    running={runningTeam === ts.team}
                  />
                ))}
              </div>
            )}
            <div className="mt-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Integrasi Workroom</p>
              <p className="text-sm text-slate-300 mb-3">Temuan penting dari monitoring dapat dilanjutkan sebagai workroom proyek untuk penanganan lebih mendalam.</p>
              <Link href="/workroom">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />Buka Workroom
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Per-team tabs */}
          {["sbu-skk", "bujk", "tender", "bujk-profil"].map(teamKey => (
            <TabsContent key={teamKey} value={teamKey}>
              {teams.find(t => t.team === teamKey) && (
                <div className="space-y-4">
                  <TeamPanel
                    ts={teams.find(t => t.team === teamKey)!}
                    onRun={handleRun}
                    running={runningTeam === teamKey}
                  />
                </div>
              )}
            </TabsContent>
          ))}

          {/* Freelance Board tab */}
          <TabsContent value="freelance">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 dark:text-slate-200">Freelance Board BUJK & SKK</h2>
                  <p className="text-xs text-slate-500">Marketplace tenaga ahli dan kebutuhan BUJK konstruksi Indonesia</p>
                </div>
              </div>
              <FreelanceBoard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
