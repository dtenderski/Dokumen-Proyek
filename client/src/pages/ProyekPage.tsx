import { useState } from "react";
import { RelatedServices } from "@/components/ServiceNav";
import { ConsultationModal } from "@/components/ConsultationModal";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  ArrowLeft, FolderOpen, FileText, BookOpen, ClipboardList,
  ChevronRight, CheckCircle2, CheckCheck, Info, TrendingUp,
  Layers, Shield, Star, Clock, Users, AlertTriangle, Zap,
  Copy, Award, Building2, Calendar, Activity, FileCheck,
  BarChart3, RefreshCw, HardHat, Printer, PenLine, Archive,
  FileBadge, Gavel, ScrollText, Package
} from "lucide-react";

// ─── Fase & Dokumen Proyek ────────────────────────────────────────────────
const faseProyek = [
  {
    id: "pra",
    fase: "Pra-Konstruksi",
    warna: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    icon: PenLine,
    iconColor: "text-blue-600",
    durasi: "Sebelum Mulai Konstruksi",
    dokumen: [
      {
        nama: "Kontrak Kerja Konstruksi",
        ket: "Dokumen perjanjian antara PPK dan penyedia jasa — mencakup lingkup, nilai, jangka waktu, dan syarat-syarat khusus kontrak",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: ["Kontrak Harga Satuan (Unit Price)", "Kontrak Lump Sum", "Kontrak Putar Kunci (Turnkey)", "Kontrak Terima Jadi (KSO)"],
      },
      {
        nama: "Surat Perintah Mulai Kerja (SPMK)",
        ket: "Instruksi resmi PPK kepada penyedia untuk memulai pekerjaan — menentukan tanggal awal kontrak dan batas waktu selesai",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Jaminan Pelaksanaan (Bank Garansi)",
        ket: "5% dari nilai kontrak — diserahkan sebelum penandatanganan kontrak, berlaku sampai serah terima pertama (BAST-1)",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Rencana Mutu Kontrak (RMK)",
        ket: "Dokumen jaminan kualitas pelaksanaan — berisi prosedur mutu, titik inspeksi, dan mekanisme pengendalian kualitas material & pekerjaan",
        regulasi: "Permen PUPR No. 10 Tahun 2021",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Rencana K3 Kontrak (RK3K)",
        ket: "Dokumen keselamatan konstruksi — IBPR, APD, prosedur darurat, rambu, dan anggaran K3 terperinci",
        regulasi: "Permen PUPR No. 10 Tahun 2021",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Mutual Check 0% (MC-0)",
        ket: "Pemeriksaan lapangan bersama PPK dan penyedia untuk konfirmasi kondisi awal — titik referensi elevasi, volume, dan gambaran existing",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
    ],
  },
  {
    id: "pelaksanaan",
    fase: "Selama Pelaksanaan",
    warna: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-800",
    icon: HardHat,
    iconColor: "text-green-600",
    durasi: "Sepanjang Masa Kontrak",
    dokumen: [
      {
        nama: "Laporan Harian",
        ket: "Catatan harian: cuaca, tenaga kerja, material masuk/digunakan, alat, pekerjaan yang dilaksanakan, dan catatan insiden K3",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Laporan Mingguan",
        ket: "Rekapitulasi laporan harian per minggu — progress pekerjaan, kurva-S aktual vs rencana, kendala, dan rencana minggu berikutnya",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Laporan Bulanan",
        ket: "Laporan komprehensif per bulan — progress kumulatif, pembayaran, risiko, foto dokumentasi, dan proyeksi penyelesaian",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Berita Acara Kemajuan Pekerjaan",
        ket: "BA untuk pengajuan pembayaran termin — disepakati PPK dan penyedia berdasarkan progres fisik yang diverifikasi konsultan pengawas",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: ["BA Pembayaran Termin I", "BA Pembayaran Termin II", "BA Pembayaran Termin III", "BA Pembayaran Akhir"],
      },
      {
        nama: "Berita Acara Pemeriksaan Pekerjaan",
        ket: "BA pemeriksaan mutu/kualitas item pekerjaan tertentu — ditandatangani Direksi Lapangan/Konsultan Pengawas",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Addendum Kontrak",
        ket: "Perubahan kontrak (lingkup, nilai, waktu) — diperlukan jika ada pekerjaan tambah/kurang, perpanjangan waktu, atau force majeure",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: false,
        subtipe: ["Addendum Lingkup Pekerjaan", "Addendum Nilai Kontrak", "Addendum Perpanjangan Waktu (PHO)", "Addendum Force Majeure"],
      },
      {
        nama: "Surat Peringatan (SP) 1, 2, 3",
        ket: "SP diterbitkan PPK bila penyedia terlambat melebihi threshold. SP-3 dapat berujung pemutusan kontrak",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: false,
        subtipe: [],
      },
      {
        nama: "Mutual Check 100% (MC-100)",
        ket: "Pemeriksaan volume pekerjaan final bersama sebelum serah terima pertama — menghasilkan BA MC-100 sebagai dasar pembayaran akhir",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
    ],
  },
  {
    id: "serah-terima",
    fase: "Serah Terima & Pasca Konstruksi",
    warna: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    icon: FileBadge,
    iconColor: "text-amber-600",
    durasi: "Akhir Kontrak + Masa Pemeliharaan",
    dokumen: [
      {
        nama: "Berita Acara Serah Terima Pertama (BAST-1 / PHO)",
        ket: "Provisional Hand Over — serah terima setelah pekerjaan fisik 100% selesai. Dimulainya masa pemeliharaan (6–12 bulan)",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Jaminan Pemeliharaan (Retention Bond)",
        ket: "5% dari nilai kontrak — diserahkan saat PHO, berlaku selama masa pemeliharaan (pengganti uang retensi 5%)",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "As-Built Drawing",
        ket: "Gambar terpasang (sesuai kondisi nyata di lapangan) — wajib diserahkan ke PPK sebelum BAST-1. Mencakup semua revisi selama konstruksi",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: ["Arsitektur As-Built", "Struktur As-Built", "ME As-Built (M/E/Plumbing)", "Site Plan As-Built"],
      },
      {
        nama: "Manual O&M (Operasional & Pemeliharaan)",
        ket: "Panduan pengoperasian dan pemeliharaan bangunan/infrastruktur yang diserahkan kepada pengguna akhir",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Dokumen Jaminan Produk (Garansi Pabrik)",
        ket: "Sertifikat garansi peralatan utama (panel, lift, AC, genset, pompa) dari pabrik atau distributor resmi",
        regulasi: "Spesifikasi Teknis Kontrak",
        wajib: false,
        subtipe: [],
      },
      {
        nama: "Berita Acara Serah Terima Kedua (BAST-2 / FHO)",
        ket: "Final Hand Over — setelah masa pemeliharaan selesai dan semua cacat mutu diperbaiki. Jaminan Pemeliharaan dikembalikan",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: true,
        subtipe: [],
      },
      {
        nama: "Laporan Akhir Proyek",
        ket: "Ringkasan seluruh pelaksanaan proyek: capaian, kendala, foto, realisasi anggaran, dan rekomendasi untuk proyek sejenis",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: true,
        subtipe: [],
      },
    ],
  },
  {
    id: "klaim",
    fase: "Klaim & Sengketa",
    warna: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-800",
    icon: Gavel,
    iconColor: "text-red-600",
    durasi: "Sesuai Kebutuhan",
    dokumen: [
      {
        nama: "Dokumen Klaim Penyedia",
        ket: "Pengajuan klaim biaya/waktu oleh penyedia akibat: perubahan desain, kondisi lapangan berbeda, keterlambatan pembayaran, atau force majeure",
        regulasi: "Permen PUPR No. 22 Tahun 2023",
        wajib: false,
        subtipe: ["Klaim Biaya Tambah (Change Order)", "Klaim Perpanjangan Waktu", "Klaim Force Majeure", "Klaim Eskalasi Harga"],
      },
      {
        nama: "Surat Keberatan / Sanggahan",
        ket: "Keberatan formal penyedia atas keputusan PPK — harus diajukan dalam 14 hari kerja sejak keputusan PPK diterima",
        regulasi: "Perpres No. 46 Tahun 2025",
        wajib: false,
        subtipe: [],
      },
      {
        nama: "Dokumen Arbitrase / BANI",
        ket: "Jika sengketa tidak selesai secara musyawarah — diserahkan ke Badan Arbitrase Nasional Indonesia (BANI) atau PTUN",
        regulasi: "UU No. 30 Tahun 1999 (Arbitrase)",
        wajib: false,
        subtipe: [],
      },
    ],
  },
];

// ─── Regulasi Dokumen Proyek ───────────────────────────────────────────────
const regulasiProyek = [
  {
    kode: "Permen PUPR No. 22 Tahun 2023",
    judul: "Pedoman Pengelolaan Kontrak Pengadaan Jasa Konstruksi",
    poin: [
      "Dasar hukum tata kelola kontrak jasa konstruksi — mengatur hak-kewajiban PPK dan penyedia, serta format dokumen kontrak.",
      "Format standar kontrak: SPMK, BA Kemajuan, BA Pemeriksaan, Addendum, BA Serah Terima (PHO & FHO).",
      "Prosedur pembayaran termin: berdasarkan progres fisik yang diverifikasi, disertai BA Kemajuan bertandatangan PPK.",
      "Mekanisme perpanjangan waktu: penyedia wajib mengajukan sebelum kontrak berakhir dengan bukti dokumen yang valid.",
      "Denda keterlambatan: 1/1000 per hari dari nilai bagian kontrak yang terlambat (maks. 5% dari nilai kontrak).",
    ],
  },
  {
    kode: "Permen PUPR No. 10 Tahun 2021",
    judul: "Pedoman SMKK (Sistem Manajemen Keselamatan Konstruksi)",
    poin: [
      "RK3K wajib ada sebelum pekerjaan dimulai — format standar: IBPR, pengendalian risiko, APD, prosedur darurat.",
      "Direksi Lapangan / Konsultan Pengawas wajib memeriksa pelaksanaan RK3K setiap hari.",
      "Laporan K3 harian dicatat dalam laporan harian proyek — menjadi lampiran laporan bulanan.",
      "Insiden K3 wajib dilaporkan ke Kementerian PUPR dalam 1x24 jam sejak kejadian.",
    ],
  },
  {
    kode: "Perpres No. 46 Tahun 2025",
    judul: "Pengadaan Barang/Jasa Pemerintah (Pengganti Perpres 16/2018)",
    poin: [
      "Dasar hukum jaminan pelaksanaan (5% nilai kontrak) dan jaminan pemeliharaan (5% nilai kontrak).",
      "Prosedur serah terima: PHO → masa pemeliharaan → FHO — setiap tahap didokumentasikan dengan BA resmi.",
      "Addendum kontrak harus disetujui PPK dan PA/KPA — tidak boleh melampaui 10% dari nilai kontrak tanpa persetujuan tambahan.",
      "Pemutusan kontrak: PPK dapat memutus kontrak setelah SP-3 tanpa menunggu keputusan pengadilan.",
    ],
  },
  {
    kode: "UU No. 2 Tahun 2017 + PP No. 22 Tahun 2020",
    judul: "Undang-Undang & PP Jasa Konstruksi",
    poin: [
      "Tanggung jawab penyedia atas kegagalan konstruksi: min. 10 tahun sejak serah terima (BAST-2).",
      "Kewajiban asuransi konstruksi (Construction All Risk/CAR) selama masa pelaksanaan.",
      "Penyedia wajib menyerahkan laporan keuangan proyek dan dokumen teknis saat FHO.",
      "Arbitrase sebagai mekanisme penyelesaian sengketa utama — BANI atau sesuai klausul kontrak.",
    ],
  },
];

// ─── Checklist Dokumen Proyek ─────────────────────────────────────────────
const checklistProyek = [
  { section: "Pra-Konstruksi", items: [
    { isi: "Kontrak Kerja Konstruksi sudah ditandatangani kedua pihak (PPK & Penyedia)", wajib: true },
    { isi: "SPMK (Surat Perintah Mulai Kerja) sudah diterima dari PPK", wajib: true },
    { isi: "Jaminan Pelaksanaan (Bank Garansi 5%) sudah diserahkan ke PPK", wajib: true },
    { isi: "Rencana Mutu Kontrak (RMK) sudah dibuat dan disetujui", wajib: true },
    { isi: "RK3K sudah disusun sesuai Permen PUPR 10/2021 dan disetujui Direksi Lapangan", wajib: true },
    { isi: "Mutual Check 0% (MC-0) sudah dilaksanakan dan BA MC-0 sudah ditandatangani", wajib: true },
    { isi: "Asuransi Konstruksi (CAR) sudah aktif sejak tanggal SPMK", wajib: true },
  ]},
  { section: "Selama Pelaksanaan", items: [
    { isi: "Laporan Harian diisi setiap hari kerja oleh Pelaksana dan ditandatangani Direksi Lapangan", wajib: true },
    { isi: "Laporan Mingguan disampaikan setiap akhir pekan lengkap dengan kurva-S aktual", wajib: true },
    { isi: "Laporan Bulanan disampaikan paling lambat tanggal 5 bulan berikutnya", wajib: true },
    { isi: "BA Kemajuan Pekerjaan ditandatangani sebelum pengajuan tagihan termin", wajib: true },
    { isi: "Foto dokumentasi per item pekerjaan: 0% / 50% / 100%", wajib: true },
    { isi: "Addendum dibuat jika ada perubahan lingkup, nilai, atau waktu kontrak", wajib: false },
    { isi: "Mutual Check 100% (MC-100) dilaksanakan sebelum pengajuan BAST-1", wajib: true },
  ]},
  { section: "Serah Terima (PHO & FHO)", items: [
    { isi: "As-Built Drawing (semua disiplin) sudah diselesaikan dan diperiksa Direksi Lapangan", wajib: true },
    { isi: "BA Serah Terima Pertama (BAST-1 / PHO) sudah ditandatangani PPK", wajib: true },
    { isi: "Jaminan Pemeliharaan (Retention Bond 5%) sudah diserahkan ke PPK saat PHO", wajib: true },
    { isi: "Manual O&M sudah diserahkan ke pengguna akhir (tim operasional/fasilitas)", wajib: true },
    { isi: "Sertifikat Garansi peralatan utama sudah dikumpulkan dari supplier/subkon", wajib: false },
    { isi: "Semua cacat mutu (defect list) dari masa pemeliharaan sudah diperbaiki", wajib: true },
    { isi: "BA Serah Terima Kedua (BAST-2 / FHO) sudah ditandatangani PPK", wajib: true },
    { isi: "Laporan Akhir Proyek sudah diserahkan ke PPK/owner setelah FHO", wajib: true },
  ]},
];

// ─── Jenis Kontrak ────────────────────────────────────────────────────────
const jenisKontrak = [
  {
    nama: "Kontrak Harga Satuan (Unit Price)",
    cocokUntuk: "Pekerjaan dengan volume yang belum pasti saat lelang — dihitung per item setelah pekerjaan selesai (MC)",
    keuntungan: ["Volume aktual dibayar sesuai realisasi", "Fleksibel untuk perubahan volume", "Risiko volume ada di PPK"],
    risiko: ["Nilai akhir bisa berbeda jauh dari RAB", "Administrasi MC lebih kompleks"],
    contoh: "Jalan, drainase, saluran irigasi, gedung bertahap",
  },
  {
    nama: "Kontrak Lump Sum",
    cocokUntuk: "Pekerjaan dengan desain final dan gambar lengkap sudah tersedia — dibayar sesuai progres persentase",
    keuntungan: ["Nilai kontrak pasti — tidak berubah", "Administrasi lebih sederhana", "Tidak perlu MC volume"],
    risiko: ["Risiko volume ada di penyedia", "Addendum sulit diajukan untuk pekerjaan tambah"],
    contoh: "Gedung, jembatan dengan DED lengkap, interior turnkey",
  },
  {
    nama: "Kontrak Terima Jadi (Turnkey)",
    cocokUntuk: "Penyedia bertanggung jawab mulai dari desain, konstruksi, hingga serah terima dalam kondisi beroperasi (ready to operate)",
    keuntungan: ["Satu pihak bertanggung jawab penuh", "Lebih cepat (design-build)"],
    risiko: ["Nilai lebih tinggi (premium turnkey)", "PPK harus menyiapkan TOR yang sangat detail"],
    contoh: "RSUD, gedung perkantoran baru, fasilitas industri",
  },
  {
    nama: "Kontrak Putar Kunci (KSO/Konsorsium)",
    cocokUntuk: "Proyek skala besar yang dikerjakan bersama beberapa BUJK dalam bentuk Kerja Sama Operasi (KSO)",
    keuntungan: ["Kapasitas finansial dan teknis lebih besar", "Pembagian risiko antar anggota KSO"],
    risiko: ["Administrasi lebih kompleks", "Koordinasi antar anggota KSO perlu perjanjian internal"],
    contoh: "Jalan tol, bendungan, gedung di atas Rp 100 M",
  },
];

type CheckState = Record<string, Record<string, boolean>>;

export default function ProyekPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dokumen");
  const [activeFase, setActiveFase] = useState("pra");
  const [checkState, setCheckState] = useState<CheckState>({});
  const [showRegDetail, setShowRegDetail] = useState(false);
  const [selectedReg, setSelectedReg] = useState(0);

  function toggleCheck(section: string, item: string) {
    setCheckState(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [item]: !(prev[section]?.[item]) }
    }));
  }

  const totalItems = checklistProyek.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = Object.values(checkState).reduce((sum, sec) => sum + Object.values(sec).filter(Boolean).length, 0);
  const progress = Math.round((checkedItems / totalItems) * 100);

  function copyChecklist() {
    const lines = checklistProyek.map(s =>
      `## ${s.section}\n` + s.items.map(i => `${checkState[s.section]?.[i.isi] ? "✅" : "⬜"} ${i.isi}`).join("\n")
    ).join("\n\n");
    navigator.clipboard.writeText(`CHECKLIST DOKUMEN PROYEK KONSTRUKSI\n${"─".repeat(50)}\n${lines}\n\nKesiapan: ${checkedItems}/${totalItems} (${progress}%)`);
    toast({ title: "Checklist disalin!", description: "Checklist dokumen proyek tersalin ke clipboard." });
  }

  const fase = faseProyek.find(f => f.id === activeFase) || faseProyek[0];

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
            <FolderOpen className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-slate-800">Dokumen Proyek Konstruksi</span>
            <Badge className="text-xs bg-orange-100 text-orange-800 border border-orange-200">End-to-End</Badge>
            <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-200">Permen PUPR 22/2023</Badge>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { setShowRegDetail(true); setSelectedReg(0); }} data-testid="button-reg-proyek">
              <BookOpen className="w-4 h-4 mr-1" /> Regulasi
            </Button>
            <ConsultationModal serviceType="proyek" serviceLabel="Dokumen Proyek" triggerSize="sm" data-testid="button-konsultasi-proyek" />
            <Link href="/agent-hub">
              <Button size="sm" variant="outline" data-testid="button-ai-proyek">
                <Zap className="w-4 h-4 mr-1" /> Konsultasi AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <Badge className="mb-3 bg-orange-600 text-white text-xs px-3 py-1">
              Permen PUPR 22/2023 × Perpres 46/2025 × PP 28/2025
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Dokumen Proyek<br />
              <span className="text-orange-600">Konstruksi Pemerintah & Swasta</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              Platform penyiapan dan pengelolaan dokumen proyek konstruksi dari awal hingga selesai —
              mulai <strong>kontrak</strong>, <strong>SPMK</strong>, <strong>laporan harian/mingguan/bulanan</strong>,
              <strong> berita acara kemajuan</strong>, <strong>addendum</strong>, <strong>as-built drawing</strong>,
              hingga <strong>BAST-1 (PHO) dan BAST-2 (FHO)</strong> sesuai Permen PUPR No. 22 Tahun 2023.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Kontrak & SPMK", "Laporan Harian-Bulanan", "Berita Acara", "Addendum", "As-Built Drawing", "BAST PHO & FHO"].map(b => (
                <Badge key={b} variant="outline" className="text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3 text-orange-500" /> {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: "Jenis Dokumen", val: "24+", desc: "Dari pra-konstruksi hingga FHO", color: "text-orange-600" },
              { icon: CheckCircle2, label: "Kesiapan Dokumen", val: progress > 0 ? `${progress}%` : "—", desc: "Dari checklist proyek Anda", color: "text-green-600" },
              { icon: Layers, label: "Fase Proyek", val: "4", desc: "Pra, Pelaksanaan, Serah Terima, Klaim", color: "text-blue-600" },
              { icon: Shield, label: "Standar Regulasi", val: "4+", desc: "Permen PUPR, Perpres, PP, UU", color: "text-purple-600" },
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
            <TabsTrigger value="dokumen" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-dokumen">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Jenis Dokumen</span>
            </TabsTrigger>
            <TabsTrigger value="kontrak" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-kontrak">
              <ScrollText className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Jenis Kontrak</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-checklist-proyek">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="panduan" className="flex flex-col py-2 gap-0.5 text-xs h-auto" data-testid="tab-panduan-proyek">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:block font-bold">Panduan</span>
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: JENIS DOKUMEN ───────────────────────────────────────── */}
          <TabsContent value="dokumen" className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Pilih fase proyek untuk melihat dokumen yang harus disiapkan pada setiap tahap pelaksanaan.
            </p>

            {/* Fase Selector */}
            <div className="flex flex-wrap gap-2">
              {faseProyek.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFase(f.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${activeFase === f.id ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-700 hover:border-orange-300"}`}
                  data-testid={`button-fase-${f.id}`}
                >
                  <f.icon className="w-4 h-4" />
                  <span>{f.fase}</span>
                  <Badge variant="secondary" className={`text-[10px] ${activeFase === f.id ? "bg-orange-500 text-white" : ""}`}>
                    {f.dokumen.length}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Dokumen per Fase */}
            <Card className={`border ${fase.warna.split(" ")[0]} ${fase.warna.split(" ")[1]}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  <fase.icon className={`w-5 h-5 ${fase.iconColor}`} />
                  <div>
                    <div>{fase.fase}</div>
                    <div className="text-xs font-normal text-muted-foreground">{fase.durasi}</div>
                  </div>
                  <Badge className={`ml-auto text-xs ${fase.badge}`}>{fase.dokumen.length} dokumen</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fase.dokumen.map(dok => (
                    <div key={dok.nama} className="p-4 rounded-xl bg-white border shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {dok.wajib
                            ? <CheckCheck className="w-4 h-4 text-primary" />
                            : <Info className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm">{dok.nama}</span>
                            <Badge variant={dok.wajib ? "default" : "secondary"} className="text-[10px] h-4 px-1.5">
                              {dok.wajib ? "Wajib" : "Kondisional"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-slate-500">
                              {dok.regulasi}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{dok.ket}</p>
                          {dok.subtipe.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dok.subtipe.map(s => (
                                <div key={s} className="text-[10px] bg-slate-100 rounded px-2 py-0.5 border">{s}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alur Dokumen Mini */}
            <Card className="border-orange-200 bg-orange-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600" /> Alur Dokumen Proyek (End-to-End)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  {["Kontrak + SPMK", "→", "MC-0", "→", "RMK + RK3K", "→", "Laporan Harian", "→", "BA Kemajuan (Termin)", "→", "Addendum (jika ada)", "→", "MC-100", "→", "As-Built Drawing", "→", "BAST-1 (PHO)", "→", "Masa Pemeliharaan", "→", "BAST-2 (FHO)", "→", "Laporan Akhir"].map((step, i) =>
                    step === "→"
                      ? <ChevronRight key={i} className="w-3 h-3 text-slate-400" />
                      : <span key={i} className={`px-2 py-0.5 rounded font-semibold ${step.includes("BAST") ? "bg-orange-100 text-orange-800" : step.includes("Kontrak") ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"}`}>{step}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: JENIS KONTRAK ────────────────────────────────────────── */}
          <TabsContent value="kontrak" className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Pemilihan jenis kontrak berdampak pada cara penghitungan harga, risiko volume, dan mekanisme pembayaran. Pilih yang sesuai dengan kondisi proyek.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {jenisKontrak.map((k, i) => (
                <Card key={k.nama} className={`border-2 ${i === 0 ? "border-green-200" : i === 1 ? "border-blue-200" : i === 2 ? "border-amber-200" : "border-purple-200"}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      <Badge className={`mb-2 text-xs ${i === 0 ? "bg-green-100 text-green-800" : i === 1 ? "bg-blue-100 text-blue-800" : i === 2 ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"}`}>
                        {["Paling Umum", "Paling Sederhana", "Design-Build", "Proyek Besar"][i]}
                      </Badge>
                      <div className="font-bold">{k.nama}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed"><strong>Cocok untuk:</strong> {k.cocokUntuk}</p>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-green-700 mb-1">Keuntungan:</div>
                      <div className="space-y-1">
                        {k.keuntungan.map(p => (
                          <div key={p} className="flex gap-2 text-xs">
                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-red-700 mb-1">Perhatikan:</div>
                      <div className="space-y-1">
                        {k.risiko.map(p => (
                          <div key={p} className="flex gap-2 text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Contoh Proyek:</span> {k.contoh}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Klausul Penting Kontrak */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-orange-600" /> Klausul Penting dalam Kontrak Konstruksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { klausul: "Jangka Waktu Pelaksanaan", detail: "Tanggal mulai (SPMK) dan tanggal selesai. Basis perhitungan denda keterlambatan." },
                    { klausul: "Nilai Kontrak & Cara Bayar", detail: "Nilai kontrak termasuk PPN, skema termin (uang muka, termin I–III, akhir), dan retensi 5%." },
                    { klausul: "Jaminan-Jaminan", detail: "Jaminan Uang Muka, Jaminan Pelaksanaan, Jaminan Pemeliharaan — nilai, bank, dan masa berlaku." },
                    { klausul: "Denda & Ganti Rugi", detail: "1/1000 per hari dari nilai bagian kontrak yang terlambat, maks. 5% nilai kontrak." },
                    { klausul: "Force Majeure", detail: "Definisi, prosedur pemberitahuan (max 7 hari), dan akibat hukumnya (perpanjangan waktu)." },
                    { klausul: "Perubahan Lingkup (Change Order)", detail: "Prosedur pengajuan addendum — batas 10% tanpa persetujuan tambahan, di atas itu perlu PA/KPA." },
                    { klausul: "Pemutusan Kontrak", detail: "Kondisi PMK oleh PPK (SP-3 + 14 hari) dan PMK oleh penyedia (pembayaran terlambat >30 hari)." },
                    { klausul: "Penyelesaian Sengketa", detail: "Musyawarah → mediasi → arbitrase (BANI) atau pengadilan — sesuai klausul kontrak." },
                  ].map(k => (
                    <div key={k.klausul} className="p-3 rounded-lg border bg-slate-50">
                      <div className="font-semibold text-xs text-orange-800 mb-1">{k.klausul}</div>
                      <p className="text-xs text-muted-foreground">{k.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: CHECKLIST ───────────────────────────────────────────── */}
          <TabsContent value="checklist" className="space-y-5">
            <Card className="border-orange-200 bg-orange-50/40">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5">Checklist Dokumen Proyek Konstruksi</div>
                  <div className="text-xs text-muted-foreground">Centang dokumen yang sudah disiapkan/diselesaikan di setiap fase proyek.</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-700">{progress}%</div>
                    <div className="text-xs text-muted-foreground">{checkedItems}/{totalItems} dokumen</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-checklist-proyek">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Salin
                  </Button>
                </div>
              </CardContent>
              <div className="px-6 pb-4">
                <Progress value={progress} className="h-2" />
                <div className={`text-xs font-semibold mt-1.5 ${progress >= 80 ? "text-green-600" : progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                  {progress >= 90 ? "✅ Dokumentasi proyek sangat baik!"
                    : progress >= 70 ? "⚠️ Hampir lengkap — cek sisa dokumen"
                    : progress >= 40 ? "🔶 Masih banyak dokumen yang perlu disiapkan"
                    : "🔴 Dokumentasi proyek belum memadai"}
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {checklistProyek.map(sec => (
                <Card key={sec.section}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-orange-600" />
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
                          data-testid={`check-proyek-${item.isi.slice(0, 20)}`}
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

            <div className="flex gap-3 flex-wrap">
              <Link href="/agent-hub">
                <Button data-testid="button-konsultasi-dok-proyek">
                  <Zap className="w-4 h-4 mr-1" /> Konsultasi Dokumen Proyek
                </Button>
              </Link>
              <Link href="/tender-generator">
                <Button variant="outline" data-testid="button-goto-tender">
                  <FileText className="w-4 h-4 mr-1" /> Generator Dokumen Tender
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ── TAB: PANDUAN ─────────────────────────────────────────────── */}
          <TabsContent value="panduan" className="space-y-5">

            {/* Regulasi */}
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" /> Regulasi Dokumen Proyek Konstruksi
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {regulasiProyek.map((r, i) => (
                  <button
                    key={r.kode}
                    onClick={() => { setSelectedReg(i); setShowRegDetail(true); }}
                    className="flex gap-3 p-4 rounded-xl border bg-white hover:border-orange-300 transition-all text-left"
                    data-testid={`button-reg-proyek-${i}`}
                  >
                    <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm">{r.kode}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.judul}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Penyebab Sengketa */}
            <Card className="border-red-200 bg-red-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Penyebab Utama Sengketa Proyek & Pencegahannya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { masalah: "Addendum terlambat diterbitkan", solusi: "Ajukan surat permohonan addendum sebelum pekerjaan tambah dikerjakan — jangan tunggu pekerjaan selesai." },
                    { masalah: "BA Kemajuan tidak sesuai progres aktual", solusi: "Lakukan pengukuran bersama Direksi Lapangan sebelum tandatangan BA — jangan tanda tangan jika tidak sesuai." },
                    { masalah: "As-Built Drawing tidak dibuat selama konstruksi", solusi: "Update gambar setiap ada perubahan di lapangan — jangan kerjakan di akhir setelah semua selesai." },
                    { masalah: "Laporan harian tidak terisi rutin", solusi: "Siapkan format digital laporan harian — isi setiap hari, tanda tangan Direksi Lapangan di tempat." },
                    { masalah: "Tidak ada dokumentasi foto progress", solusi: "Foto setiap item pekerjaan: sebelum (0%), setengah (50%), dan selesai (100%) dari sudut yang sama." },
                    { masalah: "Jaminan kedaluwarsa sebelum BAST ditandatangani", solusi: "Monitor tanggal jatuh tempo jaminan — perpanjang minimal 14 hari sebelum jatuh tempo jika proyek belum selesai." },
                  ].map(k => (
                    <div key={k.masalah} className="p-3 rounded-lg bg-white border border-red-100">
                      <div className="flex items-start gap-2 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold text-xs text-red-900">{k.masalah}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{k.solusi}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pembayaran Termin */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" /> Skema Pembayaran Kontrak (Contoh Termin 4)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { termin: "Uang Muka", persen: 20, keterangan: "Dibayar setelah penyedia serahkan Jaminan Uang Muka (nilai sama dengan UM). Dipotong proporsional di setiap termin." },
                    { termin: "Termin I — Progres 30%", persen: 25, keterangan: "Setelah BA Kemajuan termin I ditandatangani dan diverifikasi konsultan pengawas. Potongan UM." },
                    { termin: "Termin II — Progres 60%", persen: 25, keterangan: "Idem. Melampirkan bukti pengujian material utama (beton, baja, dll)." },
                    { termin: "Termin III — Progres 90%", persen: 20, keterangan: "Idem. Dokumen teknis sudah hampir lengkap (as-built draft, manual O&M draft)." },
                    { termin: "Pembayaran Akhir (FHO)", persen: 10, keterangan: "Setelah BAST-2 (FHO) ditandatangani dan Jaminan Pemeliharaan dikembalikan. Retensi 5% dilepas." },
                  ].map((t, i) => (
                    <div key={t.termin} className="flex gap-3 p-3 rounded-lg border items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {t.persen}%
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-xs mb-0.5">{t.termin}</div>
                        <div className="text-xs text-muted-foreground">{t.keterangan}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  * Skema termin dapat berbeda tergantung jenis kontrak dan kebijakan PPK. Biasanya diatur di Syarat-Syarat Khusus Kontrak (SSKK).
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-orange-900">
                  <Star className="w-5 h-5 text-amber-500" /> Tips Manajemen Dokumen Proyek yang Baik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Archive, tip: "Buat folder digital terstruktur per fase (Pra/Pelaksanaan/Serah Terima/Klaim) dan backup di cloud setiap minggu." },
                    { icon: Calendar, tip: "Catat di kalender semua tanggal penting: deadline termin, jatuh tempo jaminan, batas perpanjangan waktu." },
                    { icon: HardHat, tip: "Laporan harian yang konsisten adalah pertahanan terbaik jika ada sengketa — jangan lewatkan satu hari pun." },
                    { icon: CheckCheck, tip: "Minta tanda tangan BA dan laporan sesegera mungkin — jangan kumpulkan untuk ditandatangani sekaligus di akhir." },
                    { icon: RefreshCw, tip: "Update as-built drawing langsung saat ada perubahan di lapangan — bukan di akhir proyek." },
                    { icon: Users, tip: "Pastikan semua pihak (PPK, Direksi Lapangan, Konsultan, Penyedia) punya salinan dokumen yang sama." },
                  ].map(t => (
                    <div key={t.tip} className="flex gap-3 p-3 rounded-lg bg-white border border-orange-200">
                      <t.icon className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs">{t.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0">
              <CardContent className="pt-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold text-base mb-1">Butuh Bantuan Dokumen Proyek?</div>
                  <p className="text-sm text-orange-100">Konsultasi gratis dengan Agen Proyek OpenClaw — dari penyusunan kontrak, berita acara, hingga serah terima FHO.</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Link href="/agent-hub">
                    <Button className="bg-white text-orange-700 hover:bg-orange-50" data-testid="button-cta-ai-proyek">
                      <Zap className="w-4 h-4 mr-1" /> Tanya AI Proyek
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="outline" className="border-white text-white hover:bg-orange-700" data-testid="button-cta-dashboard-proyek">
                      <BarChart3 className="w-4 h-4 mr-1" /> Dashboard Proyek
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="Kelola proyek lebih efisien dengan tools dan layanan terintegrasi:"
          services={[
            { href: "/tender-generator", icon: FileText, label: "Generator Dokumen Tender", desc: "Buat dokumen penawaran, HPS, SPK & kontrak proyek", color: "bg-green-600", badge: "Tools" },
            { href: "/doc-generator", icon: Archive, label: "Generator Dokumen Hukum", desc: "Buat addendum kontrak, surat kuasa, PKS & MOU proyek", color: "bg-rose-600" },
            { href: "/mini-apps", icon: Zap, label: "Mini Apps Konstruksi", desc: "Kalkulator TKDN, hitung jaminan tender, & tools RAB lapangan", color: "bg-teal-600" },
            { href: "/ai-chat", icon: Award, label: "Konsultasi Sengketa Proyek", desc: "Tanya AI soal force majeure, addendum, klaim & arbitrase kontrak", color: "bg-amber-600", badge: "AI" },
          ]}
          nextStep={{ href: "/tender-generator", label: "Buat Dokumen Tender Sekarang →", icon: FileText }}
        />
      </main>

      {/* Dialog Regulasi */}
      {showRegDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowRegDetail(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-5 border-b">
              <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1 font-bold text-sm">{regulasiProyek[selectedReg]?.kode}</div>
              <Button variant="ghost" size="sm" onClick={() => setShowRegDetail(false)} data-testid="button-close-reg-proyek">✕</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 font-semibold text-orange-900 text-sm">
                {regulasiProyek[selectedReg]?.judul}
              </div>
              {regulasiProyek[selectedReg]?.poin.map((p, i) => (
                <div key={i} className="flex gap-2 text-sm p-3 rounded-lg bg-slate-50 border">
                  <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                {regulasiProyek.map((r, i) => (
                  <button key={r.kode} onClick={() => setSelectedReg(i)} className={`flex-1 min-w-20 p-2 rounded-lg border text-[10px] font-semibold transition-all ${selectedReg === i ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-600 hover:border-orange-300"}`} data-testid={`button-switch-reg-proyek-${i}`}>
                    {r.kode.split(" ").slice(0, 3).join(" ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button size="sm" onClick={() => setShowRegDetail(false)} data-testid="button-close-reg-proyek-bottom">Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
