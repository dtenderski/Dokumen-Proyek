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
  ArrowLeft, Award, Search, FileText, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Copy, Info, Building2, Zap, AlertTriangle,
  BookOpen, ClipboardList, Globe, FileCheck, ArrowRight,
  Users, RefreshCw, Star, TrendingUp, Shield, Layers,
  GraduationCap, CheckCheck, XCircle, Sparkles, BarChart3, ShieldCheck
} from "lucide-react";

// ─── Regulasi Terbaru ──────────────────────────────────────────────────────
const regulasiTerbaru = [
  {
    kode: "PP No. 28 Tahun 2025",
    judul: "Peraturan Pelaksanaan Jasa Konstruksi",
    berlaku: "2025",
    menggantikan: "PP No. 22 Tahun 2020",
    ringkasan: "Peraturan Pemerintah terbaru yang memperbarui ketentuan penyelenggaraan jasa konstruksi, termasuk persyaratan kualifikasi BUJK, tata cara sertifikasi SBU, dan integrasi sistem data SIKI-OSS.",
    perubahan: [
      "Pembaruan struktur kualifikasi BUJK — penyederhanaan klasifikasi subklasifikasi sesuai kebutuhan pasar",
      "Integrasi data SIKI (Sistem Informasi Konstruksi Indonesia) dengan OSS-RBA secara real-time",
      "Persyaratan modal disetor per gred diperbarui sesuai indeks harga konstruksi 2025",
      "Ketentuan minimum SDM bersertifikat (SKK) per gred diperketat untuk kualitas konstruksi nasional",
      "Masa berlaku SBU tetap 3 tahun dengan proses renewal yang lebih ringkas secara digital",
      "Sanksi administratif lebih tegas bagi BUJK yang beroperasi tanpa SBU atau dengan SBU kadaluarsa",
      "Kewajiban pelaporan kinerja BUJK tahunan melalui portal LPJK sebagai syarat perpanjangan",
      "Kemudahan akses SBU bagi BUJK kategori UMK (Usaha Mikro dan Kecil)",
    ],
  },
  {
    kode: "Permen PU No. 6 Tahun 2025",
    judul: "Tata Cara Sertifikasi Badan Usaha Jasa Konstruksi",
    berlaku: "2025",
    menggantikan: "Permen PUPR No. 8 Tahun 2022",
    ringkasan: "Peraturan Menteri Pekerjaan Umum terbaru yang mengatur secara teknis tata cara pengajuan, verifikasi, penerbitan, dan perpanjangan Sertifikat Badan Usaha (SBU) konstruksi melalui LPJK.",
    perubahan: [
      "Seluruh proses SBU dilakukan secara digital melalui portal LPJK — tidak ada pengajuan manual",
      "Penambahan subklasifikasi baru untuk bidang EBT (Energi Baru Terbarukan) dan infrastruktur digital",
      "PNBP (Penerimaan Negara Bukan Pajak) SBU diperbarui — struktur biaya lebih transparan",
      "Verifikasi dokumen oleh LPJK maksimal 14 hari kerja (sebelumnya 30 hari)",
      "Peran Asosiasi BUJK dipertegas sebagai rekomendator — asosiasi wajib terakreditasi LPJK",
      "Integrasi portal SBU dengan SIKI, OSS, dan SIPD (Sistem Informasi Pemerintah Daerah)",
      "Persyaratan laporan keuangan diperlunak untuk gred K1 dan K2 — cukup laporan sederhana",
      "Mekanisme SBU sementara/darurat untuk pekerjaan strategis nasional",
    ],
  },
];

// ─── Subklasifikasi SBU ────────────────────────────────────────────────────
const subklasifikasiData = [
  // Kontraktor — Bangunan Gedung
  { kode: "BG001", nama: "Jasa Pelaksana Konstruksi Bangunan Multi atau Banyak Hunian", bidang: "Bangunan Gedung", jenis: "Kontraktor", gredMin: "K2" },
  { kode: "BG002", nama: "Jasa Pelaksana Konstruksi Bangunan Gedung Lainnya", bidang: "Bangunan Gedung", jenis: "Kontraktor", gredMin: "K1" },
  { kode: "BG007", nama: "Jasa Pelaksana Konstruksi Bangunan Komersial", bidang: "Bangunan Gedung", jenis: "Kontraktor", gredMin: "K2" },
  { kode: "BG009", nama: "Jasa Pelaksana Konstruksi Bangunan Industri", bidang: "Bangunan Gedung", jenis: "Kontraktor", gredMin: "Menengah" },
  // Kontraktor — Sipil
  { kode: "SI001", nama: "Jasa Pelaksana Konstruksi Jalan Raya (Kecuali Jalan Layang)", bidang: "Sipil", jenis: "Kontraktor", gredMin: "K2" },
  { kode: "SI002", nama: "Jasa Pelaksana Konstruksi Jalan Layang, Jembatan, Fly Over, Underpass", bidang: "Sipil", jenis: "Kontraktor", gredMin: "Menengah" },
  { kode: "SI003", nama: "Jasa Pelaksana Konstruksi Bangunan Sipil Pengolahan Air Bersih", bidang: "Sipil", jenis: "Kontraktor", gredMin: "K2" },
  { kode: "SI004", nama: "Jasa Pelaksana Konstruksi Bangunan Irigasi, Bendung, dan Jaringan Pengairan", bidang: "Sipil", jenis: "Kontraktor", gredMin: "Menengah" },
  // Kontraktor — ME
  { kode: "EL010", nama: "Jasa Pelaksana Konstruksi Instalasi Pembangkit Tenaga Listrik", bidang: "Mekanikal Elektrikal", jenis: "Kontraktor", gredMin: "Menengah" },
  { kode: "MK001", nama: "Jasa Pelaksana Konstruksi Instalasi HVAC", bidang: "Mekanikal Elektrikal", jenis: "Kontraktor", gredMin: "K1" },
  { kode: "MK003", nama: "Jasa Pelaksana Konstruksi Instalasi Pipa Air", bidang: "Mekanikal Elektrikal", jenis: "Kontraktor", gredMin: "K1" },
  // Kontraktor — Spesialis
  { kode: "SP001", nama: "Jasa Pelaksana Lapis Perkerasan Jalan", bidang: "Spesialis", jenis: "Kontraktor Spesialis", gredMin: "K2" },
  { kode: "SP004", nama: "Jasa Pelaksana Pondasi dan Geoteknik", bidang: "Spesialis", jenis: "Kontraktor Spesialis", gredMin: "K2" },
  { kode: "SP006", nama: "Jasa Pelaksana Struktur Baja & Aluminium", bidang: "Spesialis", jenis: "Kontraktor Spesialis", gredMin: "Menengah" },
  // Konsultan
  { kode: "AR001", nama: "Jasa Desain Arsitektural", bidang: "Arsitektur", jenis: "Konsultan", gredMin: "K1" },
  { kode: "AR002", nama: "Jasa Desain Interior", bidang: "Arsitektur", jenis: "Konsultan", gredMin: "K1" },
  { kode: "RE201", nama: "Jasa Desain Rekayasa untuk Konstruksi Pondasi serta Struktur Bangunan", bidang: "Rekayasa Teknik", jenis: "Konsultan", gredMin: "K1" },
  { kode: "RE204", nama: "Jasa Desain Rekayasa untuk Pekerjaan Teknik Sipil Transportasi", bidang: "Rekayasa Teknik", jenis: "Konsultan", gredMin: "K2" },
  { kode: "PR301", nama: "Jasa Manajemen Proyek Terkait Konstruksi Bangunan", bidang: "Manajemen Proyek", jenis: "Konsultan", gredMin: "K2" },
  { kode: "KL401", nama: "Jasa Pengujian dan Analisis Teknis", bidang: "Pengujian Teknis", jenis: "Konsultan", gredMin: "K1" },
];

// ─── Kualifikasi / Gred SBU ────────────────────────────────────────────────
const gredData = {
  K1: {
    label: "Kecil 1 (K1)",
    singkat: "K1",
    warna: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badge: "bg-emerald-500",
    nilaiProyek: "s.d. Rp 2 miliar",
    modalMinimum: "Rp 50 juta (disetor)",
    sdmWajib: [
      "Min. 1 Tenaga Ahli bersertifikat SKK (Penanggung Jawab Teknis / PJT)",
      "PJT sesuai subklasifikasi yang diajukan",
    ],
    persyaratan: [
      "Akta pendirian PT/CV + SK Kemenkumham",
      "NPWP Badan Usaha (aktif)",
      "NIB dengan KBLI konstruksi yang sesuai",
      "KTP + NPWP seluruh Direksi/Pengurus",
      "Neraca keuangan (laporan sederhana untuk K1 per Permen PU 6/2025)",
      "SKK PJT sesuai subklasifikasi (min. jenjang 5 atau 6)",
      "Surat pernyataan tidak sedang dalam pailit/sengketa",
      "Domisili usaha aktif",
    ],
    biayaPNBP: "Rp 500.000 – Rp 1.000.000",
    waktu: "7–14 hari kerja",
    masaBerlaku: "3 tahun",
  },
  K2: {
    label: "Kecil 2 (K2)",
    singkat: "K2",
    warna: "bg-teal-100 text-teal-800 border-teal-200",
    badge: "bg-teal-500",
    nilaiProyek: "s.d. Rp 7,5 miliar",
    modalMinimum: "Rp 150 juta (disetor)",
    sdmWajib: [
      "Min. 1 Tenaga Ahli bersertifikat SKK jenjang 6 sebagai PJT",
      "1 Tenaga Teknis Terampil (SKK jenjang ≥ 4)",
    ],
    persyaratan: [
      "Akta pendirian PT + SK Kemenkumham (khusus PT untuk K2 ke atas)",
      "NPWP Badan Usaha (aktif, tidak dalam pembekuan)",
      "NIB dengan KBLI konstruksi yang sesuai",
      "KTP + NPWP seluruh Direksi & Komisaris",
      "Laporan keuangan 1 tahun terakhir (minimal neraca sederhana)",
      "Daftar peralatan konstruksi milik/sewa",
      "SKK PJT jenjang 6 sesuai subklasifikasi",
      "Rekomendasi asosiasi BUJK terakreditasi LPJK",
      "Surat pernyataan tidak sedang dalam pailit/sengketa",
    ],
    biayaPNBP: "Rp 1.000.000 – Rp 2.000.000",
    waktu: "10–14 hari kerja",
    masaBerlaku: "3 tahun",
  },
  K3: {
    label: "Kecil 3 (K3)",
    singkat: "K3",
    warna: "bg-blue-100 text-blue-800 border-blue-200",
    badge: "bg-blue-500",
    nilaiProyek: "s.d. Rp 15 miliar",
    modalMinimum: "Rp 300 juta (disetor)",
    sdmWajib: [
      "Min. 1 Tenaga Ahli bersertifikat SKK jenjang 7 (Ahli Madya) sebagai PJT",
      "Min. 1 Tenaga Ahli SKK jenjang 6 sebagai PJB (Penanggung Jawab Bidang)",
      "Min. 2 Tenaga Teknis bersertifikat SKK",
    ],
    persyaratan: [
      "Akta pendirian PT + SK Kemenkumham + Anggaran Dasar terbaru",
      "NPWP Badan Usaha (aktif, taat pajak)",
      "NIB dengan KBLI konstruksi sesuai subklasifikasi",
      "KTP + NPWP seluruh Direksi & Komisaris",
      "Laporan keuangan 2 tahun terakhir",
      "Daftar kepemilikan peralatan (STNK/BPKB) atau kontrak sewa",
      "SKK PJT jenjang 7 (Ahli Madya) sesuai subklasifikasi",
      "SKK PJB jenjang 6 sesuai subklasifikasi",
      "Referensi pengalaman kontrak pekerjaan sejenis",
      "Rekomendasi asosiasi BUJK terakreditasi LPJK",
      "Surat pernyataan tidak dalam pailit/sengketa",
    ],
    biayaPNBP: "Rp 1.500.000 – Rp 2.500.000",
    waktu: "10–14 hari kerja",
    masaBerlaku: "3 tahun",
  },
  M: {
    label: "Menengah (M)",
    singkat: "M",
    warna: "bg-indigo-100 text-indigo-800 border-indigo-200",
    badge: "bg-indigo-500",
    nilaiProyek: "s.d. Rp 50 miliar",
    modalMinimum: "Rp 1 miliar (disetor)",
    sdmWajib: [
      "Min. 1 Tenaga Ahli SKK jenjang 8 (Ahli Utama) sebagai PJT",
      "Min. 2 Tenaga Ahli SKK jenjang 7 sebagai PJB",
      "Min. 3 Tenaga Teknis bersertifikat SKK",
    ],
    persyaratan: [
      "Akta PT + SK Kemenkumham + Perubahan Anggaran Dasar terbaru",
      "NPWP Badan Usaha aktif & tidak bermasalah pajak",
      "NIB dengan KBLI konstruksi sesuai subklasifikasi",
      "KTP + NPWP + SKCK seluruh Direksi",
      "Laporan keuangan 2 tahun terakhir (diaudit KAP)",
      "Neraca aktif modal min. Rp 1 miliar",
      "Daftar aset dan alat berat yang terverifikasi",
      "Referensi pengalaman proyek senilai min. Rp 15 miliar",
      "Rekomendasi asosiasi BUJK terakreditasi LPJK",
      "SKK PJT jenjang 8, SKK PJB jenjang 7",
      "Sertifikat ISO 9001 (direkomendasikan)",
    ],
    biayaPNBP: "Rp 2.500.000 – Rp 4.000.000",
    waktu: "14–21 hari kerja",
    masaBerlaku: "3 tahun",
  },
  B: {
    label: "Besar (B)",
    singkat: "B",
    warna: "bg-purple-100 text-purple-800 border-purple-200",
    badge: "bg-purple-500",
    nilaiProyek: "di atas Rp 50 miliar",
    modalMinimum: "Rp 10 miliar (disetor)",
    sdmWajib: [
      "Min. 2 Tenaga Ahli SKK jenjang 8 (Ahli Utama) — termasuk PJT",
      "Min. 3 Tenaga Ahli SKK jenjang 7 sebagai PJB",
      "Min. 5 Tenaga Teknis bersertifikat SKK",
    ],
    persyaratan: [
      "Akta PT + SK Kemenkumham + Perubahan AD/ART terbaru",
      "NPWP Badan Usaha aktif, tidak bermasalah",
      "NIB dengan KBLI konstruksi yang sesuai",
      "Laporan keuangan 2 tahun diaudit KAP terdaftar OJK",
      "Modal disetor terverifikasi min. Rp 10 miliar",
      "Aset peralatan konstruksi terverifikasi (STNK/BPKB/sewa kontrak)",
      "Referensi proyek selesai min. Rp 50 miliar",
      "Sertifikat SMK3 Gold / ISO 45001",
      "Sertifikat ISO 9001:2015",
      "Rekomendasi asosiasi BUJK terakreditasi LPJK",
      "SKK PJT jenjang 8, 2 SKK PJB jenjang 7",
    ],
    biayaPNBP: "Rp 5.000.000 – Rp 10.000.000",
    waktu: "21–30 hari kerja",
    masaBerlaku: "3 tahun",
  },
};

type GredKey = keyof typeof gredData;
const gredOrder: GredKey[] = ["K1", "K2", "K3", "M", "B"];

// ─── Tahapan Proses SBU ────────────────────────────────────────────────────
const tahapanProses = [
  { no: 1, judul: "Registrasi & Login Portal LPJK", detail: "Buat akun di portal.lpjk.go.id menggunakan NIK pengurus dan NPWP badan usaha. Verifikasi akun via email.", icon: Globe },
  { no: 2, judul: "Pilih Jenis & Subklasifikasi SBU", detail: "Tentukan jenis SBU (Kontraktor/Konsultan/Spesialis) dan subklasifikasi yang sesuai dengan KBLI di NIB. Pilih gred kualifikasi yang ditargetkan.", icon: Layers },
  { no: 3, judul: "Daftar & Rekomendasi Asosiasi", detail: "Bergabung dengan asosiasi BUJK terakreditasi LPJK sesuai bidang. Dapatkan surat rekomendasi dari asosiasi sebagai persyaratan SBU.", icon: Users },
  { no: 4, judul: "Upload Dokumen Persyaratan", detail: "Upload seluruh dokumen yang dipersyaratkan per gred: akta, NPWP, SKK, keuangan, peralatan, dan referensi pekerjaan. Format PDF, max 5MB per file.", icon: FileText },
  { no: 5, judul: "Verifikasi Asosiasi", detail: "Asosiasi melakukan verifikasi dokumen (max 7 hari). Jika lulus, asosiasi meneruskan ke LPJK dengan rekomendasi tertulis.", icon: CheckCircle2 },
  { no: 6, judul: "Verifikasi LPJK", detail: "LPJK memverifikasi dokumen secara menyeluruh (max 14 hari kerja per Permen PU 6/2025). Bisa ada permintaan dokumen tambahan.", icon: Shield },
  { no: 7, judul: "Pembayaran PNBP", detail: "Setelah verifikasi disetujui, lakukan pembayaran PNBP melalui Simponi/bank persepsi. Upload bukti bayar ke portal.", icon: BarChart3 },
  { no: 8, judul: "Penerbitan SBU Digital", detail: "SBU digital diterbitkan dan dapat diunduh dari portal LPJK. SBU berlaku 3 tahun sejak tanggal penerbitan. Terintegrasi otomatis ke SIKI & OSS.", icon: Award },
];

// ─── Checklist Dokumen ─────────────────────────────────────────────────────
const dokumenChecklist: Record<GredKey, Array<{ nama: string; ket: string; wajib: boolean }>> = {
  K1: [
    { nama: "Akta Pendirian + SK Kemenkumham", ket: "PT atau CV yang masih aktif", wajib: true },
    { nama: "NPWP Badan Usaha (aktif)", ket: "Cetak dari portal DJP, tidak dalam pembekuan", wajib: true },
    { nama: "NIB dengan KBLI Konstruksi", ket: "KBLI 41xxx / 42xxx / 43xxx sesuai subklasifikasi", wajib: true },
    { nama: "KTP seluruh Direksi/Pengurus", ket: "Wajib semua pengurus aktif", wajib: true },
    { nama: "NPWP seluruh Direksi/Pengurus", ket: "NPWP pribadi masing-masing pengurus", wajib: true },
    { nama: "SKK PJT (min. jenjang 5 atau 6)", ket: "Sesuai subklasifikasi SBU yang diajukan", wajib: true },
    { nama: "Neraca Keuangan Sederhana", ket: "Laporan sederhana cukup untuk K1 per Permen PU 6/2025", wajib: true },
    { nama: "Surat Domisili Usaha", ket: "Dari RT/RW atau kelurahan setempat", wajib: true },
    { nama: "Rekomendasi Asosiasi BUJK", ket: "Asosiasi wajib terakreditasi LPJK", wajib: true },
    { nama: "Surat Pernyataan Tidak Sedang Pailit", ket: "Ditandatangani direktur utama di atas materai", wajib: true },
    { nama: "Bukti Pembayaran PNBP", ket: "Via Simponi/bank persepsi setelah disetujui LPJK", wajib: true },
    { nama: "Daftar Peralatan (opsional K1)", ket: "Bisa alat sederhana milik/sewa", wajib: false },
  ],
  K2: [
    { nama: "Akta Pendirian PT + SK Kemenkumham", ket: "Harus PT (bukan CV) untuk K2 ke atas", wajib: true },
    { nama: "NPWP Badan Usaha (aktif)", ket: "Tidak dalam pembekuan atau sengketa", wajib: true },
    { nama: "NIB dengan KBLI Konstruksi", ket: "KBLI harus sesuai subklasifikasi SBU", wajib: true },
    { nama: "KTP + NPWP seluruh Direksi & Komisaris", ket: "Semua pengurus aktif dalam akta terbaru", wajib: true },
    { nama: "SKK PJT jenjang 6", ket: "Minimal jenjang 6 untuk K2", wajib: true },
    { nama: "SKK Tenaga Teknis (min. 1, jenjang ≥ 4)", ket: "Terampil — sesuai bidang pekerjaan", wajib: true },
    { nama: "Laporan Keuangan 1 Tahun", ket: "Neraca & laba rugi tahun terakhir", wajib: true },
    { nama: "Daftar Peralatan Konstruksi", ket: "Milik atau sewa kontrak (dengan bukti)", wajib: true },
    { nama: "Rekomendasi Asosiasi BUJK (terakreditasi)", ket: "Wajib dari asosiasi yang terakreditasi LPJK", wajib: true },
    { nama: "Surat Pernyataan Tidak Pailit", ket: "Ditandatangani direktur utama, bermaterai", wajib: true },
    { nama: "Bukti Pembayaran PNBP", ket: "Setelah dokumen diverifikasi LPJK", wajib: true },
    { nama: "Referensi Pengalaman (jika ada)", ket: "Kontrak proyek sejenis — dianjurkan untuk K2", wajib: false },
  ],
  K3: [
    { nama: "Akta PT + SK Kemenkumham + AD Terbaru", ket: "Termasuk perubahan AD jika ada", wajib: true },
    { nama: "NPWP Badan Usaha (aktif, taat pajak)", ket: "Pastikan tidak ada tunggakan pajak", wajib: true },
    { nama: "NIB dengan KBLI Konstruksi", ket: "KBLI sesuai bidang & subklasifikasi SBU", wajib: true },
    { nama: "KTP + NPWP seluruh Direksi & Komisaris", ket: "Semua pengurus aktif", wajib: true },
    { nama: "SKK PJT jenjang 7 (Ahli Madya)", ket: "Wajib Ahli Madya sesuai subklasifikasi", wajib: true },
    { nama: "SKK PJB jenjang 6 (min. 1 orang)", ket: "Penanggung Jawab Bidang", wajib: true },
    { nama: "SKK Tenaga Teknis (min. 2 orang)", ket: "Bersertifikat sesuai bidang pekerjaan", wajib: true },
    { nama: "Laporan Keuangan 2 Tahun Terakhir", ket: "Neraca & laba rugi — lebih kuat jika diaudit", wajib: true },
    { nama: "Daftar & Bukti Kepemilikan Peralatan", ket: "STNK/BPKB atau kontrak sewa peralatan utama", wajib: true },
    { nama: "Referensi Proyek Selesai", ket: "Kontrak + berita acara serah terima pekerjaan", wajib: true },
    { nama: "Rekomendasi Asosiasi BUJK (terakreditasi)", ket: "Wajib dari asosiasi terakreditasi LPJK", wajib: true },
    { nama: "Surat Pernyataan Tidak Pailit", ket: "Bermaterai, ditandatangani Dirut", wajib: true },
    { nama: "Bukti Pembayaran PNBP", ket: "Setelah persetujuan verifikasi LPJK", wajib: true },
    { nama: "Sertifikat ISO 9001 / SMK3", ket: "Dianjurkan untuk memperkuat kualifikasi K3", wajib: false },
  ],
  M: [
    { nama: "Akta PT + SK Kemenkumham + AD Terbaru", ket: "Termasuk seluruh perubahan AD", wajib: true },
    { nama: "NPWP Badan Usaha (aktif, tidak bermasalah)", ket: "Konfirmasi clearance pajak", wajib: true },
    { nama: "NIB KBLI Konstruksi Sesuai Subklasifikasi", ket: "KBLI harus identik dengan subklasifikasi SBU", wajib: true },
    { nama: "KTP + NPWP + SKCK Direksi", ket: "SKCK Direksi utama wajib untuk Menengah ke atas", wajib: true },
    { nama: "SKK PJT jenjang 8 (Ahli Utama)", ket: "Paling senior — sesuai subklasifikasi utama", wajib: true },
    { nama: "SKK PJB jenjang 7 (min. 2 orang)", ket: "Dua Penanggung Jawab Bidang", wajib: true },
    { nama: "SKK Tenaga Teknis (min. 3 orang)", ket: "Bersertifikat, relevan dengan bidang pekerjaan", wajib: true },
    { nama: "Laporan Keuangan Audited 2 Tahun (KAP)", ket: "Diaudit oleh Kantor Akuntan Publik", wajib: true },
    { nama: "Modal Disetor Terverifikasi min. Rp 1 Miliar", ket: "Dari rekening koran atau surat KAP", wajib: true },
    { nama: "Daftar & Nilai Aset Peralatan Terverifikasi", ket: "Nilai peralatan substantif sesuai kualifikasi", wajib: true },
    { nama: "Referensi Proyek min. Rp 15 Miliar", ket: "Kontrak + BAST (Berita Acara Serah Terima)", wajib: true },
    { nama: "Rekomendasi Asosiasi BUJK (terakreditasi)", ket: "Wajib dari asosiasi terakreditasi LPJK", wajib: true },
    { nama: "Bukti Pembayaran PNBP", ket: "Setelah disetujui LPJK", wajib: true },
    { nama: "Sertifikat ISO 9001:2015", ket: "Sangat dianjurkan — jadi nilai plus", wajib: false },
    { nama: "Sertifikat SMK3 Silver/Gold", ket: "PP 50/2012 — sangat dianjurkan", wajib: false },
  ],
  B: [
    { nama: "Akta PT + SK Kemenkumham + AD Lengkap", ket: "Semua dokumen korporat terbaru", wajib: true },
    { nama: "NPWP + SPT Tahunan 2 Tahun Terakhir", ket: "Bukti kepatuhan pajak korporasi", wajib: true },
    { nama: "NIB KBLI Konstruksi Sesuai", ket: "Terverifikasi di OSS-RBA", wajib: true },
    { nama: "KTP + NPWP + SKCK seluruh Direksi", ket: "Dokumen lengkap semua pengurus aktif", wajib: true },
    { nama: "SKK PJT jenjang 8 (Ahli Utama, min. 2)", ket: "Wajib minimal 2 Ahli Utama termasuk PJT", wajib: true },
    { nama: "SKK PJB jenjang 7 (min. 3 orang)", ket: "Tiga Penanggung Jawab Bidang", wajib: true },
    { nama: "SKK Tenaga Teknis (min. 5 orang)", ket: "Bersertifikat sesuai bidang", wajib: true },
    { nama: "Laporan Keuangan Audited 2 Tahun (KAP terdaftar OJK)", ket: "Wajib KAP yang terdaftar di OJK", wajib: true },
    { nama: "Modal Disetor min. Rp 10 Miliar (terverifikasi)", ket: "Rekening koran atau surat verifikasi bank", wajib: true },
    { nama: "Aset & Peralatan Konstruksi Terverifikasi", ket: "Nilai peralatan signifikan, bukti kepemilikan/sewa", wajib: true },
    { nama: "Referensi Proyek min. Rp 50 Miliar (BAST)", ket: "Proyek selesai dengan berita acara serah terima", wajib: true },
    { nama: "Sertifikat SMK3 Gold / ISO 45001:2018", ket: "Wajib untuk kualifikasi Besar", wajib: true },
    { nama: "Sertifikat ISO 9001:2015", ket: "Sistem Manajemen Mutu terverifikasi", wajib: true },
    { nama: "Rekomendasi Asosiasi BUJK (terakreditasi)", ket: "Wajib asosiasi terakreditasi LPJK", wajib: true },
    { nama: "Bukti Pembayaran PNBP", ket: "Setelah verifikasi LPJK selesai", wajib: true },
    { nama: "ISO 14001 Manajemen Lingkungan", ket: "Dianjurkan untuk proyek berdampak lingkungan", wajib: false },
    { nama: "IMS (ISO 9001 + 14001 + 45001)", ket: "Sangat dianjurkan untuk BUJK Besar berskala nasional", wajib: false },
  ],
};

interface CheckItem { nama: string; ket: string; wajib: boolean; checked: boolean; }

export default function SBUPage() {
  const { toast } = useToast();
  const [activeGred, setActiveGred] = useState<GredKey>("K3");
  const [searchSub, setSearchSub] = useState("");
  const [filterJenis, setFilterJenis] = useState("semua");
  const [filterBidang, setFilterBidang] = useState("semua");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistGred, setChecklistGred] = useState<GredKey>("K3");
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [showRegulasi, setShowRegulasi] = useState(false);
  const [selectedReg, setSelectedReg] = useState(0);

  const bidangList = Array.from(new Set(subklasifikasiData.map(s => s.bidang)));
  const jenisOptions = ["Kontraktor", "Kontraktor Spesialis", "Konsultan"];

  const filteredSub = subklasifikasiData.filter(s => {
    const matchSearch = s.kode.toLowerCase().includes(searchSub.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchSub.toLowerCase());
    const matchJenis = filterJenis === "semua" || s.jenis === filterJenis;
    const matchBidang = filterBidang === "semua" || s.bidang === filterBidang;
    return matchSearch && matchJenis && matchBidang;
  });

  function openChecklist(gred: GredKey) {
    setChecklistGred(gred);
    setChecklist(dokumenChecklist[gred].map(d => ({ ...d, checked: false })));
    setShowChecklist(true);
  }

  function toggleCheck(idx: number) {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  }

  const checked = checklist.filter(c => c.checked).length;
  const checkProgress = checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0;

  function copyChecklist() {
    const lines = checklist.map(c => `${c.checked ? "✅" : "⬜"} ${c.nama} — ${c.ket}`).join("\n");
    const text = `CHECKLIST DOKUMEN SBU — Gred ${checklistGred}\n${"─".repeat(50)}\n${lines}\n\nProgress: ${checked}/${checklist.length} dokumen`;
    navigator.clipboard.writeText(text);
    toast({ title: "Checklist disalin!", description: "Teks checklist sudah tersalin ke clipboard." });
  }

  const gred = gredData[activeGred];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center gap-3 py-3">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-sbu">
                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
              </Button>
            </Link>
            <div className="h-5 w-px bg-slate-200 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="font-bold text-slate-800 truncate">Sertifikasi SBU</span>
              <Badge className="text-xs bg-amber-100 text-amber-800 border border-amber-200 hidden sm:inline-flex flex-shrink-0">Permen PU 6/2025</Badge>
            </div>
            {/* Desktop-only action buttons */}
            <div className="hidden sm:flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => { setShowRegulasi(true); setSelectedReg(0); }} data-testid="button-regulasi-pp28">
                <BookOpen className="w-4 h-4 mr-1" /> PP 28/2025
              </Button>
              <ConsultationModal serviceType="sbu" serviceLabel="Sertifikasi SBU" triggerSize="sm" data-testid="button-konsultasi-sbu" />
              <Link href="/agent-hub">
                <Button size="sm" variant="outline" data-testid="button-ai-sbu">
                  <Zap className="w-4 h-4 mr-1" /> Konsultasi AI
                </Button>
              </Link>
            </div>
          </div>
          {/* Mobile-only action strip (second row) */}
          <div className="sm:hidden flex items-center gap-2 pb-2 border-t pt-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setShowRegulasi(true); setSelectedReg(0); }} data-testid="button-regulasi-pp28-mobile">
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Regulasi
            </Button>
            <ConsultationModal serviceType="sbu" serviceLabel="Sertifikasi SBU" triggerSize="sm" triggerClassName="flex-1 w-full text-xs" data-testid="button-konsultasi-sbu-mobile" />
            <Link href="/agent-hub" className="flex-1">
              <Button size="sm" variant="outline" className="w-full text-xs" data-testid="button-ai-sbu-mobile">
                <Zap className="w-3.5 h-3.5 mr-1" /> AI Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Hero + Regulasi Update Banner */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <Badge className="mb-3 bg-amber-500 text-white text-xs px-3 py-1">
                Sertifikat Badan Usaha Jasa Konstruksi — LPJK
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
                SBU Konstruksi<br />
                <span className="text-amber-600">PP 28/2025 & Permen PU 6/2025</span>
              </h1>
              <p className="text-slate-600 leading-relaxed mb-4">
                SBU (Sertifikat Badan Usaha) adalah bukti pengakuan formal atas kemampuan dan kompetensi
                badan usaha jasa konstruksi dari <strong>LPJK (Lembaga Pengembangan Jasa Konstruksi)</strong>.
                Wajib dimiliki oleh seluruh BUJK untuk dapat mengikuti tender pemerintah dan swasta berdasarkan
                <strong> PP No. 28 Tahun 2025</strong> dan <strong>Permen PU No. 6 Tahun 2025</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> 5 Kualifikasi SBU</Badge>
                <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Digital via Portal LPJK</Badge>
                <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Masa Berlaku 3 Tahun</Badge>
                <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Terintegrasi SIKI & OSS</Badge>
              </div>
            </div>

            {/* Gred Selector Cards */}
            <div className="grid grid-cols-3 gap-2">
              {gredOrder.map(g => {
                const cfg = gredData[g];
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGred(g)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      activeGred === g ? "border-amber-500 bg-amber-50 shadow" : "border-slate-200 bg-white hover:border-amber-200"
                    }`}
                    data-testid={`button-gred-${g}`}
                  >
                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 ${cfg.warna}`}>{cfg.singkat}</div>
                    <div className="text-[11px] text-slate-600 leading-tight">{cfg.nilaiProyek}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{cfg.waktu}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Perubahan Regulasi Alert */}
          <div className="grid md:grid-cols-2 gap-3">
            {regulasiTerbaru.map((r, i) => (
              <button
                key={r.kode}
                onClick={() => { setSelectedReg(i); setShowRegulasi(true); }}
                className="flex gap-3 p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 transition-all text-left"
                data-testid={`button-reg-${i}`}
              >
                <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-blue-900">{r.kode}</span>
                    <Badge className="text-[10px] bg-blue-600 text-white h-4 px-1.5">BARU 2025</Badge>
                  </div>
                  <div className="text-xs text-blue-800 mt-0.5">{r.judul}</div>
                  <div className="text-[10px] text-blue-600 mt-1">Menggantikan: {r.menggantikan} → klik untuk detail perubahan</div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 ml-auto mt-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Detail Per Gred */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Persyaratan Detail per Gred Kualifikasi
          </h2>
          <Tabs value={activeGred} onValueChange={v => setActiveGred(v as GredKey)}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6 h-auto gap-0.5">
              {gredOrder.map(g => (
                <TabsTrigger key={g} value={g} className="py-2 px-1 text-xs font-bold" data-testid={`tab-gred-${g}`}>
                  {g}
                </TabsTrigger>
              ))}
            </TabsList>

            {gredOrder.map(gredKey => {
              const cfg = gredData[gredKey];
              return (
                <TabsContent key={gredKey} value={gredKey} className="space-y-5">
                  {/* Summary Banner */}
                  <div className={`p-5 rounded-2xl border ${cfg.warna}`}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-2xl font-black">{cfg.label}</span>
                          <Badge className={`${cfg.badge} text-white`}>LPJK — Permen PU 6/2025</Badge>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 mt-3">
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-xs opacity-70 mb-0.5">Nilai Proyek Maks.</div>
                            <div className="font-bold text-sm">{cfg.nilaiProyek}</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-xs opacity-70 mb-0.5">Modal Minimum</div>
                            <div className="font-bold text-sm">{cfg.modalMinimum}</div>
                          </div>
                          <div className="bg-white/60 rounded-lg p-3">
                            <div className="text-xs opacity-70 mb-0.5">Biaya PNBP</div>
                            <div className="font-bold text-sm">{cfg.biayaPNBP}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <div className="bg-white/60 rounded-lg p-3 text-center">
                          <Clock className="w-5 h-5 mx-auto mb-1 opacity-60" />
                          <div className="text-xs opacity-70">Estimasi Waktu</div>
                          <div className="font-bold text-sm">{cfg.waktu}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3 text-center">
                          <RefreshCw className="w-5 h-5 mx-auto mb-1 opacity-60" />
                          <div className="text-xs opacity-70">Masa Berlaku</div>
                          <div className="font-bold text-sm">{cfg.masaBerlaku}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* SDM Wajib */}
                    <Card className="border-amber-200 bg-amber-50/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                          <GraduationCap className="w-4 h-4" /> SDM Wajib Bersertifikat (SKK)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2.5">
                          {cfg.sdmWajib.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 p-3 rounded-lg bg-amber-100 border border-amber-200">
                          <p className="text-xs text-amber-800 font-medium flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            Tanpa SKK yang sesuai, SBU tidak dapat diterbitkan LPJK. SKK wajib sesuai subklasifikasi SBU yang diajukan.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Persyaratan Umum */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-primary" /> Persyaratan Dokumen Utama
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
                  </div>

                  {/* Dokumen Checklist */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" /> Daftar Dokumen Lengkap — Gred {gredKey}
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {dokumenChecklist[gredKey].filter(d => d.wajib).length} wajib · {dokumenChecklist[gredKey].filter(d => !d.wajib).length} kondisional
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {dokumenChecklist[gredKey].map((d, i) => (
                          <div key={i} className="flex gap-2 p-3 rounded-lg border bg-slate-50">
                            {d.wajib ? <CheckCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> : <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
                            <div>
                              <div className="text-sm font-medium">{d.nama}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{d.ket}</div>
                              <Badge variant={d.wajib ? "default" : "secondary"} className="text-[10px] mt-1 h-4 px-1">
                                {d.wajib ? "Wajib" : "Kondisional"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => openChecklist(gredKey)} data-testid={`button-checklist-${gredKey}`}>
                        <ClipboardList className="w-4 h-4 mr-1" /> Checklist Interaktif
                      </Button>
                      <ConsultationModal
                        serviceType="sbu"
                        serviceLabel={`SBU Gred ${gredKey}`}
                        triggerLabel={`Urus SBU Gred ${gredKey}`}
                        triggerSize="sm"
                        data-testid={`button-konsultasi-gred-${gredKey}`}
                      />
                    </CardFooter>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* Tahapan Proses */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" /> Alur Proses Pengajuan SBU (Permen PU 6/2025)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tahapanProses.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div key={t.no} className="relative">
                  <Card className={`h-full ${idx < tahapanProses.length - 1 ? "border-b-2 border-b-primary/20 lg:border-b-0 lg:border-r-2 lg:border-r-primary/20" : ""}`}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {t.no}
                        </div>
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm font-bold mb-1">{t.judul}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{t.detail}</div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subklasifikasi Lookup */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Cari Subklasifikasi SBU
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode atau nama subklasifikasi..."
                    value={searchSub}
                    onChange={e => setSearchSub(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-subklasifikasi"
                  />
                </div>
                <Select value={filterJenis} onValueChange={setFilterJenis}>
                  <SelectTrigger className="sm:w-48" data-testid="select-filter-jenis">
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Jenis</SelectItem>
                    {jenisOptions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterBidang} onValueChange={setFilterBidang}>
                  <SelectTrigger className="sm:w-52" data-testid="select-filter-bidang">
                    <SelectValue placeholder="Semua Bidang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Bidang</SelectItem>
                    {bidangList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredSub.length === 0 ? (
                  <p className="text-center py-6 text-sm text-muted-foreground">Tidak ada hasil yang cocok.</p>
                ) : filteredSub.map(s => {
                  const gredCfg = gredData[s.gredMin as GredKey];
                  return (
                    <div key={s.kode} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-white hover:border-amber-300 transition-colors" data-testid={`sub-row-${s.kode}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="font-mono font-bold text-amber-600 text-sm bg-amber-50 px-2 py-1 rounded flex-shrink-0">{s.kode}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium leading-tight">{s.nama}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.bidang}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">{s.jenis}</Badge>
                        <button
                          onClick={() => setActiveGred(s.gredMin as GredKey)}
                          className={`text-xs px-2 py-1 rounded border font-semibold ${gredCfg?.warna || ""}`}
                          data-testid={`button-sub-gred-${s.kode}`}
                        >
                          Min. {s.gredMin}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredSub.length} dari {subklasifikasiData.length} subklasifikasi. Klik "Min. Gred" untuk melihat persyaratan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Bantu Urus SBU Konstruksi Anda</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tim kami menangani seluruh proses SBU — dari persiapan dokumen, rekomendasi asosiasi, pengajuan LPJK,
                hingga SBU terbit. Sesuai PP 28/2025 & Permen PU 6/2025 yang berlaku.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: TrendingUp, text: "SLA Terukur per Gred" },
                  { icon: Shield, text: "Sesuai Regulasi Terbaru" },
                  { icon: RefreshCw, text: "Perpanjangan Berkala" },
                  { icon: Star, text: "Konsultan Berpengalaman" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <f.icon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/agent-hub">
                <Button className="w-full bg-amber-600 hover:bg-amber-700" data-testid="button-cta-agent-hub-sbu">
                  <Zap className="w-4 h-4 mr-2" /> Konsultasi AI Gratis
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => openChecklist(activeGred)} data-testid="button-cta-checklist-sbu">
                <ClipboardList className="w-4 h-4 mr-2" /> Buat Checklist Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="SBU sudah? Lengkapi persyaratan tender dengan sertifikasi berikut:"
          services={[
            { href: "/skk", icon: GraduationCap, label: "SKK Tenaga Ahli", desc: "Sertifikasi Kompetensi Kerja — wajib untuk BUJK Gred M hingga B2", color: "bg-purple-600", badge: "Wajib" },
            { href: "/tender-generator", icon: FileText, label: "Generator Dokumen Tender", desc: "Buat dokumen penawaran, metode pelaksanaan & rencana K3", color: "bg-green-600" },
            { href: "/iso-smk3", icon: ShieldCheck, label: "ISO / SMK3", desc: "Sertifikasi sistem manajemen mutu & K3 untuk tender besar", color: "bg-emerald-600" },
            { href: "/legalitas", icon: Building2, label: "Legalitas Badan Usaha", desc: "Pastikan PT/CV/Koperasi sudah terdaftar dengan benar di AHU", color: "bg-slate-700" },
          ]}
          nextStep={{ href: "/skk", label: "Lanjut ke SKK Tenaga Ahli →", icon: GraduationCap }}
        />
      </main>

      {/* Regulasi Detail Dialog */}
      <Dialog open={showRegulasi} onOpenChange={setShowRegulasi}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {regulasiTerbaru[selectedReg]?.kode}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-semibold text-blue-900 mb-1">{regulasiTerbaru[selectedReg]?.judul}</div>
              <div className="text-xs text-blue-700 mb-2">Menggantikan: {regulasiTerbaru[selectedReg]?.menggantikan}</div>
              <p className="text-sm text-blue-800">{regulasiTerbaru[selectedReg]?.ringkasan}</p>
            </div>
            <div>
              <div className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Perubahan & Ketentuan Baru
              </div>
              <ul className="space-y-2">
                {regulasiTerbaru[selectedReg]?.perubahan.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm p-2 rounded-lg bg-slate-50 border">
                    <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              {regulasiTerbaru.map((r, i) => (
                <button
                  key={r.kode}
                  onClick={() => setSelectedReg(i)}
                  className={`flex-1 p-2 rounded-lg border text-xs font-semibold transition-all ${
                    selectedReg === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:border-blue-300"
                  }`}
                  data-testid={`button-switch-reg-${i}`}
                >
                  {r.kode}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setShowRegulasi(false)} data-testid="button-close-regulasi">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-primary" />
              Checklist Dokumen SBU — Gred {checklistGred}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress kelengkapan</span>
                <span className="font-bold">{checked}/{checklist.length} dokumen</span>
              </div>
              <Progress value={checkProgress} className="h-2" />
              {checkProgress === 100 && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Semua dokumen siap! Anda dapat mengajukan SBU ke LPJK.
                </p>
              )}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    item.checked ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"
                  }`}
                  onClick={() => toggleCheck(idx)}
                  data-testid={`checklist-sbu-item-${idx}`}
                >
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleCheck(idx)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      {item.nama}
                      <Badge variant={item.wajib ? "default" : "secondary"} className="text-[10px] h-4 px-1 flex-shrink-0">
                        {item.wajib ? "Wajib" : "Kondisional"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.ket}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-muted-foreground flex-shrink-0">Gred:</span>
              <Select value={checklistGred} onValueChange={v => {
                const g = v as GredKey;
                setChecklistGred(g);
                setChecklist(dokumenChecklist[g].map(d => ({ ...d, checked: false })));
              }}>
                <SelectTrigger className="flex-1" data-testid="select-checklist-gred">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gredOrder.map(g => <SelectItem key={g} value={g}>{gredData[g].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-sbu-checklist">
              <Copy className="w-4 h-4 mr-1" /> Salin Checklist
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChecklist(prev => prev.map(c => ({ ...c, checked: false })))} data-testid="button-reset-sbu-checklist">
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowChecklist(false)} data-testid="button-close-sbu-checklist">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
