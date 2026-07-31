import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Brain, Plus, Trash2, ChevronLeft, Edit2, Check, X,
  AlertTriangle, FileX, Clock, ShieldX, Building2,
  FolderX, FileWarning, Users, BookOpen, Archive,
  ArchiveRestore, Loader2, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessMemoryEntry {
  id: number;
  userId: string;
  category: string;
  title: string;
  description: string;
  tags: string[] | null;
  isActive: boolean;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MEMORY_CATEGORIES: { value: string; label: string; icon: any; color: string }[] = [
  { value: "kegagalan_tender",   label: "Kegagalan Tender",        icon: FileX,       color: "bg-red-500" },
  { value: "dokumen_kadaluarsa", label: "Dokumen Kedaluwarsa",     icon: Clock,       color: "bg-amber-500" },
  { value: "penolakan_sbu",      label: "Penolakan SBU",           icon: ShieldX,     color: "bg-orange-500" },
  { value: "penolakan_skk",      label: "Penolakan SKK",           icon: Building2,   color: "bg-rose-500" },
  { value: "masalah_perizinan",  label: "Masalah Perizinan",       icon: AlertTriangle, color: "bg-yellow-500" },
  { value: "kegagalan_proyek",   label: "Kegagalan Proyek",        icon: FolderX,     color: "bg-red-600" },
  { value: "risiko_kontrak",     label: "Risiko Kontrak",          icon: FileWarning, color: "bg-purple-500" },
  { value: "catatan_vendor",     label: "Catatan Vendor/Mitra",    icon: Users,       color: "bg-blue-500" },
  { value: "lainnya",            label: "Catatan Lainnya",         icon: BookOpen,    color: "bg-slate-500" },
];

function getCategoryMeta(value: string) {
  return MEMORY_CATEGORIES.find(c => c.value === value) ?? MEMORY_CATEGORIES[MEMORY_CATEGORIES.length - 1];
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface MemoryFormProps {
  initial?: Partial<BusinessMemoryEntry> | null;
  onSaved: (entry: BusinessMemoryEntry) => void;
  onClose: () => void;
}

export function MemoryFormModal({ initial, onSaved, onClose }: MemoryFormProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState(initial?.category ?? "kegagalan_tender");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(", "));
  const [eventDate, setEventDate] = useState(
    initial?.eventDate ? initial.eventDate.slice(0, 10) : ""
  );
  const [loading, setLoading] = useState(false);
  const isEdit = !!(initial && "id" in initial && initial.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);
    const body: any = {
      category, title: title.trim(), description: description.trim(),
      tags: tags.length ? tags : null,
      eventDate: eventDate || null,
    };
    try {
      const url = isEdit ? `/api/memory/${initial!.id}` : "/api/memory";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Gagal menyimpan");
      const saved = await res.json();
      onSaved(saved);
      toast({ title: isEdit ? "Memory diperbarui" : "Memory berhasil disimpan" });
    } catch (err: any) {
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-5 h-5 text-primary" />
              {isEdit ? "Edit Memory" : "Tambah Memory Bisnis"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kategori *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMORY_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Judul Singkat *</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="mis. SKK ditolak karena portofolio tidak memenuhi syarat"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Deskripsi Detail *</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ceritakan kejadian, penyebab, dampak, dan apa yang perlu diwaspadai ke depannya..."
                rows={5}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tag (opsional)</label>
              <Input
                value={tagsRaw}
                onChange={e => setTagsRaw(e.target.value)}
                placeholder="mis. sbu, tender, perizinan (pisahkan dengan koma)"
              />
              <p className="text-xs text-muted-foreground mt-1">Tag membantu AI mendeteksi relevansi memory saat konsultasi.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tanggal Kejadian (opsional)</label>
              <Input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={loading || !title.trim() || !description.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {isEdit ? "Simpan Perubahan" : "Simpan Memory"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessMemory() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<BusinessMemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<BusinessMemoryEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/memory", { credentials: "include" });
      if (res.ok) setEntries(await res.json());
    } catch {}
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (entry: BusinessMemoryEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [entry, ...prev];
    });
    setShowModal(false);
    setEditEntry(null);
  };

  const handleToggleArchive = async (entry: BusinessMemoryEntry) => {
    try {
      const res = await fetch(`/api/memory/${entry.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      toast({ title: entry.isActive ? "Memory diarsipkan" : "Memory diaktifkan kembali" });
    } catch {
      toast({ title: "Gagal mengubah status", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus memory ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/memory/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Memory dihapus" });
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const visible = entries.filter(e => {
    if (!showArchived && !e.isActive) return false;
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    return true;
  });

  const activeCount = entries.filter(e => e.isActive).length;
  const archivedCount = entries.filter(e => !e.isActive).length;

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Brain className="w-16 h-16 text-primary opacity-60" />
          <h1 className="text-2xl font-bold">Business Memory</h1>
          <p className="text-muted-foreground max-w-sm">Login untuk mengakses fitur ini.</p>
          <Link href="/"><Button>Masuk</Button></Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      {(showModal || editEntry) && (
        <MemoryFormModal
          initial={editEntry}
          onSaved={handleSaved}
          onClose={() => { setShowModal(false); setEditEntry(null); }}
        />
      )}

      {/* Page header */}
      <div className="border-b bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Business Memory</h1>
              <p className="text-xs text-muted-foreground">
                Platform mengingat riwayat & pola bisnis Anda untuk peringatan proaktif
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1" onClick={() => { setEditEntry(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Tambah Memory
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Memory Aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{archivedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Diarsipkan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">
                {new Set(entries.filter(e => e.isActive).map(e => e.category)).size}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Kategori Aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs font-medium text-muted-foreground mb-2">AI Awareness</p>
              <Badge variant={activeCount > 0 ? "default" : "secondary"} className="text-xs w-fit">
                {activeCount > 0 ? "✓ Aktif" : "Belum ada data"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* About banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                Apa itu Business Memory?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Business Memory adalah catatan riwayat kegagalan, penolakan, dan risiko bisnis Anda yang tersimpan di platform.
                Saat Anda membuka kasus konsultasi di Klinik Konsultasi, AI akan membaca memory ini dan secara otomatis
                memperingatkan jika ada pola yang berulang — mencegah Anda mengulangi kesalahan yang sama.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {MEMORY_CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(v => !v)}
            className="gap-1.5"
          >
            {showArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            {showArchived ? "Sembunyikan Arsip" : "Tampilkan Arsip"}
          </Button>
        </div>

        {/* Entries */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Memuat memory...</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium text-sm">
              {entries.length === 0
                ? "Belum ada Business Memory tersimpan"
                : "Tidak ada memory yang cocok dengan filter ini"}
            </p>
            <p className="text-xs opacity-70 mt-1 max-w-xs mx-auto">
              {entries.length === 0
                ? "Catat pengalaman kegagalan atau risiko bisnis agar AI dapat memperingatkan Anda di masa depan."
                : "Coba ubah filter atau tambahkan memory baru."}
            </p>
            {entries.length === 0 && (
              <Button size="sm" className="mt-4 gap-1" onClick={() => { setEditEntry(null); setShowModal(true); }}>
                <Plus className="w-4 h-4" /> Tambah Memory Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(entry => {
              const meta = getCategoryMeta(entry.category);
              const Icon = meta.icon;
              return (
                <Card key={entry.id} className={`transition-opacity ${!entry.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-lg ${meta.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="text-sm font-semibold flex-1 min-w-0">{entry.title}</p>
                          {!entry.isActive && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">Arsip</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{meta.label}</span>
                          {entry.eventDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.eventDate).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          )}
                          {entry.tags?.map(t => (
                            <Badge key={t} variant="secondary" className="text-[10px] h-4 px-1.5">{t}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{entry.description}</p>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setEditEntry(entry)}
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleToggleArchive(entry)}
                          title={entry.isActive ? "Arsipkan" : "Aktifkan kembali"}
                        >
                          {entry.isActive ? <Archive className="w-3.5 h-3.5" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(entry.id)}
                          title="Hapus permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
