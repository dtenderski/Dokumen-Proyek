import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { RelatedServices } from "@/components/ServiceNav";
import {
  Plus, FileText, ArrowLeft, Download, Eye, Calendar, Building2,
  MapPin, FileCheck, Loader2, Copy, CheckCircle2, BookOpen, Zap,
  ClipboardList, ChevronRight, AlertTriangle, Info, Shield,
  TrendingUp, Award, Layers, Star, RefreshCw, Clock, BarChart3,
  CheckCheck, Search, HardHat, Users, Globe, Activity, Target,
  GraduationCap, Cpu
} from "lucide-react";
import type { TenderDocument, UserProfile } from "@shared/schema";

// ─── Data ─────────────────────────────────────────────────────────────────
const projectTypes = [
  { value: "gedung", label: "Konstruksi Bangunan Gedung" },
  { value: "infrastruktur", label: "Konstruksi Infrastruktur" },
  { value: "sipil", label: "Pekerjaan Sipil (Jalan/Jembatan)" },
  { value: "mekanikal", label: "Pekerjaan Mekanikal (HVAC/Plumbing)" },
  { value: "elektrikal", label: "Pekerjaan Elektrikal" },
  { value: "konsultan", label: "Jasa Konsultansi" },
  { value: "pengawasan", label: "Jasa Pengawasan Konstruksi" },
];

const documentTypes = [
  { value: "administrasi", label: "Dokumen Administrasi Penawaran" },
  { value: "teknis", label: "Dokumen Teknis (Metodologi & RK3K)" },
  { value: "harga", label: "Dokumen Harga (RAB & BOQ)" },
  { value: "semua", label: "Paket Lengkap (Semua Dokumen)" },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  generated: { label: "Sudah Generate", variant: "default" },
  submitted: { label: "Sudah Diajukan", variant: "outline" },
};

// ─── Jenis Dokumen Tender Detail ──────────────────────────────────────────
const dokumenTenderDetail = [
  {
    kategori: "Dokumen Administrasi",
    warna: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    items: [
      { nama: "Surat Penawaran", ket: "Surat resmi penawaran harga bertandatangan direksi + materai", wajib: true },
      { nama: "Jaminan Penawaran (Bank Garansi)", ket: "2–3% dari nilai HPS — jika dipersyaratkan oleh PPK", wajib: false },
      { nama: "Surat Kuasa", ket: "Jika penandatangan bukan direksi — perlu surat kuasa notarial", wajib: false },
      { nama: "Pakta Integritas", ket: "Pernyataan tidak melakukan KKN/fraud — Perpres 46/2025", wajib: true },
      { nama: "Formulir Isian Kualifikasi", ket: "Data perusahaan, pengalaman, personel kunci, SBU", wajib: true },
      { nama: "Daftar Peralatan Utama", ket: "List alat konstruksi yang dimiliki/dikuasai peserta", wajib: true },
      { nama: "Daftar Personel Manajerial", ket: "PM, Site Manager, K3 — nama + SKK + jabatan kerja + pengalaman", wajib: true },
    ],
  },
  {
    kategori: "Dokumen Teknis",
    warna: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-800",
    items: [
      { nama: "Metode Pelaksanaan (Metodologi)", ket: "Uraian teknis cara pelaksanaan setiap pekerjaan utama", wajib: true },
      { nama: "Jadwal Pelaksanaan (Time Schedule)", ket: "Bar chart / Kurva-S rencana pelaksanaan per item pekerjaan", wajib: true },
      { nama: "Rencana K3 Kontrak (RK3K)", ket: "Identifikasi bahaya, penilaian risiko, pengendalian K3 per pekerjaan", wajib: true },
      { nama: "Spesifikasi Teknis (Usulan Bahan)", ket: "Brosur/spesifikasi bahan yang ditawarkan jika beda dari RKS", wajib: false },
      { nama: "Struktur Organisasi Proyek", ket: "Org chart: PM, Site Manager, QA/QC, K3, Administrasi", wajib: true },
      { nama: "Dukungan Teknis Subkontraktor", ket: "Jika ada pekerjaan spesialis yang di-subkon-kan", wajib: false },
    ],
  },
  {
    kategori: "Dokumen Harga",
    warna: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    items: [
      { nama: "Rekapitulasi Penawaran Harga", ket: "Total nilai penawaran per divisi/paket pekerjaan + PPN", wajib: true },
      { nama: "Rincian Anggaran Biaya (RAB)", ket: "Breakdown biaya per item pekerjaan: volume × harga satuan", wajib: true },
      { nama: "Daftar Kuantitas & Harga (BOQ)", ket: "Bill of Quantities sesuai spesifikasi teknis dokumen lelang", wajib: true },
      { nama: "Analisis Harga Satuan (AHSP)", ket: "Komponen upah + material + alat per harga satuan pekerjaan", wajib: true },
      { nama: "Daftar Harga Material", ket: "Referensi harga material pasar sesuai lokasi proyek", wajib: true },
      { nama: "Biaya K3 & Keselamatan Konstruksi", ket: "Rincian biaya APD, pelatihan K3, rambu, BPJS TK — min. 1% kontrak", wajib: true },
    ],
  },
  {
    kategori: "Dokumen Kualifikasi BUJK",
    warna: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-800",
    items: [
      { nama: "Akta Pendirian + Perubahan Terakhir", ket: "Legalisir notaris — termasuk SK Kemenkumham", wajib: true },
      { nama: "NIB (Nomor Induk Berusaha)", ket: "Dari OSS-RBA — KBLI harus sesuai bidang pekerjaan", wajib: true },
      { nama: "SBU Aktif (Sesuai Subklasifikasi)", ket: "SBU LPJK yang belum kedaluwarsa, gred sesuai nilai paket", wajib: true },
      { nama: "NPWP Badan Usaha + IIKP", ket: "NPWP aktif + Informasi Identitas & Kapasitas Pajak", wajib: true },
      { nama: "Laporan Keuangan Audited", ket: "2 tahun terakhir — KAP berakreditasi (paket di atas ambang batas)", wajib: false },
      { nama: "Daftar Pengalaman Pekerjaan (5 Tahun)", ket: "Nama proyek, nilai, pemberi kerja, tahun, referensi BAP/BAST", wajib: true },
      { nama: "Sertifikat SKK Personel Kunci (PJT/PM/K3)", ket: "SKK ahli sesuai jabatan: PM min. Jenjang 7, K3 min. Jenjang 6", wajib: true },
    ],
  },
];

// ─── Regulasi Pengadaan ───────────────────────────────────────────────────
const regulasiPengadaan = [
  {
    kode: "Perpres No. 46 Tahun 2025",
    judul: "Pengadaan Barang/Jasa Pemerintah (Pengganti Perpres 16/2018)",
    poin: [
      "Regulasi pengadaan pemerintah terbaru — menggantikan Perpres No. 16/2018 dan perubahannya (Perpres 12/2021).",
      "Metode pemilihan tetap: Tender/Seleksi (umum & terbatas), Penunjukan Langsung, Pengadaan Langsung, Sayembara/Kontes.",
      "Penguatan penggunaan produk dalam negeri (PDN) dan TKDN — wajib dipenuhi sesuai ambang batas tiap sektor.",
      "Pengadaan melalui e-Procurement SPSE (LPSE) tetap wajib — seluruh proses dari pengumuman hingga kontrak digital.",
      "Penyempurnaan mekanisme sanggah, negosiasi harga, dan penggunaan e-Katalog serta e-Purchasing.",
    ],
  },
  {
    kode: "Permen PUPR No. 14 Tahun 2020",
    judul: "Standar dan Pedoman Pengadaan Jasa Konstruksi",
    poin: [
      "Dokumen Pemilihan Jasa Konstruksi: format standar nasional untuk tender konstruksi pemerintah.",
      "Evaluasi penawaran: sistem gugur → evaluasi teknis → evaluasi harga → klarifikasi & negosiasi.",
      "Persyaratan SBU sesuai kualifikasi: K1 ≤2M · K2 ≤7,5M · K3 ≤15M · Menengah ≤50M · Besar >50M.",
      "Personel manajerial wajib: PM + Site Manager + Ahli K3 Konstruksi (bersertifikat SKK).",
      "Masa berlaku penawaran minimal 90 hari kalender dari pemasukan dokumen.",
    ],
  },
  {
    kode: "PP No. 22 Tahun 2020 + PP 14/2021",
    judul: "Pelaksanaan Undang-Undang Jasa Konstruksi",
    poin: [
      "Regulasi teknis UUJK No. 2/2017 — mengatur izin, kompetensi, dan tanggung jawab jasa konstruksi.",
      "Kewajiban SBU untuk setiap BUJK yang mengerjakan pekerjaan konstruksi.",
      "Pemborongan pekerjaan (subkon) harus kepada BUJK bersertifikat SBU sesuai subklasifikasi.",
      "PP 14/2021: Penyesuaian pascaUU Cipta Kerja — registrasi BUJK via LPJK digital (SIKI).",
    ],
  },
  {
    kode: "Permen PUPR No. 10 Tahun 2021",
    judul: "Pedoman SMKK (Sistem Manajemen Keselamatan Konstruksi)",
    poin: [
      "RK3K (Rencana Keselamatan Konstruksi) WAJIB sebagai bagian dokumen teknis penawaran.",
      "Biaya K3 harus dihitung eksplisit dalam RAB — tidak boleh tersembunyi di overhead.",
      "Format RK3K standar: IBPR + pengendalian risiko + APD + sosialisasi + pelaporan.",
      "PPK/Pokja wajib mengevaluasi kualitas RK3K sebagai bagian evaluasi teknis.",
    ],
  },
];

// ─── Template Preset per Jenis ────────────────────────────────────────────
const templatePreset = [
  {
    id: "gedung-kecil",
    nama: "Gedung Sederhana (s.d. Rp 50 M)",
    icon: "🏠",
    projectType: "gedung",
    documentType: "semua",
    tips: "Pastikan SBU kualifikasi K3/Menengah sesuai nilai paket, RK3K sederhana, metode pelaksanaan 3–5 halaman.",
    sections: ["Surat Penawaran", "Pakta Integritas", "Metode Pelaksanaan", "RK3K", "Time Schedule", "RAB + BOQ", "AHSP", "Kualifikasi"],
    sbuMin: "K3 / Menengah",
    persyaratan: ["NIB KBLI 41xxx", "SBU BG sesuai gred", "2 personel manajerial min.", "Pengalaman sejenis min. 1 pekerjaan"],
  },
  {
    id: "gedung-besar",
    nama: "Gedung Kompleks (Rp 50 M – Rp 250 M)",
    icon: "🏢",
    projectType: "gedung",
    documentType: "semua",
    tips: "Wajib SBU Besar/Menengah, personel manajerial lengkap (PM+SM+K3+QC), lapkeu audited 2 tahun, jaminan penawaran.",
    sections: ["Surat Penawaran + Jaminan", "Pakta Integritas", "Metode Pelaksanaan Detail", "RK3K Komprehensif", "Time Schedule + Kurva-S", "RAB + BOQ + AHSP", "Struktur Organisasi", "Kualifikasi Lengkap + Lapkeu"],
    sbuMin: "M2 / B1",
    persyaratan: ["NIB KBLI 41xxx", "SBU BG M2 min.", "4+ personel manajerial", "Lapkeu audited 2 tahun", "Jaminan penawaran 2–3% HPS"],
  },
  {
    id: "jalan-infrastruktur",
    nama: "Jalan & Infrastruktur Sipil",
    icon: "🛣️",
    projectType: "sipil",
    documentType: "semua",
    tips: "SBU SI001/SI002 wajib, Ahli K3 Konstruksi min. 1 orang, AHSP mengacu SNI + AHSP Bitumen Kementerian PUPR.",
    sections: ["Surat Penawaran", "Pakta Integritas", "Metode Pelaksanaan (Lapangan)", "RK3K Sipil", "Time Schedule", "RAB Jalan + AHSP Bitumen", "BOQ Linear", "Kualifikasi + SBU SI"],
    sbuMin: "M1 / M2 / B1 (nilai pekerjaan)",
    persyaratan: ["NIB KBLI 42xxx", "SBU SI001/SI002", "Ahli Jalan/Jembatan SKK", "Alat berat (asphalt finisher, motor grader, dll)"],
  },
  {
    id: "mek-elektrikal",
    nama: "Mekanikal Elektrikal (ME)",
    icon: "⚡",
    projectType: "mekanikal",
    documentType: "semua",
    tips: "SBU MK/EL sesuai subklasifikasi, lampirkan dukungan pabrik untuk material utama (AC, panel, dll).",
    sections: ["Surat Penawaran", "Pakta Integritas", "Metode ME per Sistem", "RK3K Instalasi", "Time Schedule ME", "RAB ME + BOQ Per Sistem", "AHSP ME", "Dukungan Pabrik + Kualifikasi"],
    sbuMin: "K3 / Menengah (nilai pekerjaan)",
    persyaratan: ["NIB KBLI 43xxx", "SBU MK001/EL010 sesuai sistem", "Teknisi bersertifikat (SKK ME)", "Dukungan teknis pabrik/distributor"],
  },
  {
    id: "konsultan-perencana",
    nama: "Jasa Konsultansi (Perencana/Pengawas)",
    icon: "📐",
    projectType: "konsultan",
    documentType: "semua",
    tips: "SBU Konsultan (PR/AR/SP), Tenaga Ahli min. jenjang 7, proposal teknis minimal 20 halaman, AHSP jasa.",
    sections: ["Surat Penawaran Konsultan", "Data Organisasi Perusahaan", "Proposal Teknis (Metodologi + Pendekatan)", "Rencana Kerja (Jadwal & Deliverable)", "CV Tenaga Ahli + SKK", "Daftar Pengalaman Pekerjaan Sejenis", "Penawaran Biaya (RAB Jasa)"],
    sbuMin: "K3 / Menengah konsultan",
    persyaratan: ["NIB KBLI 71xxx", "SBU Konsultan sesuai bidang", "Min. 3 Tenaga Ahli SKK Jenjang 7+", "Pengalaman konsultansi sejenis"],
  },
];

// ─── Checklist Kepatuhan Perpres 46/2025 ────────────────────────────────
const checklistKepatuhan = [
  { section: "Kelengkapan Dokumen Administrasi", items: [
    { isi: "Surat Penawaran bermaterai dan bertandatangan direksi/kuasa", wajib: true },
    { isi: "Jaminan Penawaran dari bank/asuransi (jika dipersyaratkan Pokja)", wajib: false },
    { isi: "Pakta Integritas sudah ditandatangani dan dilampirkan", wajib: true },
    { isi: "Formulir Isian Kualifikasi terisi lengkap dan benar", wajib: true },
    { isi: "Surat Kuasa notarial (jika bukan direktur yang menandatangani)", wajib: false },
  ]},
  { section: "Kualifikasi Badan Usaha", items: [
    { isi: "SBU aktif dan sesuai subklasifikasi pekerjaan yang ditenderkan", wajib: true },
    { isi: "Kualifikasi SBU sesuai nilai HPS (K1/K2/K3/Menengah/Besar)", wajib: true },
    { isi: "NIB aktif dengan KBLI sesuai pekerjaan", wajib: true },
    { isi: "NPWP aktif — tidak dalam status pembekuan", wajib: true },
    { isi: "Laporan Keuangan Audited 2 tahun (paket kualifikasi non-kecil)", wajib: false },
    { isi: "Pengalaman pekerjaan sejenis minimal 1 pekerjaan dalam 5 tahun", wajib: true },
  ]},
  { section: "Dokumen Teknis", items: [
    { isi: "Metode Pelaksanaan mencakup seluruh pekerjaan utama & spesifik", wajib: true },
    { isi: "RK3K (Rencana K3 Kontrak) mengacu Permen PUPR 10/2021", wajib: true },
    { isi: "Time Schedule realistis dan mencakup seluruh lingkup pekerjaan", wajib: true },
    { isi: "Struktur Organisasi Proyek dengan nama personel yang ditugaskan", wajib: true },
    { isi: "SKK Personel Kunci (PM/SM/K3) masih aktif dan terlampir", wajib: true },
    { isi: "Daftar Peralatan Utama dengan kepemilikan/sewa terdokumentasi", wajib: true },
  ]},
  { section: "Dokumen Harga", items: [
    { isi: "Rekapitulasi Penawaran Harga sesuai format BQ dokumen lelang", wajib: true },
    { isi: "RAB dan BOQ terisi lengkap — tidak ada item yang kosong", wajib: true },
    { isi: "AHSP mengacu standar: SNI / AHSP Kementerian PUPR terbaru", wajib: true },
    { isi: "Biaya K3 dihitung eksplisit dalam RAB (tidak tersembunyi)", wajib: true },
    { isi: "Nilai penawaran tidak melebihi 100% HPS (paket pemerintah)", wajib: true },
    { isi: "PPN 11% sudah dihitung dan tercantum di penawaran", wajib: true },
  ]},
];

type ChecklistState = Record<string, Record<string, boolean>>;

export default function TenderGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generator");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TenderDocument | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRegDetail, setShowRegDetail] = useState(false);
  const [selectedReg, setSelectedReg] = useState(0);
  const [checkState, setCheckState] = useState<ChecklistState>({});
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [newDoc, setNewDoc] = useState({
    projectName: "",
    projectType: "gedung",
    projectValue: "",
    projectLocation: "",
    clientName: "",
    deadline: "",
    documentType: "semua",
    companyName: "",
    companyAddress: "",
    npwp: "",
    sbuNumber: "",
    sbuClassification: "",
    directorName: "",
  });

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/profile"] });
  const { data: documents = [], isLoading } = useQuery<TenderDocument>({
    queryKey: ["/api/tender-documents"],
  }) as { data: TenderDocument[]; isLoading: boolean };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tender-documents", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Dokumen tender berhasil dibuat" });
      queryClient.invalidateQueries({ queryKey: ["/api/tender-documents"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => toast({ title: "Gagal membuat dokumen", variant: "destructive" }),
  });

  const generateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tender-documents/${id}/generate`);
      return res.json() as Promise<TenderDocument>;
    },
    onSuccess: (data) => {
      toast({ title: "Dokumen berhasil di-generate!" });
      queryClient.invalidateQueries({ queryKey: ["/api/tender-documents"] });
      setSelectedDoc(data);
      setShowViewDialog(true);
    },
    onError: () => toast({ title: "Gagal generate dokumen", variant: "destructive" }),
  });

  function resetForm() {
    setNewDoc({ projectName: "", projectType: "gedung", projectValue: "", projectLocation: "", clientName: "", deadline: "", documentType: "semua", companyName: "", companyAddress: "", npwp: "", sbuNumber: "", sbuClassification: "", directorName: "" });
    setSelectedPreset(null);
  }

  function applyPreset(preset: typeof templatePreset[0]) {
    setSelectedPreset(preset.id);
    setNewDoc(prev => ({ ...prev, projectType: preset.projectType, documentType: preset.documentType }));
    setShowCreateDialog(true);
  }

  const handleCreate = () => {
    if (!newDoc.projectName || !newDoc.projectType || !newDoc.documentType) {
      toast({ title: "Isi nama proyek, jenis proyek, dan jenis dokumen", variant: "destructive" });
      return;
    }
    createMutation.mutate({ ...newDoc, deadline: newDoc.deadline ? new Date(newDoc.deadline).toISOString() : null });
  };

  const handleCopy = () => {
    if (selectedDoc?.generatedContent) {
      navigator.clipboard.writeText(selectedDoc.generatedContent);
      setCopied(true);
      toast({ title: "Dokumen disalin ke clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (selectedDoc?.generatedContent) {
      const blob = new Blob([selectedDoc.generatedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDoc.projectName.replace(/\s+/g, "_")}_tender.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Dokumen berhasil diunduh" });
    }
  };

  function toggleCheck(section: string, item: string) {
    setCheckState(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [item]: !(prev[section]?.[item]) }
    }));
  }

  const totalItems = checklistKepatuhan.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = Object.values(checkState).reduce((sum, sec) => sum + Object.values(sec).filter(Boolean).length, 0);
  const complianceProgress = Math.round((checkedItems / totalItems) * 100);

  function copyChecklist() {
    const lines = checklistKepatuhan.map(s =>
      `## ${s.section}\n` + s.items.map(i => `${checkState[s.section]?.[i.isi] ? "✅" : "⬜"} ${i.isi}`).join("\n")
    ).join("\n\n");
    navigator.clipboard.writeText(`CHECKLIST KEPATUHAN TENDER — Perpres 46/2025\n${"─".repeat(50)}\n${lines}\n\nKesiapan: ${checkedItems}/${totalItems} (${complianceProgress}%)`);
    toast({ title: "Checklist disalin!", description: "Checklist kepatuhan tender tersalin." });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-bold text-slate-800">Dokumen Tender Konstruksi</span>
            <Badge className="text-xs bg-green-100 text-green-800 border border-green-200">AI-Powered</Badge>
            <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-200">Perpres 46/2025</Badge>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowRegDetail(true); setSelectedReg(0); }} data-testid="button-reg-tender">
              <BookOpen className="w-4 h-4 mr-1" /> Regulasi
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)} data-testid="button-create-tender">
              <Plus className="w-4 h-4 mr-1" /> Buat Dokumen
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <Badge className="mb-3 bg-green-600 text-white text-xs px-3 py-1">
              Generator AI × Perpres 46/2025 × Permen PUPR 14/2020
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Dokumen Tender<br />
              <span className="text-green-600">Konstruksi Pemerintah & Swasta</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              Platform generate dokumen tender konstruksi bertenaga AI — dari <strong>surat penawaran</strong>,
              <strong> BOQ & RAB</strong>, <strong>metode pelaksanaan</strong>, <strong>RK3K</strong>,
              hingga <strong>AHSP</strong> sesuai format standar Perpres 46/2025 dan Permen PUPR 14/2020.
              Dilengkapi <strong>checklist kepatuhan</strong> dan <strong>template preset</strong> per jenis proyek.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Surat Penawaran", "BOQ & RAB", "Metode Pelaksanaan", "RK3K", "AHSP", "Checklist Perpres"].map(b => (
                <Badge key={b} variant="outline" className="text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: "Dokumen Dibuat", val: (documents as TenderDocument[]).length.toString(), desc: "Total dokumen di akun Anda", color: "text-green-600" },
              { icon: CheckCircle2, label: "Kesiapan Tender", val: complianceProgress > 0 ? `${complianceProgress}%` : "—", desc: "Dari checklist kepatuhan", color: "text-blue-600" },
              { icon: Layers, label: "Template Tersedia", val: templatePreset.length.toString(), desc: "Preset per jenis proyek", color: "text-amber-600" },
              { icon: Shield, label: "Standar Regulasi", val: "4", desc: "Perpres, Permen, PP, SNI", color: "text-purple-600" },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
                  <div className="text-2xl font-bold">{s.val}</div>
                  <div className="text-xs font-semibold text-slate-700">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 h-auto mb-6">
            <TabsTrigger value="generator" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-generator">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="template" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-template">
              <Star className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Template</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-checklist">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="panduan" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-panduan">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Panduan</span>
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: GENERATOR ────────────────────────────────────────────── */}
          <TabsContent value="generator" className="space-y-5">
            <Card className="bg-green-50/40 border-green-200">
              <CardContent className="py-4 flex items-center gap-3">
                <Zap className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Generator Dokumen Otomatis — OpenClaw AI</div>
                  <div className="text-xs text-muted-foreground">Isi data proyek → sistem generate dokumen lengkap sesuai standar pengadaan pemerintah. Estimasi waktu: 30–60 detik.</div>
                </div>
                <Button size="sm" onClick={() => setShowCreateDialog(true)} data-testid="button-create-tender-2">
                  <Plus className="w-4 h-4 mr-1" /> Buat Baru
                </Button>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="py-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (documents as TenderDocument[]).length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-semibold mb-1">Belum ada dokumen tender</p>
                  <p className="text-sm text-muted-foreground mb-4">Buat dokumen baru atau gunakan template preset di tab "Template"</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button onClick={() => setShowCreateDialog(true)} data-testid="button-first-tender">
                      <Plus className="w-4 h-4 mr-1" /> Buat Dokumen Pertama
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("template")} data-testid="button-goto-template">
                      <Star className="w-4 h-4 mr-1" /> Lihat Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(documents as TenderDocument[]).map(doc => (
                  <Card key={doc.id} className="hover:border-green-300 transition-colors" data-testid={`card-tender-${doc.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{doc.projectName}</CardTitle>
                        <Badge variant={statusLabels[doc.status || "draft"].variant} className="flex-shrink-0">
                          {statusLabels[doc.status || "draft"].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="text-xs">{projectTypes.find(t => t.value === doc.projectType)?.label || doc.projectType}</span>
                        </div>
                        {doc.projectLocation && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span className="text-xs">{doc.projectLocation}</span></div>}
                        {doc.deadline && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /><span className="text-xs">{new Date(doc.deadline).toLocaleDateString("id-ID")}</span></div>}
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-xs">{documentTypes.find(t => t.value === doc.documentType)?.label || doc.documentType}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 gap-2">
                      {doc.status === "generated" && doc.generatedContent ? (
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => { setSelectedDoc(doc); setShowViewDialog(true); }} data-testid={`button-view-${doc.id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Lihat Dokumen
                        </Button>
                      ) : (
                        <Button className="flex-1" size="sm" onClick={() => generateMutation.mutate(doc.id)} disabled={generateMutation.isPending} data-testid={`button-generate-${doc.id}`}>
                          {generateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileCheck className="w-3.5 h-3.5 mr-1" />}
                          Generate AI
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── TAB: TEMPLATE PRESET ─────────────────────────────────────── */}
          <TabsContent value="template" className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Pilih template sesuai jenis proyek untuk mengisi formulir secara otomatis dan mendapatkan panduan spesifik.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatePreset.map(p => (
                <Card key={p.id} className="hover:border-green-300 transition-all cursor-pointer" data-testid={`card-preset-${p.id}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-bold text-sm mb-1">{p.nama}</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="secondary" className="text-[10px]">SBU Min: {p.sbuMin}</Badge>
                      <Badge variant="outline" className="text-[10px]">{p.sections.length} seksi</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.tips}</div>
                    <div className="space-y-1 mb-3">
                      <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-wide">Seksi Dokumen:</div>
                      <div className="flex flex-wrap gap-1">
                        {p.sections.slice(0, 4).map(s => (
                          <div key={s} className="text-[10px] bg-slate-100 rounded px-1.5 py-0.5">{s}</div>
                        ))}
                        {p.sections.length > 4 && <div className="text-[10px] bg-slate-100 rounded px-1.5 py-0.5">+{p.sections.length - 4} lagi</div>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" size="sm" onClick={() => applyPreset(p)} data-testid={`button-use-preset-${p.id}`}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Gunakan Template Ini
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Dokumen Yang Dihasilkan */}
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-600" /> Jenis Dokumen yang Dapat Dihasilkan
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {dokumenTenderDetail.map(cat => (
                  <Card key={cat.kategori} className={`border ${cat.warna.split(" ")[0]} ${cat.warna.split(" ")[1]}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${cat.badge}`}>{cat.kategori}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cat.items.map(item => (
                          <div key={item.nama} className="flex gap-2 text-xs">
                            {item.wajib
                              ? <CheckCheck className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                              : <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />}
                            <div>
                              <span className="font-semibold">{item.nama}</span>
                              {" — "}
                              <span className="text-muted-foreground">{item.ket}</span>
                              <Badge variant={item.wajib ? "default" : "secondary"} className="text-[9px] h-3.5 px-1 ml-1">
                                {item.wajib ? "Wajib" : "Kondisional"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: CHECKLIST KEPATUHAN ─────────────────────────────────── */}
          <TabsContent value="checklist" className="space-y-5">
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5">Checklist Kepatuhan Tender — Perpres 46/2025 + Permen PUPR 14/2020</div>
                  <div className="text-xs text-muted-foreground">Centang setiap item yang sudah disiapkan sebelum memasukkan dokumen penawaran.</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">{complianceProgress}%</div>
                    <div className="text-xs text-muted-foreground">{checkedItems}/{totalItems} poin</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-checklist-tender">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Salin
                  </Button>
                </div>
              </CardContent>
              <div className="px-6 pb-4">
                <Progress value={complianceProgress} className="h-2" />
                <div className={`text-xs font-semibold mt-1.5 ${complianceProgress >= 80 ? "text-green-600" : complianceProgress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                  {complianceProgress >= 90 ? "✅ Siap submit penawaran!"
                    : complianceProgress >= 70 ? "⚠️ Hampir lengkap — cek item yang belum"
                    : complianceProgress >= 40 ? "🔶 Masih banyak yang perlu disiapkan"
                    : "🔴 Dokumen belum siap — lengkapi terlebih dahulu"}
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              {checklistKepatuhan.map(sec => (
                <Card key={sec.section}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      {sec.section}
                      <Badge variant="secondary" className="text-[10px] ml-auto">
                        {sec.items.filter(i => checkState[sec.section]?.[i.isi]).length}/{sec.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sec.items.map(item => (
                        <div
                          key={item.isi}
                          className={`flex gap-3 p-2 rounded-lg border cursor-pointer transition-colors text-xs ${checkState[sec.section]?.[item.isi] ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"}`}
                          onClick={() => toggleCheck(sec.section, item.isi)}
                          data-testid={`check-${sec.section}-${item.isi.slice(0, 20)}`}
                        >
                          <Checkbox checked={!!checkState[sec.section]?.[item.isi]} onCheckedChange={() => toggleCheck(sec.section, item.isi)} className="mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            {item.isi}
                            {" "}
                            <Badge variant={item.wajib ? "default" : "secondary"} className="text-[9px] h-3.5 px-1">
                              {item.wajib ? "Wajib" : "Kondisional"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-from-checklist">
                <Plus className="w-4 h-4 mr-1" /> Buat Dokumen Sekarang
              </Button>
              <Link href="/agent-hub">
                <Button variant="outline" data-testid="button-konsultasi-tender">
                  <Zap className="w-4 h-4 mr-1" /> Konsultasi AI Tender
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ── TAB: PANDUAN ─────────────────────────────────────────────── */}
          <TabsContent value="panduan" className="space-y-5">
            {/* Regulasi */}
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" /> Regulasi Pengadaan Konstruksi
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {regulasiPengadaan.map((r, i) => (
                  <button
                    key={r.kode}
                    onClick={() => { setSelectedReg(i); setShowRegDetail(true); }}
                    className="flex gap-3 p-4 rounded-xl border bg-white hover:border-green-300 transition-all text-left"
                    data-testid={`button-reg-tender-${i}`}
                  >
                    <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm">{r.kode}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.judul}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Alur Proses Tender */}
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" /> Alur Proses Tender Konstruksi (SPSE/LPSE)
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { no: 1, judul: "Pengumuman Tender", detail: "PPK/Pokja mengumumkan paket lelang di SPSE (LPSE) — termasuk nilai HPS, persyaratan kualifikasi, dan jadwal." },
                  { no: 2, judul: "Pendaftaran & Pengambilan Dokumen", detail: "Peserta mendaftar di SPSE, unduh dokumen pemilihan. Daftar peserta tidak perlu hadir fisik." },
                  { no: 3, judul: "Pemberian Penjelasan (Aanwijzing)", detail: "Pokja memberikan penjelasan teknis via SPSE. Peserta bisa ajukan pertanyaan secara online." },
                  { no: 4, judul: "Pemasukan Penawaran", detail: "Upload dokumen penawaran (admin+teknis+harga) ke SPSE dalam format terenkripsi sebelum batas waktu." },
                  { no: 5, judul: "Pembukaan & Evaluasi Penawaran", detail: "Pokja membuka file penawaran. Evaluasi: kualifikasi → gugur → teknis → harga. Sistem gugur." },
                  { no: 6, judul: "Klarifikasi & Negosiasi", detail: "Pokja meminta klarifikasi teknis/harga. Untuk metode 2 amplop, negosiasi harga bisa dilakukan." },
                  { no: 7, judul: "Penetapan & Pengumuman Pemenang", detail: "Pokja menetapkan pemenang. Diumumkan di SPSE — masa sanggah 5 hari kalender." },
                  { no: 8, judul: "Penandatanganan Kontrak", detail: "PPK dan pemenang menandatangani kontrak. Pemenang wajib serahkan jaminan pelaksanaan (5% nilai kontrak)." },
                ].map((s, idx) => (
                  <Card key={s.no} className={idx % 2 === 0 ? "bg-green-50/30 border-green-200" : ""}>
                    <CardContent className="pt-4 pb-3">
                      <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center mb-2">{s.no}</div>
                      <div className="text-sm font-bold mb-1">{s.judul}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{s.detail}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tips Menang Tender */}
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                  <Star className="w-5 h-5 text-amber-500" /> Tips Meningkatkan Peluang Menang Tender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Award, tip: "Pastikan SBU sesuai subklasifikasi & gred yang dipersyaratkan — ini paling sering jadi sebab gugur." },
                    { icon: Users, tip: "Siapkan personel manajerial (PM, SM, K3) dengan SKK aktif — nama + jenjang harus sesuai persyaratan." },
                    { icon: Target, tip: "Baca dokumen lelang dengan teliti — ikuti format BQ dan spesifikasi teknis dengan tepat, jangan asal copy-paste." },
                    { icon: TrendingUp, tip: "Hitung RAB secara realistis — nilai terlalu rendah (di bawah 80% HPS) bisa memicu klarifikasi atau diskualifikasi." },
                    { icon: Shield, tip: "RK3K yang detail dan spesifik per pekerjaan memberi poin tambahan di evaluasi teknis Pokja." },
                    { icon: Clock, tip: "Upload penawaran jauh sebelum batas waktu — SPSE bisa lambat saat mendekati deadline. Jangan mepet!" },
                  ].map(t => (
                    <div key={t.tip} className="flex gap-3 p-3 rounded-lg bg-white border border-amber-200">
                      <t.icon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs">{t.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold mb-1">Siap Buat Dokumen Tender?</div>
                  <p className="text-sm text-muted-foreground">Gunakan generator AI atau konsultasi dengan Agen Tender OpenClaw untuk panduan lengkap strategi penawaran.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Button onClick={() => { setActiveTab("generator"); setShowCreateDialog(true); }} data-testid="button-cta-buat-tender">
                    <Plus className="w-4 h-4 mr-1" /> Buat Dokumen
                  </Button>
                  <Link href="/agent-hub">
                    <Button variant="outline" data-testid="button-cta-ai-tender">
                      <Zap className="w-4 h-4 mr-1" /> Tanya AI Tender
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="Lengkapi persiapan tender Anda dengan tools dan sertifikasi berikut:"
          services={[
            { href: "/mini-apps", icon: Zap, label: "Kalkulator Jaminan & TKDN", desc: "Hitung jaminan penawaran, pelaksanaan, uang muka & skor TKDN", color: "bg-teal-600", badge: "Tools" },
            { href: "/doc-generator", icon: ClipboardList, label: "Generator Dokumen Hukum", desc: "Draft addendum kontrak, surat kuasa, PKS, BAST & SPK proyek", color: "bg-rose-600" },
            { href: "/sbu", icon: Award, label: "SBU Konstruksi", desc: "Pastikan sertifikasi LPJK aktif sebelum memasukkan penawaran", color: "bg-amber-600", badge: "Wajib" },
            { href: "/ai-chat", icon: Cpu, label: "Konsultasi AI Tender", desc: "Tanya strategi harga, evaluasi HPS, dan analisis dokumen lelang", color: "bg-indigo-600", badge: "AI" },
          ]}
          nextStep={{ href: "/mini-apps", label: "Hitung Jaminan Tender →", icon: Zap }}
        />
      </main>

      {/* Dialog Regulasi */}
      <Dialog open={showRegDetail} onOpenChange={setShowRegDetail}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              {regulasiPengadaan[selectedReg]?.kode}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="font-semibold text-green-900">{regulasiPengadaan[selectedReg]?.judul}</div>
            </div>
            {regulasiPengadaan[selectedReg]?.poin.map((p, i) => (
              <div key={i} className="flex gap-2 text-sm p-3 rounded-lg bg-white border">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
            <div className="flex gap-2 flex-wrap">
              {regulasiPengadaan.map((r, i) => (
                <button key={r.kode} onClick={() => setSelectedReg(i)} className={`flex-1 min-w-20 p-2 rounded-lg border text-[10px] font-semibold transition-all ${selectedReg === i ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 hover:border-green-300"}`} data-testid={`button-switch-reg-tender-${i}`}>
                  {r.kode.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setShowRegDetail(false)} data-testid="button-close-reg-tender">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Buat Dokumen */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Buat Dokumen Tender Baru
              {selectedPreset && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Template: {templatePreset.find(p => p.id === selectedPreset)?.nama}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informasi Proyek</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Nama Proyek *</Label>
                  <Input placeholder="Pembangunan Gedung Kantor Dinas..." value={newDoc.projectName} onChange={e => setNewDoc({ ...newDoc, projectName: e.target.value })} data-testid="input-project-name" />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Proyek *</Label>
                  <Select value={newDoc.projectType} onValueChange={v => setNewDoc({ ...newDoc, projectType: v })}>
                    <SelectTrigger data-testid="select-project-type"><SelectValue /></SelectTrigger>
                    <SelectContent>{projectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jenis Dokumen *</Label>
                  <Select value={newDoc.documentType} onValueChange={v => setNewDoc({ ...newDoc, documentType: v })}>
                    <SelectTrigger data-testid="select-document-type"><SelectValue /></SelectTrigger>
                    <SelectContent>{documentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nilai Proyek (Rp)</Label>
                  <Input placeholder="Rp 5.000.000.000" value={newDoc.projectValue} onChange={e => setNewDoc({ ...newDoc, projectValue: e.target.value })} data-testid="input-project-value" />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi Proyek</Label>
                  <Input placeholder="Kota/Kabupaten, Provinsi" value={newDoc.projectLocation} onChange={e => setNewDoc({ ...newDoc, projectLocation: e.target.value })} data-testid="input-project-location" />
                </div>
                <div className="space-y-2">
                  <Label>Pemberi Kerja / PPK</Label>
                  <Input placeholder="Dinas PU / PT..." value={newDoc.clientName} onChange={e => setNewDoc({ ...newDoc, clientName: e.target.value })} data-testid="input-client-name" />
                </div>
                <div className="space-y-2">
                  <Label>Batas Waktu Penawaran</Label>
                  <Input type="date" value={newDoc.deadline} onChange={e => setNewDoc({ ...newDoc, deadline: e.target.value })} data-testid="input-deadline" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Data Perusahaan Peserta</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Nama Perusahaan</Label>
                  <Input placeholder="PT. Nama Perusahaan Konstruksi" value={newDoc.companyName} onChange={e => setNewDoc({ ...newDoc, companyName: e.target.value })} data-testid="input-company-name" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Alamat Perusahaan</Label>
                  <Textarea placeholder="Jl. ..." value={newDoc.companyAddress} onChange={e => setNewDoc({ ...newDoc, companyAddress: e.target.value })} rows={2} data-testid="input-company-address" />
                </div>
                <div className="space-y-2">
                  <Label>NPWP Perusahaan</Label>
                  <Input placeholder="00.000.000.0-000.000" value={newDoc.npwp} onChange={e => setNewDoc({ ...newDoc, npwp: e.target.value })} data-testid="input-npwp" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Direktur</Label>
                  <Input placeholder="Nama lengkap penandatangan" value={newDoc.directorName} onChange={e => setNewDoc({ ...newDoc, directorName: e.target.value })} data-testid="input-director-name" />
                </div>
                <div className="space-y-2">
                  <Label>Nomor SBU</Label>
                  <Input placeholder="Nomor sertifikat SBU" value={newDoc.sbuNumber} onChange={e => setNewDoc({ ...newDoc, sbuNumber: e.target.value })} data-testid="input-sbu-number" />
                </div>
                <div className="space-y-2">
                  <Label>Klasifikasi SBU</Label>
                  <Input placeholder="BG001 / SI001 / MK001" value={newDoc.sbuClassification} onChange={e => setNewDoc({ ...newDoc, sbuClassification: e.target.value })} data-testid="input-sbu-classification" />
                </div>
              </div>
            </div>
            {selectedPreset && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-xs font-semibold text-green-800 mb-1">Tips Template:</div>
                <p className="text-xs text-green-700">{templatePreset.find(p => p.id === selectedPreset)?.tips}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setSelectedPreset(null); }}>Batal</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-tender">
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Menyimpan...</> : "Simpan Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog View Dokumen */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-base">{selectedDoc?.projectName}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy">
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Disalin" : "Salin"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download">
                  <Download className="w-4 h-4 mr-1" /> Unduh TXT
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-slate-50 p-4 rounded-lg overflow-x-auto border leading-relaxed">
              {selectedDoc?.generatedContent || "Tidak ada konten"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
