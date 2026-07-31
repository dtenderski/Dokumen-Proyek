import { useState } from "react";
import { Link } from "wouter";
import { RelatedServices } from "@/components/ServiceNav";
import { ConsultationModal } from "@/components/ConsultationModal";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle, Clock,
  ChevronRight, Copy, Info, Zap, AlertTriangle, BookOpen, ArrowRight,
  RefreshCw, Star, Building2, HardHat, BarChart3, Award, Layers,
  TrendingUp, CheckCheck, Users, Globe, FileCheck, ClipboardList,
  Target, Cpu, ShieldCheck, Search, Activity, Lightbulb
} from "lucide-react";

// ─── Standar Sistem Manajemen ────────────────────────────────────────────
const standarSM = [
  {
    id: "iso9001",
    kode: "ISO 9001:2015",
    nama: "Sistem Manajemen Mutu (SMM)",
    label: "Mutu",
    icon: "🏆",
    warna: "bg-blue-50 border-blue-200 text-blue-900",
    badge: "bg-blue-600",
    badgeText: "bg-blue-100 text-blue-800 border-blue-200",
    regulasi: "ISO 9001:2015 (International Organization for Standardization)",
    dasar_wajib: "Tidak wajib secara hukum — namun disyaratkan banyak tender BUMN & swasta asing",
    siklus: "3 tahun (Sertifikasi) + 2x Surveillance Audit per tahun",
    biaya: "Rp 25 – 60 juta",
    waktu_impl: "3 – 6 bulan",
    klausul: [
      { no: "4", judul: "Konteks Organisasi", ket: "Memahami organisasi, kebutuhan pemangku kepentingan, dan lingkup SMM." },
      { no: "5", judul: "Kepemimpinan", ket: "Komitmen manajemen puncak, kebijakan mutu, peran & tanggung jawab." },
      { no: "6", judul: "Perencanaan", ket: "Risiko & peluang, sasaran mutu, perencanaan perubahan." },
      { no: "7", judul: "Dukungan", ket: "Sumber daya (SDM, infrastruktur, lingkungan kerja), kompetensi, komunikasi, info terdokumentasi." },
      { no: "8", judul: "Operasi", ket: "Perencanaan & pengendalian operasional, persyaratan produk/jasa, desain & pengembangan, pengendalian penyedia eksternal." },
      { no: "9", judul: "Evaluasi Kinerja", ket: "Pemantauan, pengukuran, analisis, evaluasi, audit internal, tinjauan manajemen." },
      { no: "10", judul: "Peningkatan", ket: "Ketidaksesuaian, tindakan korektif, peningkatan berkelanjutan." },
    ],
    manfaat: [
      "Meningkatkan nilai teknis dalam evaluasi tender (tambah 10–15 poin)",
      "Mensyaratkan oleh 73% BUMN & kontrak proyek asing > Rp 100M",
      "Mengurangi pemborosan proses, meningkatkan kepuasan klien",
      "Dasar implementasi sistem ISO lain (14001, 45001, 37001)",
      "Meningkatkan kepercayaan subkontraktor & pemasok",
    ],
    gap_checklist: [
      "Manual Mutu & Kebijakan Mutu sudah ada dan dikomunikasikan",
      "Sasaran Mutu terukur dan terdokumentasi per fungsi/level",
      "Proses bisnis utama sudah dipetakan (SOP, flowchart proses)",
      "Manajemen risiko & peluang sudah terdokumentasi",
      "Rekaman mutu (laporan proyek, BA serah terima, inspeksi) tersedia",
      "Program audit internal berjalan rutin (min. 1x/tahun)",
      "Tinjauan manajemen dilakukan min. 1x setahun",
      "Penanganan ketidaksesuaian & tindakan korektif berjalan",
      "Kompetensi personel terdokumentasi (training record)",
      "Evaluasi pemasok & subkontraktor dilakukan secara berkala",
    ],
  },
  {
    id: "iso14001",
    kode: "ISO 14001:2015",
    nama: "Sistem Manajemen Lingkungan (SML)",
    label: "Lingkungan",
    icon: "🌿",
    warna: "bg-green-50 border-green-200 text-green-900",
    badge: "bg-green-600",
    badgeText: "bg-green-100 text-green-800 border-green-200",
    regulasi: "ISO 14001:2015 / UU No. 32/2009 tentang Perlindungan & Pengelolaan Lingkungan Hidup",
    dasar_wajib: "Wajib jika proyek memiliki dampak lingkungan signifikan (AMDAL/UKL-UPL) + syarat banyak proyek internasional",
    siklus: "3 tahun + 2x Surveillance Audit per tahun",
    biaya: "Rp 20 – 50 juta",
    waktu_impl: "3 – 6 bulan",
    klausul: [
      { no: "4", judul: "Konteks Organisasi", ket: "Isu lingkungan, kebutuhan pihak berkepentingan, lingkup SML." },
      { no: "5", judul: "Kepemimpinan", ket: "Komitmen manajemen, kebijakan lingkungan, peran & tanggung jawab." },
      { no: "6", judul: "Perencanaan", ket: "Aspek lingkungan, kewajiban kepatuhan, risiko & peluang, sasaran lingkungan." },
      { no: "7", judul: "Dukungan", ket: "Sumber daya, kompetensi, kepedulian, komunikasi, info terdokumentasi." },
      { no: "8", judul: "Operasi", ket: "Pengendalian operasional aspek penting, kesiapsiagaan darurat lingkungan." },
      { no: "9", judul: "Evaluasi Kinerja", ket: "Pemantauan, pengukuran, evaluasi kepatuhan, audit internal, tinjauan manajemen." },
      { no: "10", judul: "Peningkatan", ket: "Ketidaksesuaian, tindakan korektif, peningkatan berkelanjutan." },
    ],
    manfaat: [
      "Persyaratan proyek green building (GREENSHIP, EDGE, LEED)",
      "Mengurangi risiko sanksi lingkungan dari KLHK & pemda",
      "Efisiensi penggunaan energi, air, dan material di lapangan",
      "Memenuhi syarat proyek internasional dan bank asing (IFC Performance Standards)",
      "Meningkatkan reputasi di tender pemerintah berwawasan lingkungan",
    ],
    gap_checklist: [
      "Identifikasi aspek & dampak lingkungan kegiatan konstruksi sudah ada",
      "Kebijakan lingkungan tertulis dan dikomunikasikan ke seluruh karyawan",
      "Register kepatuhan lingkungan (AMDAL, RKPPL, RPPLH) diperbarui",
      "Pengelolaan limbah B3 proyek terdokumentasi (manifest limbah)",
      "Prosedur tanggap darurat lingkungan (tumpahan BBM, kebakaran) tersedia",
      "Pemantauan kualitas air, udara, kebisingan dilakukan sesuai izin",
      "Audit internal lingkungan dilakukan min. 1x/tahun",
      "Program pelatihan kesadaran lingkungan untuk staf lapangan berjalan",
      "Pengelolaan energi & konsumsi air tercatat & dievaluasi",
      "Komunikasi eksternal kepentingan lingkungan kepada warga sekitar",
    ],
  },
  {
    id: "iso45001",
    kode: "ISO 45001:2018",
    nama: "Sistem Manajemen K3 (SMK3 Internasional)",
    label: "K3 Internasional",
    icon: "⛑️",
    warna: "bg-orange-50 border-orange-200 text-orange-900",
    badge: "bg-orange-600",
    badgeText: "bg-orange-100 text-orange-800 border-orange-200",
    regulasi: "ISO 45001:2018 — menggantikan OHSAS 18001:2007 (tidak lagi berlaku sejak Sep 2021)",
    dasar_wajib: "Disyaratkan oleh proyek internasional, joint venture asing, dan sebagai dasar pengakuan SMK3 PP 50/2012",
    siklus: "3 tahun + 2x Surveillance Audit per tahun",
    biaya: "Rp 30 – 65 juta",
    waktu_impl: "4 – 8 bulan",
    klausul: [
      { no: "4", judul: "Konteks Organisasi", ket: "Konteks & kebutuhan pekerja, pihak berkepentingan, lingkup, sistem." },
      { no: "5", judul: "Kepemimpinan & Partisipasi Pekerja", ket: "Komitmen manajemen, konsultasi & partisipasi pekerja — khas ISO 45001." },
      { no: "6", judul: "Perencanaan", ket: "Identifikasi bahaya, penilaian risiko K3, persyaratan hukum, sasaran K3." },
      { no: "7", judul: "Dukungan", ket: "Sumber daya, kompetensi, kepedulian, komunikasi, dokumentasi." },
      { no: "8", judul: "Operasi", ket: "Pengendalian operasional, hierarki pengendalian bahaya, manajemen perubahan, pengadaan, kontraktor." },
      { no: "9", judul: "Evaluasi Kinerja", ket: "Pemantauan, investigasi insiden, audit internal, tinjauan manajemen." },
      { no: "10", judul: "Peningkatan", ket: "Insiden, ketidaksesuaian, tindakan korektif, peningkatan berkelanjutan." },
    ],
    manfaat: [
      "Standar K3 yang diakui secara internasional (menggantikan OHSAS 18001)",
      "Mengurangi angka kecelakaan kerja, biaya kompensasi & hukum",
      "Persyaratan wajib JO/joint venture dengan kontraktor asing",
      "Memperkuat sertifikasi SMK3 PP 50/2012 secara paralel",
      "Meningkatkan moral & produktivitas tenaga kerja di lapangan",
    ],
    gap_checklist: [
      "Kebijakan K3 tertulis, ditandatangani direksi, dikomunikasikan",
      "Identifikasi bahaya & penilaian risiko K3 untuk semua kegiatan konstruksi",
      "Hierarki pengendalian bahaya diterapkan (eliminasi → substitusi → engineering → administrasi → APD)",
      "Program pelatihan K3 (induksi, toolbox meeting, emergency drill) terdokumentasi",
      "Prosedur investigasi insiden & kecelakaan kerja tersedia",
      "Pemantauan lingkungan kerja (kebisingan, debu, pencahayaan) dilakukan",
      "Partisipasi & konsultasi pekerja dalam keputusan K3 terdokumentasi",
      "Audit internal K3 min. 1x/tahun dilakukan",
      "Register hukum & peraturan K3 yang berlaku diperbarui rutin",
      "Rencana tanggap darurat (kebakaran, banjir, longsor) tersedia & diuji",
    ],
  },
  {
    id: "smk3",
    kode: "SMK3 (PP No. 50/2012)",
    nama: "Sistem Manajemen Keselamatan & Kesehatan Kerja",
    label: "SMK3 Indonesia",
    icon: "🇮🇩",
    warna: "bg-red-50 border-red-200 text-red-900",
    badge: "bg-red-600",
    badgeText: "bg-red-100 text-red-800 border-red-200",
    regulasi: "PP No. 50/2012 tentang Penerapan SMK3 + Permenaker No. 26/2014 tentang Audit SMK3",
    dasar_wajib: "WAJIB untuk perusahaan dengan >100 karyawan ATAU bergerak di bidang dengan risiko tinggi (termasuk konstruksi > nilai tertentu)",
    siklus: "3 tahun + 1x Re-audit per 3 tahun + audit surveillance internal",
    biaya: "Rp 20 – 50 juta",
    waktu_impl: "4 – 9 bulan",
    klausul: [
      { no: "1", judul: "Pembangunan & Pemeliharaan Komitmen", ket: "Kebijakan K3, tanggung jawab, tujuan & sasaran K3, manual SMK3." },
      { no: "2", judul: "Strategi Pendokumentasian", ket: "Rencana K3, manual SMK3, prosedur & instruksi kerja K3." },
      { no: "3", judul: "Peninjauan Ulang Desain & Kontrak", ket: "Identifikasi bahaya pada fase desain & kontrak, HIRA/IBPR." },
      { no: "4", judul: "Pengendalian Dokumen", ket: "Pengendalian dokumen & rekaman K3, distribusi & update." },
      { no: "5", judul: "Pembelian & Pengelolaan Subkontraktor", ket: "Seleksi pemasok K3, verifikasi MSDS, evaluasi subkon K3." },
      { no: "6", judul: "Keamanan Bekerja Berdasarkan SMK3", ket: "Izin kerja (PTW), LOTO, pekerjaan di ruang terbatas, bekerja di ketinggian." },
      { no: "7", judul: "Standar Pemantauan", ket: "Inspeksi tempat kerja, pengukuran kinerja K3, investigasi kecelakaan." },
      { no: "8", judul: "Pelaporan & Perbaikan Kekurangan", ket: "Pelaporan insiden, near miss, tindakan perbaikan & pencegahan." },
      { no: "9", judul: "Pengelolaan Material & Pemindahan", ket: "Material berbahaya, penanganan & penyimpanan, simbol B3." },
      { no: "10", judul: "Pengumpulan & Penggunaan Data", ket: "Statistik K3, analisis tren kecelakaan, laporan K3 ke disnaker." },
      { no: "11", judul: "Audit SMK3", ket: "Audit internal & eksternal oleh lembaga audit terakreditasi Kemenaker." },
      { no: "12", judul: "Pengembangan Keterampilan & Kemampuan", ket: "Pelatihan K3 wajib, kompetensi ahli K3 (AK3 Umum/Spesialis)." },
    ],
    manfaat: [
      "Kewajiban hukum — menghindari sanksi dan penghentian operasi dari Disnaker",
      "Penilaian dalam SBU & SIUJK: SMK3 meningkatkan nilai kualifikasi BUJK",
      "Prasyarat proyek pemerintah nilai besar (PQ/prakualifikasi)",
      "Mengurangi angka kecelakaan kerja & biaya ganti rugi tenaga kerja",
      "Reputasi BUJK meningkat di mata klien & tender nasional",
    ],
    gap_checklist: [
      "SK Tim P2K3 (Panitia Pembina K3) sudah dibentuk & dilaporkan ke Disnaker",
      "Manual SMK3 & kebijakan K3 tertulis dan ditandatangani direksi",
      "IBPR (Identifikasi Bahaya & Penilaian Risiko) untuk semua kegiatan tersedia",
      "Program K3 tahunan tertulis, disetujui manajemen, dan dievaluasi",
      "RK3K (Rencana Keselamatan & Kesehatan Kerja Kontrak) per proyek dibuat",
      "Ahli K3 Umum bersertifikat Kemenaker sudah ada di perusahaan",
      "Pelatihan K3 (induksi, P3K, APAR, kerja ketinggian) terdokumentasi",
      "Laporan statistik K3 (FR/SR) dikirim ke Disnaker setiap bulan/kuartal",
      "Audit internal SMK3 dilakukan min. 1x/tahun",
      "Alat pelindung diri (APD) sesuai standar & tersedia di semua lokasi proyek",
    ],
  },
  {
    id: "smkk",
    kode: "SMKK (Permen PUPR 10/2021)",
    nama: "Sistem Manajemen Keselamatan Konstruksi",
    label: "SMKK Konstruksi",
    icon: "🏗️",
    warna: "bg-amber-50 border-amber-200 text-amber-900",
    badge: "bg-amber-600",
    badgeText: "bg-amber-100 text-amber-800 border-amber-200",
    regulasi: "Permen PUPR No. 10/2021 tentang Pedoman SMKK",
    dasar_wajib: "WAJIB untuk semua pekerjaan konstruksi yang dibiayai APBN/APBD — bagian dari kontrak konstruksi",
    siklus: "Per proyek — RK3K wajib sebelum pekerjaan dimulai",
    biaya: "Masuk dalam nilai kontrak konstruksi (komponen biaya K3)",
    waktu_impl: "Sebelum mobilisasi proyek (bisa 1–2 minggu)",
    klausul: [
      { no: "A", judul: "Penyiapan RK3K", ket: "Rencana Keselamatan Konstruksi — dokumen wajib per kontrak konstruksi." },
      { no: "B", judul: "Sosialisasi & Promosi K3", ket: "Induksi HSE, toolbox meeting harian, safety sign, kampanye K3." },
      { no: "C", judul: "Alat Perlindungan Kerja", ket: "APD (helm, rompi, sepatu safety, harness, dll) per SNI yang berlaku." },
      { no: "D", judul: "Asuransi & BPJS Ketenagakerjaan", ket: "Seluruh tenaga kerja didaftarkan BPJS TK & kecelakaan kerja." },
      { no: "E", judul: "Pemeriksaan Kesehatan", ket: "Medical check up awal dan berkala untuk tenaga kerja berisiko." },
      { no: "F", judul: "Rambu & Perlengkapan K3", ket: "Safety sign sesuai standar, barricade, safety net, scaffolding sesuai SLF." },
      { no: "G", judul: "Konsultasi Tenaga Ahli K3", ket: "Ahli K3 Konstruksi bersertifikat wajib untuk proyek risiko tinggi." },
      { no: "H", judul: "Evaluasi & Pengukuran Kinerja K3", ket: "Inspeksi rutin, pengukuran KPI K3, laporan insiden & near miss." },
    ],
    manfaat: [
      "Kewajiban kontraktual proyek APBN/APBD — tidak bisa ditawar",
      "Menjadi syarat dalam penilaian K3 evaluasi teknis lelang konstruksi",
      "Mengurangi risiko kecelakaan kerja yang dapat menghentikan proyek",
      "Biaya K3 masuk dalam RAB proyek — tidak mengurangi margin",
      "Mendukung persyaratan LPJK untuk perpanjangan & kenaikan gred SBU",
    ],
    gap_checklist: [
      "RK3K (Rencana Keselamatan Konstruksi) sudah dibuat sebelum mobilisasi",
      "Ahli K3 Konstruksi bersertifikat disiapkan untuk proyek risiko tinggi",
      "Seluruh tenaga kerja sudah terdaftar BPJS Ketenagakerjaan dari perusahaan",
      "Papan informasi K3, rambu bahaya & safety sign terpasang di lokasi",
      "Alat perlindungan diri (APD) tersedia & sesuai standar SNI",
      "Program induksi K3 & toolbox meeting tercatat dalam buku log",
      "Prosedur tanggap darurat (kebakaran, kecelakaan, bencana alam) ada",
      "Pelaporan insiden & near miss ke PPK dilakukan tepat waktu",
    ],
  },
];

// ─── Alur Implementasi ────────────────────────────────────────────────────
const alurImpl = [
  { no: 1, judul: "Gap Analysis & Diagnostic Awal", detail: "Assessment kondisi eksisting perusahaan vs persyaratan standar. Identifikasi gap, tingkat kesiapan, dan prioritas perbaikan. Output: Laporan Gap Analysis + Roadmap Implementasi.", icon: Search },
  { no: 2, judul: "Pembentukan Tim & Komitmen Manajemen", detail: "Bentuk Tim Implementasi (Champion + Koordinator per divisi). Manajemen puncak menandatangani Kebijakan & Komitmen. Workshop awareness untuk seluruh karyawan.", icon: Users },
  { no: 3, judul: "Penyusunan Dokumen Sistem", detail: "Buat Manual, SOP, Prosedur Kerja, Instruksi Kerja, Formulir, dan Rekaman sesuai klausul standar. Termasuk kebijakan, sasaran, program, dan register risiko.", icon: FileText },
  { no: 4, judul: "Sosialisasi & Pelatihan", detail: "Pelatihan pemahaman standar untuk semua personel, pelatihan khusus untuk Tim Internal Auditor, dan pelatihan teknis per klausul (misal: IBPR untuk K3, Aspek Lingkungan untuk ISO 14001).", icon: BookOpen },
  { no: 5, judul: "Implementasi & Uji Coba Sistem", detail: "Sistem dijalankan secara nyata selama minimal 3 bulan. Semua rekaman diisi, prosedur dijalankan, pertemuan rutin diadakan. Ini adalah fase paling menentukan kesiapan audit.", icon: Activity },
  { no: 6, judul: "Audit Internal", detail: "Audit oleh Tim Auditor Internal yang sudah dilatih. Temuan dianalisis, NCR (Non-Conformance Report) diterbitkan, dan tindakan korektif dilakukan.", icon: ClipboardList },
  { no: 7, judul: "Tinjauan Manajemen", detail: "Rapat formal Manajemen Puncak untuk meninjau kinerja sistem, tindak lanjut audit, status sasaran, dan keputusan strategis sistem manajemen.", icon: Target },
  { no: 8, judul: "Audit Sertifikasi oleh Lembaga Sertifikasi (CB)", detail: "Audit tahap 1 (document review) dan tahap 2 (audit lapangan) oleh Certification Body terakreditasi KAN. Jika tidak ada temuan major NCR → Sertifikat diterbitkan.", icon: Award },
];

// ─── Integrasi IMS ────────────────────────────────────────────────────────
const imsMatrix = [
  { klausul: "Konteks Organisasi", iso9001: true, iso14001: true, iso45001: true, smk3: false },
  { klausul: "Kepemimpinan & Komitmen", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Kebijakan", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Perencanaan & Identifikasi Risiko", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Sasaran & Program", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Sumber Daya & Kompetensi", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Komunikasi & Kesadaran", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Pengendalian Operasional", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Tanggap Darurat", iso9001: false, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Pemantauan & Pengukuran", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Audit Internal", iso9001: true, iso14001: true, iso45001: true, smk3: true },
  { klausul: "Tinjauan Manajemen", iso9001: true, iso14001: true, iso45001: true, smk3: false },
  { klausul: "Tindakan Korektif", iso9001: true, iso14001: true, iso45001: true, smk3: true },
];

// ─── Paket Layanan ────────────────────────────────────────────────────────
const paketLayanan = [
  {
    nama: "Paket K3 Wajib",
    icon: "⛑️",
    color: "border-red-200 bg-red-50",
    standar: ["SMK3 PP 50/2012", "SMKK Permen PUPR 10/2021"],
    cocok: "BUJK dengan >100 karyawan atau proyek APBN/APBD",
    biaya: "Rp 30 – 70 juta",
    waktu: "4 – 9 bulan",
    fitur: ["Penyusunan Manual SMK3 & RK3K", "Pelatihan AK3 Umum & Konstruksi", "Pendampingan audit Disnaker", "Laporan statistik K3"],
  },
  {
    nama: "Paket ISO Mutu + Lingkungan",
    icon: "🏆🌿",
    color: "border-blue-200 bg-blue-50",
    standar: ["ISO 9001:2015", "ISO 14001:2015"],
    cocok: "BUJK yang mengerjakan proyek internasional atau green building",
    biaya: "Rp 40 – 90 juta",
    waktu: "4 – 7 bulan",
    fitur: ["Gap analysis integratif", "IMS Documentation (2 standar)", "Internal Auditor Training 2 standar", "Pendampingan audit sertifikasi KAN"],
  },
  {
    nama: "Paket Integrated Management System",
    icon: "🔗",
    color: "border-purple-200 bg-purple-50",
    standar: ["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "SMK3 PP 50/2012"],
    cocok: "BUJK Besar yang ingin standar terlengkap sekaligus",
    biaya: "Rp 80 – 150 juta",
    waktu: "6 – 12 bulan",
    fitur: ["IMS 4-in-1 — dokumen terintegrasi", "Efisiensi 40% vs audit terpisah", "CB internasional terakreditasi KAN", "Post-sertifikasi support 1 tahun"],
  },
];

type StandarId = "iso9001" | "iso14001" | "iso45001" | "smk3" | "smkk";
type GapItem = { nama: string; checked: boolean };

export default function ISOSMKPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<StandarId>("iso9001");
  const [showGap, setShowGap] = useState(false);
  const [gapStandar, setGapStandar] = useState<StandarId>("iso9001");
  const [gapItems, setGapItems] = useState<GapItem[]>([]);
  const [showRegDetail, setShowRegDetail] = useState(false);

  function openGap(id: StandarId) {
    const s = standarSM.find(x => x.id === id);
    if (!s) return;
    setGapStandar(id);
    setGapItems(s.gap_checklist.map(nama => ({ nama, checked: false })));
    setShowGap(true);
  }

  function toggleGap(idx: number) {
    setGapItems(prev => prev.map((g, i) => i === idx ? { ...g, checked: !g.checked } : g));
  }

  const checkedCount = gapItems.filter(g => g.checked).length;
  const gapProgress = gapItems.length > 0 ? Math.round((checkedCount / gapItems.length) * 100) : 0;
  const currentStandar = standarSM.find(s => s.id === activeTab)!;

  function copyGap() {
    const s = standarSM.find(x => x.id === gapStandar)!;
    const lines = gapItems.map(g => `${g.checked ? "✅" : "⬜"} ${g.nama}`).join("\n");
    const text = `GAP ANALYSIS — ${s.kode}\n${"─".repeat(50)}\n${lines}\n\nKesiapan: ${checkedCount}/${gapItems.length} (${gapProgress}%)`;
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Hasil gap analysis tersalin ke clipboard." });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-iso">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800">Sistem Manajemen Usaha</span>
            <Badge className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">ISO 9001 · 14001 · 45001</Badge>
            <Badge className="text-xs bg-red-100 text-red-800 border border-red-200">SMK3 PP 50/2012</Badge>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRegDetail(true)} data-testid="button-reg-iso">
              <BookOpen className="w-4 h-4 mr-1" /> Regulasi
            </Button>
            <ConsultationModal serviceType="iso-smk3" serviceLabel="ISO & SMK3" triggerSize="sm" data-testid="button-konsultasi-iso" />
            <Link href="/agent-hub">
              <Button size="sm" variant="outline" data-testid="button-ai-iso">
                <Zap className="w-4 h-4 mr-1" /> Konsultasi AI
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <Badge className="mb-3 bg-emerald-600 text-white text-xs px-3 py-1">
              ISO × SMK3 × SMKK — Standar Internasional & Nasional Konstruksi
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Sistem Manajemen Usaha<br />
              <span className="text-emerald-600">Konstruksi Indonesia</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              Sistem Manajemen Usaha (SMU) mencakup seluruh standar manajemen yang wajib dimiliki
              BUJK (Badan Usaha Jasa Konstruksi) — mulai dari <strong>mutu (ISO 9001)</strong>,
              <strong> lingkungan (ISO 14001)</strong>, <strong>K3 internasional (ISO 45001)</strong>,
              <strong> K3 nasional (SMK3 PP 50/2012)</strong>, hingga <strong>SMKK Permen PUPR 10/2021</strong>
              untuk proyek konstruksi APBN/APBD.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "ISO 9001 — Mutu", "ISO 14001 — Lingkungan", "ISO 45001 — K3 Intl",
                "SMK3 PP 50/2012", "SMKK Permen PUPR"
              ].map(b => (
                <Badge key={b} variant="outline" className="text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ringkasan 5 Standar */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                <Layers className="w-4 h-4" /> 5 Standar Sistem Manajemen Konstruksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {standarSM.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id as StandarId)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${activeTab === s.id ? s.warna + " border-2" : "bg-white hover:bg-slate-50"}`}
                  data-testid={`button-standar-${s.id}`}
                >
                  <span className="text-xl w-7 text-center">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{s.kode}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{s.nama}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-[10px] font-semibold">{s.biaya}</div>
                    <div className="text-[10px] text-muted-foreground">{s.waktu_impl}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pentingnya SMU */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, title: "Nilai Tender Lebih Tinggi", desc: "ISO 9001 menambah 10–15 poin dalam evaluasi teknis lelang konstruksi", color: "text-blue-600" },
            { icon: Shield, title: "Kewajiban Hukum K3", desc: "SMK3 WAJIB untuk perusahaan >100 karyawan atau risiko tinggi", color: "text-red-600" },
            { icon: Globe, title: "Syarat Proyek Internasional", desc: "JO/joint venture asing mensyaratkan ISO 45001 dan IMS lengkap", color: "text-green-600" },
            { icon: Award, title: "Nilai SBU & Kualifikasi", desc: "SMK3 & ISO mendukung kenaikan gred kualifikasi BUJK di LPJK", color: "text-amber-600" },
          ].map(f => (
            <Card key={f.title} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <f.icon className={`w-8 h-8 mb-3 ${f.color}`} />
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Per Standar */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" /> Detail Standar Sistem Manajemen
          </h2>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as StandarId)}>
            <TabsList className="grid grid-cols-5 h-auto mb-6 overflow-x-auto">
              {standarSM.map(s => (
                <TabsTrigger key={s.id} value={s.id} className="flex flex-col py-2 gap-0.5 text-[10px] h-auto" data-testid={`tab-standar-${s.id}`}>
                  <span className="text-sm">{s.icon}</span>
                  <span className="font-bold hidden sm:block">{s.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {standarSM.map(s => (
              <TabsContent key={s.id} value={s.id} className="space-y-5">
                {/* Banner */}
                <div className={`p-5 rounded-2xl border-2 ${s.warna}`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-3xl">{s.icon}</span>
                        <div>
                          <div className="font-bold text-xl">{s.kode}</div>
                          <div className="text-sm opacity-80">{s.nama}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-start gap-2 text-sm">
                          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                          <span><strong>Dasar Hukum:</strong> {s.regulasi}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                          <span><strong>Kewajiban:</strong> {s.dasar_wajib}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-1 gap-2 flex-shrink-0">
                      {[
                        { label: "Siklus Audit", val: s.siklus.split(" ")[0] + " " + s.siklus.split(" ")[1], icon: RefreshCw },
                        { label: "Estimasi Biaya", val: s.biaya, icon: BarChart3 },
                        { label: "Waktu Impl.", val: s.waktu_impl, icon: Clock },
                      ].map(i => (
                        <div key={i.label} className="bg-white/60 rounded-lg p-2.5 text-center">
                          <i.icon className="w-4 h-4 mx-auto mb-1 opacity-60" />
                          <div className="text-[10px] opacity-70">{i.label}</div>
                          <div className="font-bold text-xs">{i.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Klausul */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" /> Klausul / Elemen Utama
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {s.klausul.map(k => (
                          <div key={k.no} className="p-3 rounded-lg border bg-slate-50">
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-6 rounded text-xs font-bold bg-primary text-white flex items-center justify-center flex-shrink-0">
                                {k.no}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{k.judul}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{k.ket}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manfaat + Gap CTA */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" /> Manfaat Utama
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {s.manfaat.map((m, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50/40">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-sm font-bold mb-1 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-emerald-600" />
                          Gap Analysis — {s.kode}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Cek {s.gap_checklist.length} poin kesiapan sistem manajemen {s.label} perusahaan Anda sebelum audit sertifikasi.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => openGap(s.id as StandarId)} data-testid={`button-gap-${s.id}`}>
                            <ClipboardList className="w-4 h-4 mr-1" /> Mulai Gap Analysis
                          </Button>
                          <Link href="/agent-hub">
                            <Button size="sm" data-testid={`button-tanya-${s.id}`}>
                              <Zap className="w-4 h-4 mr-1" /> Tanya AI
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Alur Implementasi */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-emerald-600" /> Alur Implementasi Sistem Manajemen (8 Tahap)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {alurImpl.map((a, idx) => (
              <Card key={a.no} className={idx % 2 === 0 ? "bg-emerald-50/40 border-emerald-200" : ""}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {a.no}
                    </div>
                    <a.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm font-bold mb-1">{a.judul}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{a.detail}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Matriks Integrasi IMS */}
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" /> Matriks Integrasi IMS (Integrated Management System)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Banyak elemen klausul bisa <strong>diintegrasikan dalam satu dokumen</strong> — hemat waktu, biaya, dan sumber daya.
            Ini disebut IMS (Integrated Management System).
          </p>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 w-52">Elemen / Klausul</th>
                    <th className="text-center py-2 px-2 font-semibold text-blue-700">ISO 9001</th>
                    <th className="text-center py-2 px-2 font-semibold text-green-700">ISO 14001</th>
                    <th className="text-center py-2 px-2 font-semibold text-orange-700">ISO 45001</th>
                    <th className="text-center py-2 px-2 font-semibold text-red-700">SMK3</th>
                  </tr>
                </thead>
                <tbody>
                  {imsMatrix.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="py-2 pr-4 text-slate-700">{row.klausul}</td>
                      <td className="text-center py-2 px-2">{row.iso9001 ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mx-auto" /> : <span className="text-slate-200">—</span>}</td>
                      <td className="text-center py-2 px-2">{row.iso14001 ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mx-auto" /> : <span className="text-slate-200">—</span>}</td>
                      <td className="text-center py-2 px-2">{row.iso45001 ? <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 mx-auto" /> : <span className="text-slate-200">—</span>}</td>
                      <td className="text-center py-2 px-2">{row.smk3 ? <CheckCircle2 className="w-3.5 h-3.5 text-red-500 mx-auto" /> : <span className="text-slate-200">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Paket Layanan */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" /> Paket Layanan Implementasi
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {paketLayanan.map(p => (
              <Card key={p.nama} className={`border-2 ${p.color}`}>
                <CardHeader className="pb-3">
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <CardTitle className="text-base">{p.nama}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.standar.map(s => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-white/70 border text-xs text-slate-600">
                    <strong>Cocok untuk:</strong> {p.cocok}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 p-2 rounded bg-white/70 border text-center">
                      <div className="text-[10px] text-muted-foreground">Estimasi Biaya</div>
                      <div className="font-bold text-xs">{p.biaya}</div>
                    </div>
                    <div className="flex-1 p-2 rounded bg-white/70 border text-center">
                      <div className="text-[10px] text-muted-foreground">Waktu</div>
                      <div className="font-bold text-xs">{p.waktu}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {p.fitur.map(f => (
                      <li key={f} className="flex gap-1.5 text-xs">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/agent-hub" className="w-full">
                    <Button size="sm" className="w-full" variant="outline" data-testid={`button-paket-${p.nama.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Zap className="w-4 h-4 mr-1" /> Konsultasi Paket Ini
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-emerald-200">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Bantu Implementasi & Sertifikasi Sistem Manajemen</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tim konsultan kami berpengalaman mendampingi BUJK dalam implementasi ISO, SMK3, dan SMKK —
                dari gap analysis hingga sertifikat terbit dari CB terakreditasi KAN.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: ShieldCheck, text: "CB Terakreditasi KAN" },
                  { icon: Clock, text: "Timeline Terstruktur" },
                  { icon: Users, text: "Konsultan Berpengalaman" },
                  { icon: RefreshCw, text: "Support Surveillance" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <f.icon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/agent-hub">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-cta-agent-hub-iso">
                  <Zap className="w-4 h-4 mr-2" /> Konsultasi AI Gratis
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => openGap("smk3")} data-testid="button-cta-gap-smk3">
                <ClipboardList className="w-4 h-4 mr-2" /> Gap Analysis SMK3
              </Button>
              <Link href="/sbu">
                <Button variant="outline" className="w-full" data-testid="button-link-to-sbu-iso">
                  <Award className="w-4 h-4 mr-2" /> Lihat Halaman SBU
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="ISO/SMK3 selesai? Manfaatkan keunggulan sertifikasi untuk memenangkan tender:"
          services={[
            { href: "/tender-generator", icon: FileText, label: "Generator Dokumen Tender", desc: "Buat dokumen penawaran, RK3K & metode pelaksanaan pekerjaan", color: "bg-green-600", badge: "Rekomendasi" },
            { href: "/sbu", icon: Award, label: "SBU Konstruksi", desc: "Sertifikasi badan usaha LPJK — syarat wajib ikut tender pemerintah", color: "bg-amber-600" },
            { href: "/mini-apps", icon: Zap, label: "Kalkulator & Tools", desc: "Hitung biaya sertifikasi, audit gap & jadwal re-sertifikasi ISO", color: "bg-teal-600" },
            { href: "/ai-chat", icon: Cpu, label: "Konsultasi AI", desc: "Tanya strategi implementasi ISO 9001/14001 dan audit internal", color: "bg-indigo-600", badge: "AI" },
          ]}
          nextStep={{ href: "/tender-generator", label: "Mulai Buat Dokumen Tender →", icon: FileText }}
        />
      </main>

      {/* Dialog Regulasi */}
      <Dialog open={showRegDetail} onOpenChange={setShowRegDetail}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Regulasi Sistem Manajemen Konstruksi
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {[
              { kode: "ISO 9001:2015", ket: "Sistem Manajemen Mutu — standar internasional, tidak wajib secara hukum tetapi makin banyak disyaratkan tender" },
              { kode: "ISO 14001:2015", ket: "Sistem Manajemen Lingkungan — wajib jika ada kewajiban AMDAL/UKL-UPL, disyaratkan green building" },
              { kode: "ISO 45001:2018", ket: "Sistem Manajemen K3 Internasional — menggantikan OHSAS 18001:2007. Wajib untuk JO internasional & proyek asing" },
              { kode: "PP No. 50 Tahun 2012", ket: "SMK3 Indonesia — WAJIB bagi perusahaan >100 karyawan atau risiko tinggi. Diaudit oleh lembaga akreditasi Kemenaker" },
              { kode: "Permenaker No. 26 Tahun 2014", ket: "Pedoman Audit SMK3 — tata cara audit, penilaian (memuaskan/baik/kurang), dan kewajiban pelaporan" },
              { kode: "Permen PUPR No. 10 Tahun 2021", ket: "Pedoman SMKK — wajib untuk semua pekerjaan konstruksi APBN/APBD. RK3K harus ada sebelum mobilisasi" },
              { kode: "UU No. 1 Tahun 1970", ket: "Keselamatan Kerja — dasar hukum utama K3 Indonesia, termasuk konstruksi" },
              { kode: "UU No. 32 Tahun 2009", ket: "Perlindungan & Pengelolaan Lingkungan Hidup — dasar kewajiban AMDAL, UKL-UPL, dan kepatuhan lingkungan" },
              { kode: "ISO 37001:2016", ket: "Sistem Manajemen Anti-Suap — disyaratkan beberapa lembaga donor internasional & BUMN tertentu" },
            ].map(r => (
              <div key={r.kode} className="p-3 rounded-lg border bg-slate-50 flex gap-3">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">{r.kode}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.ket}</div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setShowRegDetail(false)} data-testid="button-close-reg-iso">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Gap Analysis */}
      <Dialog open={showGap} onOpenChange={setShowGap}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Gap Analysis — {standarSM.find(s => s.id === gapStandar)?.kode}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tingkat kesiapan</span>
                <span className="font-bold">{checkedCount}/{gapItems.length} poin</span>
              </div>
              <Progress value={gapProgress} className="h-2" />
              <div className="flex items-center gap-2">
                <div className={`text-xs font-semibold px-2 py-0.5 rounded ${gapProgress >= 80 ? "bg-green-100 text-green-700" : gapProgress >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {gapProgress >= 80 ? "Siap Audit ✅" : gapProgress >= 50 ? "Perlu Perbaikan ⚠️" : "Gap Signifikan — Perlu Pendampingan 🔴"}
                </div>
                <span className="text-xs text-muted-foreground">{gapProgress}% kesiapan</span>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {gapItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.checked ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"}`}
                  onClick={() => toggleGap(idx)}
                  data-testid={`gap-item-${idx}`}
                >
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleGap(idx)} className="mt-0.5 flex-shrink-0" />
                  <div className="text-sm">{item.nama}</div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyGap} data-testid="button-copy-gap">
              <Copy className="w-4 h-4 mr-1" /> Salin Hasil
            </Button>
            <Button variant="outline" size="sm" onClick={() => setGapItems(prev => prev.map(g => ({ ...g, checked: false })))} data-testid="button-reset-gap">
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowGap(false)} data-testid="button-close-gap">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
