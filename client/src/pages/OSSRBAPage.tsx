import { useState } from "react";
import { Link } from "wouter";
import { RelatedServices } from "@/components/ServiceNav";
import { ConsultationModal } from "@/components/ConsultationModal";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, Search, FileText, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Download, Copy, ExternalLink, Info,
  Building2, Zap, AlertTriangle, XCircle, CheckCheck,
  BookOpen, ClipboardList, Globe, FileCheck, Layers, ArrowRight,
  Users, RefreshCw, Star, Award, GraduationCap
} from "lucide-react";

// ─── KBLI Data Konstruksi ──────────────────────────────────────────────────
const kbliData = [
  { kode: "41011", nama: "Konstruksi Gedung Hunian", risiko: "menengah-tinggi", sektor: "Konstruksi Gedung", ket: "Rumah tapak, rumah susun, apartemen" },
  { kode: "41012", nama: "Konstruksi Gedung Perkantoran", risiko: "menengah-tinggi", sektor: "Konstruksi Gedung", ket: "Kantor, gedung komersial" },
  { kode: "41013", nama: "Konstruksi Gedung Perbelanjaan", risiko: "menengah-tinggi", sektor: "Konstruksi Gedung", ket: "Mall, ruko, pusat perbelanjaan" },
  { kode: "41014", nama: "Konstruksi Gedung Industri", risiko: "tinggi", sektor: "Konstruksi Gedung", ket: "Pabrik, gudang, workshop industri" },
  { kode: "41015", nama: "Konstruksi Gedung Kesehatan", risiko: "tinggi", sektor: "Konstruksi Gedung", ket: "Rumah sakit, klinik, laboratorium" },
  { kode: "41016", nama: "Konstruksi Gedung Pendidikan", risiko: "menengah-tinggi", sektor: "Konstruksi Gedung", ket: "Sekolah, universitas, balai pelatihan" },
  { kode: "41019", nama: "Konstruksi Gedung Lainnya", risiko: "menengah-rendah", sektor: "Konstruksi Gedung", ket: "Gedung serbaguna, balai pertemuan" },
  { kode: "42101", nama: "Konstruksi Jalan Raya dan Jalan Bebas Hambatan", risiko: "tinggi", sektor: "Konstruksi Sipil", ket: "Jalan tol, jalan nasional, jalan provinsi" },
  { kode: "42102", nama: "Konstruksi Jembatan dan Terowongan", risiko: "tinggi", sektor: "Konstruksi Sipil", ket: "Jembatan, underpass, flyover" },
  { kode: "42201", nama: "Konstruksi Bangunan Prasarana Sumber Daya Air", risiko: "tinggi", sektor: "Konstruksi Sipil", ket: "Bendungan, irigasi, drainase" },
  { kode: "42202", nama: "Konstruksi Jaringan Irigasi, Komunikasi dan Limbah", risiko: "menengah-tinggi", sektor: "Konstruksi Sipil", ket: "Saluran air, pipa, drainase kota" },
  { kode: "42911", nama: "Konstruksi Bangunan Pengolahan dan Penampungan", risiko: "tinggi", sektor: "Konstruksi Sipil", ket: "IPAL, reservoir, tanki" },
  { kode: "43211", nama: "Instalasi Kelistrikan", risiko: "menengah-tinggi", sektor: "Mekanikal-Elektrikal", ket: "Panel listrik, jaringan distribusi" },
  { kode: "43212", nama: "Instalasi Sistem Tata Udara", risiko: "menengah-rendah", sektor: "Mekanikal-Elektrikal", ket: "AC, ventilasi, HVAC" },
  { kode: "43221", nama: "Instalasi Sistem Proteksi Kebakaran", risiko: "menengah-tinggi", sektor: "Mekanikal-Elektrikal", ket: "Sprinkler, hydrant, fire alarm" },
  { kode: "43222", nama: "Instalasi Sanitasi, Air, dan Pipa", risiko: "menengah-rendah", sektor: "Mekanikal-Elektrikal", ket: "Plumbing, air bersih, air kotor" },
  { kode: "43290", nama: "Instalasi Bangunan Lainnya", risiko: "rendah", sektor: "Mekanikal-Elektrikal", ket: "IT building, smart building" },
  { kode: "71101", nama: "Aktivitas Arsitektur", risiko: "rendah", sektor: "Konsultansi", ket: "Konsultan arsitektur, desain bangunan" },
  { kode: "71102", nama: "Aktivitas Rekayasa & Konsultansi Teknis", risiko: "rendah", sektor: "Konsultansi", ket: "Konsultan teknik sipil, mekanikal" },
  { kode: "71103", nama: "Aktivitas Penyelidikan dan Keamanan Bangunan", risiko: "menengah-rendah", sektor: "Konsultansi", ket: "Pengawas konstruksi, inspeksi" },
];

// ─── Risk Level Config ─────────────────────────────────────────────────────
const risikoConfig = {
  rendah: {
    label: "Risiko Rendah",
    color: "bg-green-100 text-green-800 border-green-200",
    badge: "bg-green-500",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    waktu: "1-3 hari kerja",
    izinDihasilkan: "NIB (Nomor Induk Berusaha)",
    deskripsi: "Usaha langsung mendapatkan NIB. Tidak diperlukan Izin maupun Sertifikat Standar. Pelaku usaha cukup melakukan self-declare pemenuhan standar kegiatan usaha.",
    persyaratan: [
      "KTP/NIK Penanggung Jawab (WNI)",
      "Akta Pendirian Perusahaan (PT/CV) + SK Kemenkumham",
      "NPWP Badan Usaha (aktif)",
      "Email & nomor HP aktif untuk akun OSS",
      "Dokumen lokasi usaha (jika diperlukan)",
    ],
    dokumen: [
      { nama: "NIB (Nomor Induk Berusaha)", keterangan: "Terbit otomatis setelah pengisian data OSS", wajib: true },
      { nama: "Pernyataan Mandiri Pemenuhan Standar", keterangan: "Self-declare melalui sistem OSS", wajib: true },
      { nama: "NPWP Badan Usaha", keterangan: "Terintegrasi dengan DJP online", wajib: true },
    ],
    tahapan: [
      { no: 1, judul: "Registrasi Akun OSS", detail: "Buat akun di oss.go.id menggunakan NIK atau akun BPJS Ketenagakerjaan." },
      { no: 2, judul: "Pengisian Data Pelaku Usaha", detail: "Isi data perusahaan, skala usaha (Mikro/Kecil/Menengah/Besar), dan KBLI kegiatan usaha." },
      { no: 3, judul: "Penerbitan NIB", detail: "NIB diterbitkan langsung oleh sistem OSS setelah data lengkap dan valid." },
      { no: 4, judul: "Aktivasi & Penggunaan", detail: "NIB berlaku sebagai identitas berusaha, TDP, API, dan akses BPJS Ketenagakerjaan & Kesehatan." },
    ],
    regulasi: ["PP No. 28/2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko", "Permenperin terkait KBLI sektor usaha"],
  },
  "menengah-rendah": {
    label: "Risiko Menengah Rendah",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    badge: "bg-yellow-500",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    waktu: "3-7 hari kerja",
    izinDihasilkan: "NIB + Sertifikat Standar (Pernyataan Mandiri)",
    deskripsi: "Usaha mendapatkan NIB dan Sertifikat Standar berdasarkan pernyataan mandiri (self-declare). Sertifikat Standar belum memerlukan verifikasi pemerintah, namun harus dipenuhi sebelum kegiatan usaha dimulai.",
    persyaratan: [
      "KTP/NIK Penanggung Jawab (WNI)",
      "Akta Pendirian + SK Kemenkumham",
      "NPWP Badan Usaha (aktif)",
      "Data KBLI yang tepat dan spesifik",
      "Bukti kepemilikan/sewa lokasi usaha",
      "Pernyataan pemenuhan standar K3",
    ],
    dokumen: [
      { nama: "NIB (Nomor Induk Berusaha)", keterangan: "Terbit otomatis dari sistem OSS", wajib: true },
      { nama: "Sertifikat Standar (self-declare)", keterangan: "Pernyataan mandiri pemenuhan standar kegiatan usaha", wajib: true },
      { nama: "Rencana Penggunaan Tenaga Kerja Asing (RPTKA)", keterangan: "Jika menggunakan tenaga asing", wajib: false },
      { nama: "Bukti Lokasi Usaha", keterangan: "IMB/PBG atau surat keterangan lokasi dari pemda", wajib: true },
      { nama: "Sertifikat Laik Fungsi (SLF)", keterangan: "Jika menggunakan gedung baru", wajib: false },
    ],
    tahapan: [
      { no: 1, judul: "Registrasi & Data Usaha di OSS", detail: "Buat akun OSS, isi data perusahaan dan KBLI dengan kode yang tepat untuk mendapat klasifikasi risiko menengah-rendah." },
      { no: 2, judul: "Penerbitan NIB", detail: "NIB terbit otomatis. Sertifikat Standar terbit dengan status 'belum diverifikasi'." },
      { no: 3, judul: "Pemenuhan Standar Kegiatan Usaha", detail: "Pelaku usaha mengisi formulir self-declare pemenuhan standar yang dipersyaratkan untuk KBLI tersebut." },
      { no: 4, judul: "Upload Dokumen Pendukung", detail: "Upload bukti lokasi, pernyataan K3, dan dokumen lain yang dipersyaratkan sesuai bidang usaha." },
      { no: 5, judul: "Penggunaan Sertifikat Standar", detail: "Kegiatan usaha dapat dimulai dengan Sertifikat Standar self-declare yang sudah diterbitkan OSS." },
    ],
    regulasi: ["PP No. 28/2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko", "Permen PUPR terkait standar konstruksi", "Peraturan daerah terkait izin lokasi"],
  },
  "menengah-tinggi": {
    label: "Risiko Menengah Tinggi",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    badge: "bg-orange-500",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    waktu: "7-21 hari kerja",
    izinDihasilkan: "NIB + Sertifikat Standar (Verifikasi Pemerintah)",
    deskripsi: "Usaha mendapatkan NIB dan Sertifikat Standar yang harus diverifikasi oleh pemerintah (K/L/D) sebelum kegiatan usaha dimulai. Wajib memenuhi standar usaha yang dipersyaratkan dan dibuktikan melalui verifikasi lapangan atau dokumen.",
    persyaratan: [
      "KTP/NIK Penanggung Jawab",
      "Akta Pendirian + SK Kemenkumham + Perubahan Terbaru",
      "NPWP Badan Usaha (aktif, tidak dalam sengketa)",
      "SIUJK / SBU dari LPJK (untuk BUJK konstruksi)",
      "SKK Tenaga Ahli Penanggung Jawab Teknis (PJT)",
      "Bukti Kepemilikan/Sewa Lokasi Usaha (minimal 1 tahun)",
      "IMB/PBG atau izin lokasi dari pemda setempat",
      "Dokumen K3 Konstruksi (SMK3 untuk usaha besar)",
      "Neraca keuangan/laporan keuangan 1 tahun terakhir",
      "Daftar peralatan konstruksi (minimal)",
    ],
    dokumen: [
      { nama: "NIB (Nomor Induk Berusaha)", keterangan: "Terbit otomatis dari sistem OSS", wajib: true },
      { nama: "Sertifikat Standar (Verifikasi Pemda)", keterangan: "Sertifikat Standar diterbitkan setelah verifikasi oleh instansi berwenang", wajib: true },
      { nama: "SIUJK / SBU Konstruksi (LPJK)", keterangan: "Wajib bagi badan usaha jasa konstruksi", wajib: true },
      { nama: "SKK PJT (Penanggung Jawab Teknis)", keterangan: "SKK sesuai sub-bidang pekerjaan dari LSP/BNSP", wajib: true },
      { nama: "Dokumen Lokasi & IMB/PBG", keterangan: "Persetujuan Bangunan Gedung dari pemda", wajib: true },
      { nama: "Rencana K3 Konstruksi", keterangan: "Wajib untuk proyek konstruksi nilai > Rp 100 juta", wajib: true },
      { nama: "Laporan Keuangan Audited", keterangan: "Untuk skala usaha menengah dan besar", wajib: false },
      { nama: "Neraca Aset Peralatan", keterangan: "Daftar kepemilikan/sewa peralatan utama", wajib: true },
      { nama: "Izin Lingkungan / SPPL", keterangan: "SPPL untuk dampak kecil, AMDAL untuk dampak besar", wajib: false },
    ],
    tahapan: [
      { no: 1, judul: "Persiapan Dokumen Lengkap", detail: "Siapkan semua dokumen legalitas, SBU, SKK, lokasi, dan K3 sebelum mendaftar OSS." },
      { no: 2, judul: "Input Data di Portal OSS", detail: "Registrasi/login OSS, pilih KBLI yang sesuai, isi data usaha secara lengkap dan akurat." },
      { no: 3, judul: "Penerbitan NIB", detail: "NIB terbit otomatis. Sertifikat Standar terbit dengan status 'belum terverifikasi'." },
      { no: 4, judul: "Upload Dokumen Verifikasi", detail: "Upload SBU, SKK PJT, bukti lokasi, K3, dan dokumen wajib lainnya melalui portal OSS atau dinas terkait." },
      { no: 5, judul: "Proses Verifikasi Instansi", detail: "Dinas PU/Perkim atau instansi berwenang melakukan verifikasi dokumen dan/atau verifikasi lapangan." },
      { no: 6, judul: "Penerbitan Sertifikat Standar", detail: "Sertifikat Standar yang sudah terverifikasi diterbitkan. Kegiatan usaha dapat dimulai secara resmi." },
    ],
    regulasi: [
      "PP No. 28/2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko",
      "UU No. 2/2017 tentang Jasa Konstruksi",
      "PP No. 22/2020 tentang Peraturan Pelaksanaan UUJK",
      "Permen PUPR No. 6/2021 tentang Standar Kegiatan Usaha BUJK",
      "Peraturan LPJK tentang SBU & SKK Konstruksi",
    ],
  },
  tinggi: {
    label: "Risiko Tinggi",
    color: "bg-red-100 text-red-800 border-red-200",
    badge: "bg-red-500",
    icon: XCircle,
    iconColor: "text-red-500",
    waktu: "21-60 hari kerja",
    izinDihasilkan: "NIB + Izin (Persetujuan Pemerintah)",
    deskripsi: "Kegiatan usaha dengan risiko tinggi memerlukan NIB dan Izin yang diterbitkan oleh pemerintah (K/L/D) setelah verifikasi menyeluruh. Izin hanya terbit setelah seluruh persyaratan terpenuhi dan diverifikasi secara menyeluruh.",
    persyaratan: [
      "KTP/NIK Penanggung Jawab",
      "Akta Pendirian + SK Kemenkumham + Anggaran Dasar Terbaru",
      "NPWP Badan Usaha (aktif, tidak bermasalah pajak)",
      "SBU Konstruksi Grade 4-7 dari LPJK (untuk BUJK besar)",
      "SKK Tenaga Ahli Madya/Utama (PJT & PJB)",
      "SMK3 (Sistem Manajemen K3) Gold/Silver – PP 50/2012",
      "ISO 45001:2018 atau ISO 9001:2015 (direkomendasikan)",
      "AMDAL atau UKL-UPL yang sudah disetujui KLHK/pemda",
      "Laporan Keuangan Audited oleh KAP (2 tahun terakhir)",
      "Bukti kepemilikan alat berat (STNK, BPKB, atau kontrak sewa)",
      "Modal disetor minimum sesuai klasifikasi BUJK",
      "Riwayat pengalaman proyek (referensi kontrak sejenis)",
    ],
    dokumen: [
      { nama: "NIB (Nomor Induk Berusaha)", keterangan: "Terbit otomatis, menjadi identitas dasar usaha", wajib: true },
      { nama: "IZIN USAHA (Persetujuan Pemerintah)", keterangan: "Izin yang diterbitkan setelah verifikasi menyeluruh oleh K/L/D", wajib: true },
      { nama: "SBU Konstruksi Grade 4-7 (LPJK)", keterangan: "Sertifikat Badan Usaha dari LPJK — wajib untuk BUJK besar", wajib: true },
      { nama: "SKK Tenaga Ahli Madya/Utama (BNSP)", keterangan: "Min. 2 Tenaga Ahli — PJT & PJB sesuai sub-bidang", wajib: true },
      { nama: "AMDAL / UKL-UPL yang Telah Disetujui", keterangan: "Dokumen lingkungan hidup dari KLHK atau Dinas LH pemda", wajib: true },
      { nama: "SMK3 (Sertifikat Sistem Manajemen K3)", keterangan: "PP 50/2012 — Gold/Silver sesuai skala usaha", wajib: true },
      { nama: "Laporan Keuangan Audited 2 Tahun", keterangan: "Oleh Kantor Akuntan Publik (KAP) terdaftar OJK", wajib: true },
      { nama: "Izin Lokasi & IMB/PBG", keterangan: "Dari pemda — wajib sebelum aktivitas konstruksi dimulai", wajib: true },
      { nama: "Izin Khusus Sektoral", keterangan: "Izin tambahan dari Kemen ESDM, KLHK, Kemen ATR/BPN sesuai jenis proyek", wajib: false },
      { nama: "SIUJK sektoral (listrik, tambang, migas)", keterangan: "Izin usaha konstruksi sektoral dari kementerian teknis terkait", wajib: false },
      { nama: "Neraca & Daftar Peralatan Konstruksi", keterangan: "Daftar aset dan kepemilikan alat berat utama yang diverifikasi", wajib: true },
    ],
    tahapan: [
      { no: 1, judul: "Audit Kesiapan Dokumen Internal", detail: "Review menyeluruh semua dokumen legalitas, teknis, keuangan, lingkungan, dan K3 sebelum mengajukan ke OSS." },
      { no: 2, judul: "Pengurusan Dokumen Persyaratan Utama", detail: "Proses SBU LPJK, SKK BNSP, SMK3, dan AMDAL lebih dulu karena waktu pengurusannya paling lama (30-90 hari)." },
      { no: 3, judul: "Input Data Lengkap di Portal OSS", detail: "Login OSS, pilih KBLI sesuai kegiatan usaha risiko tinggi, isi semua data usaha dengan akurat." },
      { no: 4, judul: "Penerbitan NIB", detail: "NIB terbit otomatis. Izin Usaha masih dalam status 'belum terbit' sampai verifikasi selesai." },
      { no: 5, judul: "Upload & Submit Dokumen Persyaratan", detail: "Upload seluruh dokumen wajib ke sistem OSS. Sistem akan meneruskan ke instansi berwenang untuk diverifikasi." },
      { no: 6, judul: "Verifikasi oleh Kementerian/Dinas Teknis", detail: "K/L/D melakukan verifikasi dokumen dan kunjungan lapangan (site visit). Proses ini 14-30 hari kerja." },
      { no: 7, judul: "Penerbitan Izin Usaha", detail: "Setelah semua persyaratan terpenuhi dan diverifikasi, Izin Usaha diterbitkan. Kegiatan usaha boleh dimulai." },
    ],
    regulasi: [
      "PP No. 28/2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko",
      "UU No. 2/2017 tentang Jasa Konstruksi",
      "PP No. 22/2020 tentang Peraturan Pelaksanaan UUJK",
      "PP No. 50/2012 tentang SMK3",
      "UU No. 32/2009 tentang Perlindungan & Pengelolaan Lingkungan Hidup",
      "Permen PUPR No. 6/2021 tentang Standar Kegiatan Usaha BUJK",
      "Permen LH No. 16/2012 tentang Pedoman Penyusunan AMDAL",
    ],
  },
};

const risikoOrder = ["rendah", "menengah-rendah", "menengah-tinggi", "tinggi"] as const;

type RisikoKey = typeof risikoOrder[number];

const risikoLabel: Record<string, string> = {
  rendah: "Rendah",
  "menengah-rendah": "Menengah-Rendah",
  "menengah-tinggi": "Menengah-Tinggi",
  tinggi: "Tinggi",
};

// ─── Checklist State ───────────────────────────────────────────────────────
interface CheckItem { nama: string; keterangan: string; wajib: boolean; checked: boolean; }

export default function OSSRBAPage() {
  const { toast } = useToast();
  const [searchKBLI, setSearchKBLI] = useState("");
  const [filterSektor, setFilterSektor] = useState("semua");
  const [activeTab, setActiveTab] = useState<RisikoKey>("menengah-tinggi");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistRisiko, setChecklistRisiko] = useState<RisikoKey>("menengah-tinggi");
  const [checklist, setChecklist] = useState<CheckItem[]>([]);

  const sektorList = Array.from(new Set(kbliData.map(k => k.sektor)));

  const filteredKBLI = kbliData.filter(k => {
    const matchSearch =
      k.kode.includes(searchKBLI) ||
      k.nama.toLowerCase().includes(searchKBLI.toLowerCase()) ||
      k.ket.toLowerCase().includes(searchKBLI.toLowerCase());
    const matchSektor = filterSektor === "semua" || k.sektor === filterSektor;
    return matchSearch && matchSektor;
  });

  function openChecklist(risiko: RisikoKey) {
    const cfg = risikoConfig[risiko];
    setChecklistRisiko(risiko);
    setChecklist(cfg.dokumen.map(d => ({ ...d, checked: false })));
    setShowChecklist(true);
  }

  function toggleCheck(idx: number) {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  }

  const checked = checklist.filter(c => c.checked).length;
  const checkProgress = checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0;

  function copyChecklist() {
    const lines = checklist.map(c => `${c.checked ? "✅" : "⬜"} ${c.nama} — ${c.keterangan}`).join("\n");
    const text = `CHECKLIST DOKUMEN OSS-RBA — ${risikoConfig[checklistRisiko].label}\n${"─".repeat(50)}\n${lines}\n\nProgress: ${checked}/${checklist.length} dokumen`;
    navigator.clipboard.writeText(text);
    toast({ title: "Checklist disalin!", description: "Teks checklist sudah tersalin ke clipboard." });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-oss">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-bold text-slate-800">OSS-RBA</span>
            <Badge variant="secondary" className="text-xs">PP 28/2025</Badge>
          </div>
          <div className="ml-auto flex gap-2">
            <ConsultationModal serviceType="perizinan" serviceLabel="OSS-RBA & Perizinan" triggerSize="sm" data-testid="button-konsultasi-oss" />
            <Link href="/agent-hub">
              <Button size="sm" variant="outline" data-testid="button-ai-oss">
                <Zap className="w-4 h-4 mr-1" /> Konsultasi AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Badge className="mb-3 bg-blue-600 text-white text-xs px-3 py-1">
              Online Single Submission — Risk Based Approach
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Perizinan Usaha OSS-RBA<br />
              <span className="text-primary">Konstruksi & Jasa Teknis</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              OSS-RBA adalah sistem perizinan berusaha berbasis risiko yang diperbarui melalui <strong>PP No. 28/2025</strong> (menggantikan PP No. 5/2021).
              Setiap kegiatan usaha diklasifikasikan ke dalam 4 tingkat risiko yang menentukan jenis izin yang diterbitkan —
              dari NIB saja hingga NIB + Izin Penuh dari pemerintah.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Terintegrasi BPJS
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Terintegrasi LPJK
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Real-time Tracking
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {risikoOrder.map(r => {
              const cfg = risikoConfig[r];
              const Icon = cfg.icon;
              return (
                <button
                  key={r}
                  onClick={() => setActiveTab(r)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    activeTab === r ? "border-primary bg-primary/5 shadow" : "border-slate-200 bg-white hover:border-primary/40"
                  }`}
                  data-testid={`button-risiko-${r}`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${cfg.iconColor}`} />
                  <div className="text-xs font-bold text-slate-700 leading-tight">{cfg.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{cfg.waktu}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alur Proses OSS-RBA Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Kerangka Sistem OSS-RBA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 overflow-x-auto pb-2">
              {[
                { step: "1", judul: "Identifikasi KBLI", sub: "Tentukan kode KBLI\nkegiatan usaha Anda", color: "bg-blue-500" },
                { step: "2", judul: "Klasifikasi Risiko", sub: "Sistem menentukan\ntingkat risiko", color: "bg-blue-400" },
                { step: "3", judul: "Input Data Usaha", sub: "Isi data di portal\noss.go.id", color: "bg-blue-300" },
                { step: "4", judul: "Terbit NIB", sub: "Nomor Induk Berusaha\nterbit otomatis", color: "bg-green-400" },
                { step: "5", judul: "Penuhi Standar / Izin", sub: "Sesuai level risiko\nkegiatan usaha", color: "bg-orange-400" },
                { step: "6", judul: "Usaha Beroperasi", sub: "Izin lengkap &\nlegal sepenuhnya", color: "bg-green-500" },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center text-sm font-bold`}>
                      {s.step}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-2 text-center leading-tight">{s.judul}</div>
                    <div className="text-[10px] text-muted-foreground text-center mt-0.5 whitespace-pre-line">{s.sub}</div>
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-[-20px]" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Per Level Risiko */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Detail Perizinan per Tingkat Risiko
          </h2>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as RisikoKey)}>
            <TabsList className="grid grid-cols-4 mb-6 h-auto">
              {risikoOrder.map(r => {
                const cfg = risikoConfig[r];
                const Icon = cfg.icon;
                return (
                  <TabsTrigger key={r} value={r} className="flex flex-col gap-0.5 py-2 px-1 h-auto text-xs" data-testid={`tab-risiko-${r}`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    <span className="hidden sm:block leading-tight text-center">{cfg.label}</span>
                    <span className="block sm:hidden leading-tight text-center">{risikoLabel[r]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {risikoOrder.map(risikoKey => {
              const cfg = risikoConfig[risikoKey];
              const Icon = cfg.icon;
              return (
                <TabsContent key={risikoKey} value={risikoKey} className="space-y-5">
                  {/* Summary Banner */}
                  <div className={`p-4 rounded-xl border ${cfg.color} flex flex-col md:flex-row md:items-center gap-4`}>
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-8 h-8 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <div className="font-bold text-base">{cfg.label}</div>
                        <div className="text-sm mt-1 opacity-90">{cfg.deskripsi}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0 md:text-right">
                      <div className="text-xs font-semibold opacity-70">Estimasi Waktu</div>
                      <div className="flex items-center gap-1 md:justify-end">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold">{cfg.waktu}</span>
                      </div>
                      <div className="text-xs opacity-70 mt-1">Izin yang diterbitkan:</div>
                      <Badge className="text-[10px] bg-white/70 text-slate-800 w-fit md:ml-auto">{cfg.izinDihasilkan}</Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Persyaratan */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-primary" /> Persyaratan Dokumen
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {cfg.persyaratan.map((p, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Tahapan */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" /> Tahapan Proses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-3">
                          {cfg.tahapan.map(t => (
                            <li key={t.no} className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                                {t.no}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{t.judul}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{t.detail}</div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dokumen yang Dihasilkan */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" /> Dokumen yang Harus Disiapkan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {cfg.dokumen.map((d, i) => (
                          <div key={i} className="flex gap-2 p-3 rounded-lg border bg-slate-50">
                            <div className="flex-shrink-0 mt-0.5">
                              {d.wajib
                                ? <CheckCheck className="w-4 h-4 text-primary" />
                                : <Info className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{d.nama}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{d.keterangan}</div>
                              <Badge variant={d.wajib ? "default" : "secondary"} className="text-[10px] mt-1 h-4 px-1">
                                {d.wajib ? "Wajib" : "Kondisional"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openChecklist(risikoKey)}
                        data-testid={`button-checklist-${risikoKey}`}
                      >
                        <ClipboardList className="w-4 h-4 mr-1" /> Buka Checklist Interaktif
                      </Button>
                      <ConsultationModal
                        serviceType="perizinan"
                        serviceLabel={`OSS-RBA Risiko ${risikoKey}`}
                        triggerLabel={`Urus Izin ${risikoKey}`}
                        triggerSize="sm"
                        data-testid={`button-konsultasi-${risikoKey}`}
                      />
                    </CardFooter>
                  </Card>

                  {/* Regulasi */}
                  <Card className="bg-blue-50/60 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                        <BookOpen className="w-4 h-4" /> Dasar Hukum & Regulasi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {cfg.regulasi.map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm text-blue-900">
                            <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* KBLI Lookup */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Cari KBLI Konstruksi & Jasa Teknis
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode KBLI, nama, atau keterangan..."
                    value={searchKBLI}
                    onChange={e => setSearchKBLI(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-kbli"
                  />
                </div>
                <Select value={filterSektor} onValueChange={setFilterSektor}>
                  <SelectTrigger className="w-full sm:w-52" data-testid="select-sektor-kbli">
                    <SelectValue placeholder="Semua Sektor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Sektor</SelectItem>
                    {sektorList.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredKBLI.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Tidak ada KBLI yang cocok dengan pencarian ini.
                  </div>
                ) : (
                  filteredKBLI.map(k => {
                    const rCfg = risikoConfig[k.risiko as RisikoKey];
                    const Icon = rCfg?.icon || AlertCircle;
                    return (
                      <div
                        key={k.kode}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-white hover:border-primary/40 transition-colors"
                        data-testid={`kbli-row-${k.kode}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="font-mono font-bold text-primary text-sm bg-primary/5 px-2 py-1 rounded">{k.kode}</div>
                          <div>
                            <div className="text-sm font-medium">{k.nama}</div>
                            <div className="text-xs text-muted-foreground">{k.ket}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">{k.sektor}</Badge>
                          <button
                            onClick={() => setActiveTab(k.risiko as RisikoKey)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${rCfg?.color || ""} font-medium`}
                            data-testid={`button-kbli-risiko-${k.kode}`}
                          >
                            <Icon className="w-3 h-3" />
                            {risikoLabel[k.risiko]}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Menampilkan {filteredKBLI.length} dari {kbliData.length} KBLI. Klik badge risiko untuk melihat detail persyaratan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-blue-50 to-primary/5 border-primary/20">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Butuh Bantuan Urus OSS-RBA?</h3>
              <p className="text-sm text-muted-foreground">
                Tim konsultan kami siap membantu pengurusan NIB, Sertifikat Standar, dan Izin OSS-RBA
                untuk badan usaha jasa konstruksi Anda — dari persiapan dokumen hingga izin terbit.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { icon: Users, text: "Konsultan Berpengalaman" },
                  { icon: Clock, text: "SLA Terukur per Level" },
                  { icon: RefreshCw, text: "Pembaruan Izin Berkala" },
                  { icon: Star, text: "Tracking Real-time" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <f.icon className="w-3.5 h-3.5 text-primary" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/agent-hub">
                <Button className="w-full" data-testid="button-cta-agent-hub">
                  <Zap className="w-4 h-4 mr-2" /> Konsultasi AI Gratis
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => openChecklist("menengah-tinggi")} data-testid="button-cta-checklist">
                <ClipboardList className="w-4 h-4 mr-2" /> Buat Checklist Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="Perizinan OSS-RBA selesai? Lengkapi sertifikasi usaha konstruksi Anda:"
          services={[
            { href: "/legalitas", icon: Building2, label: "Legalitas Badan Usaha", desc: "Pastikan legalitas PT/CV/Koperasi sudah lengkap sebelum OSS-RBA", color: "bg-slate-700" },
            { href: "/sbu", icon: Award, label: "SBU Konstruksi", desc: "Sertifikasi Badan Usaha LPJK — wajib untuk ikut tender", color: "bg-amber-600", badge: "Wajib Tender" },
            { href: "/skk", icon: GraduationCap, label: "SKK Tenaga Ahli", desc: "Sertifikasi Kompetensi Kerja untuk tenaga ahli & terampil", color: "bg-purple-600" },
            { href: "/ai-chat", icon: Zap, label: "Konsultasi AI OpenClaw", desc: "Tanya strategi perizinan, KBLI, dan risiko usaha konstruksi", color: "bg-indigo-600", badge: "AI" },
          ]}
          nextStep={{ href: "/sbu", label: "Lanjut ke SBU Konstruksi →", icon: Award }}
        />
      </main>

      {/* Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-primary" />
              Checklist Dokumen — {risikoConfig[checklistRisiko].label}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress kelengkapan</span>
                <span className="font-bold">{checked}/{checklist.length} dokumen</span>
              </div>
              <Progress value={checkProgress} className="h-2" />
              {checkProgress === 100 && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Semua dokumen siap! Anda dapat mengajukan perizinan OSS-RBA.
                </p>
              )}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    item.checked ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"
                  }`}
                  onClick={() => toggleCheck(idx)}
                  data-testid={`checklist-item-${idx}`}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCheck(idx)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      {item.nama}
                      <Badge variant={item.wajib ? "default" : "secondary"} className="text-[10px] h-4 px-1 flex-shrink-0">
                        {item.wajib ? "Wajib" : "Kondisional"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.keterangan}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Select Risiko */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-muted-foreground flex-shrink-0">Level risiko:</span>
              <Select value={checklistRisiko} onValueChange={v => {
                const r = v as RisikoKey;
                setChecklistRisiko(r);
                setChecklist(risikoConfig[r].dokumen.map(d => ({ ...d, checked: false })));
              }}>
                <SelectTrigger className="flex-1" data-testid="select-checklist-risiko">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {risikoOrder.map(r => (
                    <SelectItem key={r} value={r}>{risikoConfig[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-checklist">
              <Copy className="w-4 h-4 mr-1" /> Salin Checklist
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChecklist(prev => prev.map(c => ({ ...c, checked: false })))} data-testid="button-reset-checklist">
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowChecklist(false)} data-testid="button-close-checklist">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
