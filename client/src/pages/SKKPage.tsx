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
  ArrowLeft, GraduationCap, Search, FileText, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Copy, Info, Zap, AlertTriangle, BookOpen,
  ClipboardList, ArrowRight, Users, RefreshCw, Star, Shield,
  CheckCheck, Sparkles, BarChart3, Award, Layers, TrendingUp,
  Building2, HardHat, Cpu, FileCheck
} from "lucide-react";

// ─── Regulasi SKK ──────────────────────────────────────────────────────────
const regulasiSKK = [
  {
    kode: "UU No. 2 Tahun 2017",
    judul: "Undang-Undang Jasa Konstruksi",
    poin: [
      "Pasal 70: Setiap tenaga kerja konstruksi yang bekerja di sektor konstruksi WAJIB memiliki Sertifikat Kompetensi Kerja (SKK).",
      "Pasal 71: SKK diterbitkan oleh lembaga sertifikasi yang mendapat lisensi dari BNSP.",
      "Pasal 72: Pengguna jasa wajib mempekerjakan tenaga kerja konstruksi yang memiliki SKK.",
      "Pasal 89–91: Sanksi pidana bagi pengguna jasa yang tidak mempekerjakan tenaga bersertifikat.",
    ],
  },
  {
    kode: "SK Dirjen Bina Konstruksi No. 114 Tahun 2024",
    judul: "Penetapan Jabatan Kerja & Skema Sertifikasi SKK Konstruksi (Terbaru)",
    poin: [
      "Menetapkan daftar jabatan kerja konstruksi yang berlaku untuk proses SKK — menggantikan daftar lama berbasis SKA/SKT.",
      "Tidak ada lagi istilah SKA (Sertifikat Keahlian) dan SKT (Sertifikat Keterampilan) — semua menggunakan nomenklatur SKK.",
      "Skema sertifikasi diorganisir per jabatan kerja dan jenjang KKNI (1–9), bukan per 'tingkat' seperti sebelumnya.",
      "LSP wajib mengacu pada skema yang telah ditetapkan dalam SK ini saat melakukan asesmen dan penerbitan SKK.",
      "SKK yang diterbitkan sebelum SK ini tetap berlaku sampai masa berlakunya habis, kemudian wajib diperpanjang menggunakan skema baru.",
    ],
  },
  {
    kode: "PP No. 28 Tahun 2025",
    judul: "Peraturan Pelaksanaan Jasa Konstruksi (terbaru)",
    poin: [
      "Memperbarui ketentuan kompetensi tenaga kerja konstruksi, menggantikan PP No. 22 Tahun 2020.",
      "Jenjang SKK menggunakan 9 jenjang KKNI (Kerangka Kualifikasi Nasional Indonesia) secara konsisten.",
      "SKK menjadi syarat mutlak untuk bertindak sebagai PJT/PJB/PJBU dalam pengurusan SBU.",
      "Digitalisasi data SKK melalui integrasi SIKI LPJK ↔ OSS-RBA ↔ portal BNSP.",
      "Masa berlaku SKK 3 tahun — perpanjangan berbasis portofolio & CPD (Continuous Professional Development).",
    ],
  },
  {
    kode: "PerBNSP & SKKNI Konstruksi",
    judul: "Standar Kompetensi Kerja Nasional Indonesia",
    poin: [
      "SKKNI ditetapkan oleh Kementerian PU sebagai standar kompetensi di sektor konstruksi.",
      "Uji kompetensi dilakukan oleh LSP (Lembaga Sertifikasi Profesi) berakreditasi BNSP.",
      "Ada 600+ skema sertifikasi SKK konstruksi yang terdaftar di BNSP.",
      "LSP wajib terakreditasi BNSP, hasil ujian terintegrasi ke portal LPJK.",
    ],
  },
];

// ─── Jenjang SKK ──────────────────────────────────────────────────────────
const jenjangSKK = [
  { jenjang: "1–2", label: "Operator Dasar", kategori: "Terampil", deskripsi: "Mampu melaksanakan pekerjaan sederhana, di bawah pengawasan langsung", contoh: "Buruh konstruksi, asisten tukang, operator alat ringan", pendidikan: "SD / SMP", pengalaman: "–" },
  { jenjang: "3", label: "Pelaksana Terampil Muda", kategori: "Terampil", deskripsi: "Melaksanakan pekerjaan lapangan tertentu dengan pengawasan umum", contoh: "Tukang batu, tukang besi, tukang kayu, operator alat berat kelas III", pendidikan: "SMP / SMK", pengalaman: "Min. 2 tahun" },
  { jenjang: "4", label: "Pelaksana Terampil Madya", kategori: "Terampil", deskripsi: "Melaksanakan pekerjaan kompleks, memimpin grup/regu kecil", contoh: "Mandor, kepala regu, teknisi instalasi ME", pendidikan: "SMK", pengalaman: "Min. 3 tahun" },
  { jenjang: "5", label: "Pelaksana Terampil Utama", kategori: "Terampil / Teknisi", deskripsi: "Menyelia pekerjaan, melakukan kalkulasi teknis sederhana", contoh: "Supervisor lapangan, estimator junior, drafter", pendidikan: "SMK / D3", pengalaman: "Min. 5 tahun" },
  { jenjang: "6", label: "Ahli Muda", kategori: "Ahli", deskripsi: "Merencanakan, melaksanakan, dan mengevaluasi kegiatan teknis dengan mandiri", contoh: "Ahli teknik sipil muda, arsitek muda, ahli ME muda, Pengawas lapangan", pendidikan: "S1 / D4", pengalaman: "Min. 2 tahun setelah lulus" },
  { jenjang: "7", label: "Ahli Madya", kategori: "Ahli", deskripsi: "Memimpin tim teknis, membuat keputusan teknis kompleks, menjadi PJT", contoh: "Ahli teknik sipil madya, manajer proyek madya, PJT SBU Menengah", pendidikan: "S1 + 5 thn / S2 + 2 thn", pengalaman: "Min. 5 tahun (S1) / 2 tahun (S2)" },
  { jenjang: "8", label: "Ahli Utama", kategori: "Ahli", deskripsi: "Pakar di bidangnya, PJT untuk BUJK Besar, pengambil keputusan strategis", contoh: "Ahli teknik sipil utama, PJT BUJK Besar, principal engineer", pendidikan: "S1 + 10 thn / S2 + 7 thn / S3", pengalaman: "Min. 10 tahun (S1) / 7 tahun (S2)" },
  { jenjang: "9", label: "Ahli Utama Senior / Pakar", kategori: "Ahli", deskripsi: "Level tertinggi — ahli yang diakui skala nasional/internasional", contoh: "Pakar rekayasa, profesor teknik, konsultan senior internasional", pendidikan: "S3 / Profesor", pengalaman: "Min. 15+ tahun" },
];

// ─── Bidang Keahlian / Jabatan Kerja SKK ──────────────────────────────────
const jabatanKerja = [
  // Teknik Sipil
  { kode: "SKK-S-001", nama: "Ahli Teknik Jalan", bidang: "Teknik Sipil", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "SI001, SI002", ket: "Perencanaan & pengawasan konstruksi jalan" },
  { kode: "SKK-S-002", nama: "Ahli Teknik Jembatan", bidang: "Teknik Sipil", jenjangMin: 7, jenjangMaks: 8, relevansiSBU: "SI002", ket: "Desain & supervisi konstruksi jembatan, flyover" },
  { kode: "SKK-S-003", nama: "Ahli Teknik Sumber Daya Air", bidang: "Teknik Sipil", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "SI003, SI004", ket: "Bendungan, irigasi, drainase perkotaan" },
  { kode: "SKK-S-004", nama: "Ahli Teknik Geoteknik", bidang: "Teknik Sipil", jenjangMin: 7, jenjangMaks: 8, relevansiSBU: "SP004", ket: "Pondasi, soil investigation, penurunan tanah" },
  { kode: "SKK-S-005", nama: "Ahli Teknik Bangunan Gedung", bidang: "Teknik Sipil", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "BG001-BG009", ket: "Struktur bangunan gedung, kolom, balok, plat" },
  // Arsitektur
  { kode: "SKK-A-001", nama: "Arsitek", bidang: "Arsitektur", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "AR001", ket: "Perancangan arsitektural bangunan gedung" },
  { kode: "SKK-A-002", nama: "Ahli Desain Interior", bidang: "Arsitektur", jenjangMin: 6, jenjangMaks: 7, relevansiSBU: "AR002", ket: "Desain ruang interior komersial dan residensial" },
  { kode: "SKK-A-003", nama: "Ahli Teknik Lanskap", bidang: "Arsitektur", jenjangMin: 6, jenjangMaks: 7, relevansiSBU: "AR001", ket: "Tata ruang luar dan lanskap kawasan" },
  // Mekanikal Elektrikal
  { kode: "SKK-ME-001", nama: "Ahli Teknik Tenaga Listrik", bidang: "Mekanikal-Elektrikal", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "EL010", ket: "Sistem distribusi listrik, panel, trafo" },
  { kode: "SKK-ME-002", nama: "Ahli Teknik Mekanikal", bidang: "Mekanikal-Elektrikal", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "MK001, MK003", ket: "HVAC, plumbing, fire protection system" },
  { kode: "SKK-ME-003", nama: "Ahli Teknik Sistem Proteksi Kebakaran", bidang: "Mekanikal-Elektrikal", jenjangMin: 6, jenjangMaks: 7, relevansiSBU: "43221", ket: "Hydrant, sprinkler, fire alarm, APAR" },
  // Manajemen Proyek
  { kode: "SKK-M-001", nama: "Ahli Manajemen Konstruksi", bidang: "Manajemen Proyek", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "PR301", ket: "Pengelolaan proyek: waktu, biaya, mutu, K3" },
  { kode: "SKK-M-002", nama: "Ahli K3 Konstruksi", bidang: "K3 Konstruksi", jenjangMin: 6, jenjangMaks: 8, relevansiSBU: "Semua bidang", ket: "Sistem manajemen K3, identifikasi risiko, RK3K" },
  { kode: "SKK-M-003", nama: "Ahli Manajemen Mutu Konstruksi", bidang: "Manajemen Proyek", jenjangMin: 6, jenjangMaks: 7, relevansiSBU: "Semua bidang", ket: "QA/QC konstruksi, audit mutu, ISO 9001" },
  // Terampil
  { kode: "SKK-T-001", nama: "Pelaksana Bangunan Gedung/Penyelia", bidang: "Terampil Konstruksi", jenjangMin: 4, jenjangMaks: 5, relevansiSBU: "BG001-BG009", ket: "Pelaksanaan pekerjaan gedung di lapangan" },
  { kode: "SKK-T-002", nama: "Tukang Batu/Beton", bidang: "Terampil Konstruksi", jenjangMin: 3, jenjangMaks: 4, relevansiSBU: "BG, SI", ket: "Pekerjaan pengecoran, pasangan batu, finishing" },
  { kode: "SKK-T-003", nama: "Operator Alat Berat", bidang: "Terampil Konstruksi", jenjangMin: 3, jenjangMaks: 5, relevansiSBU: "SI001, SI004", ket: "Ekskavator, bulldozer, crane, grader" },
  { kode: "SKK-T-004", nama: "Mandor Konstruksi Bangunan", bidang: "Terampil Konstruksi", jenjangMin: 4, jenjangMaks: 5, relevansiSBU: "BG001-BG009", ket: "Memimpin regu kerja lapangan, kontrol kualitas" },
  { kode: "SKK-T-005", nama: "Juru Gambar/Drafter", bidang: "Terampil Konstruksi", jenjangMin: 4, jenjangMaks: 5, relevansiSBU: "Semua", ket: "AutoCAD, BIM dasar, gambar teknik konstruksi" },
  { kode: "SKK-T-006", nama: "Surveyor Pemetaan Konstruksi", bidang: "Terampil Konstruksi", jenjangMin: 4, jenjangMaks: 5, relevansiSBU: "SI001, SI004", ket: "Pengukuran topografi, total station, GPS" },
];

// ─── Alur Proses SKK ──────────────────────────────────────────────────────
const alurSKK = [
  { no: 1, judul: "Identifikasi Jabatan Kerja & Jenjang", detail: "Tentukan jabatan kerja yang sesuai bidang pekerjaan dan jenjang KKNI yang ditargetkan berdasarkan pendidikan dan pengalaman." },
  { no: 2, judul: "Pilih LSP Terakreditasi BNSP", detail: "Cari LSP (Lembaga Sertifikasi Profesi) yang terakreditasi BNSP untuk skema kompetensi yang diinginkan. LSP harus memiliki lisensi aktif dari BNSP." },
  { no: 3, judul: "Pendaftaran Asesmen", detail: "Daftar ke LSP, submit dokumen: CV, ijazah/diploma, KTP, foto 4x6, sertifikat pelatihan relevan (jika ada), dan portofolio proyek." },
  { no: 4, judul: "Asesmen Awal (Verifikasi Portofolio)", detail: "Asesor melakukan verifikasi dokumen: kesesuaian pendidikan, pengalaman kerja, dan portofolio proyek. Bisa online atau tatap muka." },
  { no: 5, judul: "Uji Kompetensi (Asesmen Lapangan/Tulis)", detail: "Uji kompetensi dilakukan oleh asesor BNSP: bisa tes tulis, wawancara teknis, demonstrasi, atau observasi lapangan sesuai unit kompetensi." },
  { no: 6, judul: "Rapat Pleno & Keputusan Asesmen", detail: "Asesor menyampaikan hasil ke pleno LSP. Jika dinyatakan KOMPETEN, proses sertifikasi dilanjutkan. Jika BELUM KOMPETEN, dapat mengajukan banding atau mengikuti pelatihan tambahan." },
  { no: 7, judul: "Penerbitan SKK Digital", detail: "SKK diterbitkan oleh LSP dan dikirim ke BNSP untuk diregistrasi. Data SKK otomatis terintegrasi ke portal LPJK/SIKI. SKK berlaku 3 tahun." },
  { no: 8, judul: "Integrasi ke Portal LPJK & SIKI", detail: "SKK yang sudah terbit otomatis muncul di SIKI LPJK sebagai syarat PJT/PJB pada pengajuan SBU. Data dapat diverifikasi publik melalui portal LPJK." },
];

// ─── Persyaratan per Kategori ──────────────────────────────────────────────
const persyaratanPerKategori = {
  terampil: {
    label: "Tenaga Terampil (SKK Jenjang 1–5)",
    warna: "bg-green-100 text-green-800 border-green-200",
    badge: "bg-green-500",
    deskripsi: "Tenaga Terampil adalah tenaga kerja konstruksi yang melaksanakan pekerjaan lapangan secara langsung — dari tukang, mandor, operator, hingga supervisor lapangan.",
    persyaratan: [
      "KTP (Kartu Tanda Penduduk) yang masih berlaku",
      "Ijazah SD/SMP/SMK sesuai jenjang yang diajukan",
      "Pas foto 4x6 latar merah (4 lembar)",
      "Curriculum Vitae (CV) / Daftar Riwayat Hidup",
      "Surat keterangan pengalaman kerja dari perusahaan (jika ada)",
      "Portofolio pekerjaan / foto dokumentasi lapangan",
      "Sertifikat pelatihan kejuruan (BPVP/BLK) — jika ada, sangat membantu",
      "NPWP pribadi (untuk tenaga yang sudah wajib pajak)",
    ],
    waktu: "3–7 hari kerja",
    biaya: "Rp 300.000 – Rp 800.000",
    berlaku: "3 tahun",
    perpanjangan: "Berbasis portofolio & CPD (Continuous Professional Development)",
  },
  ahli: {
    label: "Tenaga Ahli (SKK Jenjang 6–8)",
    warna: "bg-blue-100 text-blue-800 border-blue-200",
    badge: "bg-blue-500",
    deskripsi: "Tenaga Ahli adalah tenaga kerja konstruksi berpendidikan tinggi (D4/S1/S2/S3) yang memiliki kompetensi teknis tinggi — dari Ahli Muda, Madya, hingga Utama. Wajib sebagai PJT dalam pengurusan SBU.",
    persyaratan: [
      "KTP yang masih berlaku",
      "Ijazah D4/S1/S2/S3 yang dilegalisir perguruan tinggi/dikti",
      "Transkrip nilai akademis",
      "Pas foto 4x6 latar merah (4 lembar)",
      "Curriculum Vitae (CV) lengkap dengan rincian pengalaman proyek",
      "Surat keterangan pengalaman kerja + Surat Referensi dari pemberi kerja",
      "Portofolio proyek (minimal 3–5 proyek) — dokumen kontrak / SPK / BAST",
      "NPWP pribadi (aktif)",
      "STR/izin profesi jika berlaku (misal: Arsitek = IAI, dll)",
      "Sertifikat pelatihan teknis yang relevan (tidak wajib tapi menguntungkan)",
    ],
    waktu: "7–14 hari kerja",
    biaya: "Rp 1.500.000 – Rp 4.000.000",
    berlaku: "3 tahun",
    perpanjangan: "Berbasis CPD (min. 40 SKS per tahun) + portofolio proyek",
  },
  pjt: {
    label: "PJT / PJB untuk SBU (Jenjang 6–8)",
    warna: "bg-amber-100 text-amber-800 border-amber-200",
    badge: "bg-amber-500",
    deskripsi: "Penanggung Jawab Teknis (PJT) dan Penanggung Jawab Bidang (PJB) adalah jabatan dalam struktur BUJK yang wajib dipegang oleh tenaga ahli bersertifikat SKK sesuai subklasifikasi SBU.",
    persyaratan: [
      "SKK Tenaga Ahli yang masih berlaku (sesuai jenjang gred SBU)",
      "Surat pernyataan menjabat sebagai PJT/PJB di BUJK yang bersangkutan (bermaterai)",
      "Tidak sedang menjabat sebagai PJT/PJB di perusahaan lain (larangan double jabatan)",
      "SK pengangkatan sebagai PJT/PJB dari direktur utama perusahaan",
      "Surat perjanjian kerja (kontrak kerja) aktif dengan BUJK",
      "Bukti BPJS Ketenagakerjaan dari BUJK yang bersangkutan",
      "KTP dan NPWP pribadi",
    ],
    waktu: "3–5 hari kerja (setelah SKK terbit)",
    biaya: "Termasuk dalam biaya SBU (tidak biaya tambahan)",
    berlaku: "Selama SKK aktif & kontrak kerja aktif",
    perpanjangan: "Perpanjang SKK = perpanjang masa aktif sebagai PJT/PJB",
  },
};

type KategoriKey = keyof typeof persyaratanPerKategori;

// ─── Dokumen Checklist per Kategori ──────────────────────────────────────
const checklistDokumen: Record<KategoriKey, Array<{ nama: string; ket: string; wajib: boolean }>> = {
  terampil: [
    { nama: "KTP (Kartu Tanda Penduduk)", ket: "Masih berlaku, fotokopi + asli untuk verifikasi", wajib: true },
    { nama: "Ijazah SD/SMP/SMK (sesuai jenjang)", ket: "Dilegalisir kepala sekolah atau dinas pendidikan", wajib: true },
    { nama: "Pas Foto 4x6 latar merah (4 lembar)", ket: "Cetak terbaru, tidak lebih dari 6 bulan", wajib: true },
    { nama: "CV / Riwayat Hidup", ket: "Berisi riwayat pekerjaan dan pengalaman di lapangan", wajib: true },
    { nama: "Surat Keterangan Kerja", ket: "Dari perusahaan tempat bekerja saat ini atau sebelumnya", wajib: true },
    { nama: "Portofolio Pekerjaan / Foto Lapangan", ket: "Foto dokumentasi proyek yang pernah dikerjakan", wajib: true },
    { nama: "NPWP Pribadi", ket: "Jika sudah memiliki dan wajib pajak", wajib: false },
    { nama: "Sertifikat Pelatihan BLK/BPVP", ket: "Pelatihan kejuruan — mendukung kelulusan asesmen", wajib: false },
    { nama: "Formulir Pendaftaran LSP", ket: "Diisi dan ditandatangani — diperoleh dari LSP", wajib: true },
  ],
  ahli: [
    { nama: "KTP (Kartu Tanda Penduduk)", ket: "Masih berlaku, fotokopi + asli untuk verifikasi", wajib: true },
    { nama: "Ijazah D4/S1/S2/S3 (dilegalisir)", ket: "Legalisir dari perguruan tinggi atau DIKTI", wajib: true },
    { nama: "Transkrip Nilai Akademis", ket: "Legalisir dari perguruan tinggi yang bersangkutan", wajib: true },
    { nama: "Pas Foto 4x6 latar merah (4 lembar)", ket: "Cetak terbaru, tidak lebih dari 6 bulan", wajib: true },
    { nama: "CV Lengkap dengan Rincian Proyek", ket: "Minimal cantumkan 5 proyek dengan nilai dan tahun", wajib: true },
    { nama: "Surat Referensi Pengalaman Kerja", ket: "Dari pemberi kerja/klien, di atas kop surat perusahaan", wajib: true },
    { nama: "Portofolio Proyek (min. 3–5 proyek)", ket: "Kontrak / SPK / BAST / surat keterangan serah terima", wajib: true },
    { nama: "NPWP Pribadi (aktif)", ket: "Cetak dari portal DJP Online", wajib: true },
    { nama: "Formulir Pendaftaran LSP", ket: "Diisi dan ditandatangani peserta", wajib: true },
    { nama: "STR / Izin Profesi (IAI, PII, dll)", ket: "Untuk profesi yang memiliki regulasi tersendiri", wajib: false },
    { nama: "Sertifikat Pelatihan Teknis Relevan", ket: "Pelatihan kompetensi dari lembaga terakreditasi", wajib: false },
    { nama: "Sertifikat SKK Lama (untuk perpanjangan)", ket: "Jika ini proses perpanjangan SKK yang sudah ada", wajib: false },
  ],
  pjt: [
    { nama: "SKK Tenaga Ahli Aktif", ket: "Sesuai subklasifikasi SBU yang diurus — belum kedaluwarsa", wajib: true },
    { nama: "Surat Pernyataan PJT/PJB (Bermaterai)", ket: "Pernyataan menjabat hanya di BUJK yang bersangkutan", wajib: true },
    { nama: "SK Pengangkatan PJT/PJB dari Direktur", ket: "Surat keputusan pengangkatan dari direktur utama BUJK", wajib: true },
    { nama: "Surat Perjanjian Kerja (Kontrak Kerja)", ket: "Kontrak kerja aktif dengan BUJK yang mengajukan SBU", wajib: true },
    { nama: "Bukti BPJS Ketenagakerjaan", ket: "Bukti kepesertaan BPJS dari BUJK terkait", wajib: true },
    { nama: "KTP Pribadi", ket: "Kartu Tanda Penduduk yang masih berlaku", wajib: true },
    { nama: "NPWP Pribadi", ket: "NPWP aktif atas nama tenaga ahli yang bersangkutan", wajib: true },
    { nama: "Surat Keterangan Tidak Merangkap di Perusahaan Lain", ket: "Pernyataan bermaterai bahwa tidak menjadi PJT/PJB di tempat lain", wajib: true },
  ],
};

interface CheckItem { nama: string; ket: string; wajib: boolean; checked: boolean; }

const kategoriOrder: KategoriKey[] = ["terampil", "ahli", "pjt"];

export default function SKKPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<KategoriKey>("ahli");
  const [searchJabatan, setSearchJabatan] = useState("");
  const [filterBidang, setFilterBidang] = useState("semua");
  const [filterJenjang, setFilterJenjang] = useState("semua");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistKat, setChecklistKat] = useState<KategoriKey>("ahli");
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [showRegDetail, setShowRegDetail] = useState(false);
  const [selectedReg, setSelectedReg] = useState(0);

  const bidangList = Array.from(new Set(jabatanKerja.map(j => j.bidang)));

  const filteredJabatan = jabatanKerja.filter(j => {
    const matchSearch = j.kode.toLowerCase().includes(searchJabatan.toLowerCase()) ||
      j.nama.toLowerCase().includes(searchJabatan.toLowerCase()) ||
      j.ket.toLowerCase().includes(searchJabatan.toLowerCase());
    const matchBidang = filterBidang === "semua" || j.bidang === filterBidang;
    const matchJenjang = filterJenjang === "semua" ||
      (filterJenjang === "terampil" && j.jenjangMaks <= 5) ||
      (filterJenjang === "ahli-muda" && (j.jenjangMin === 6 || j.jenjangMaks === 6)) ||
      (filterJenjang === "ahli-madya" && (j.jenjangMin <= 7 && j.jenjangMaks >= 7)) ||
      (filterJenjang === "ahli-utama" && j.jenjangMaks >= 8);
    return matchSearch && matchBidang && matchJenjang;
  });

  function openChecklist(kat: KategoriKey) {
    setChecklistKat(kat);
    setChecklist(checklistDokumen[kat].map(d => ({ ...d, checked: false })));
    setShowChecklist(true);
  }

  function toggleCheck(idx: number) {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  }

  const checked = checklist.filter(c => c.checked).length;
  const checkProgress = checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0;

  function copyChecklist() {
    const kat = persyaratanPerKategori[checklistKat];
    const lines = checklist.map(c => `${c.checked ? "✅" : "⬜"} ${c.nama} — ${c.ket}`).join("\n");
    const text = `CHECKLIST DOKUMEN SKK — ${kat.label}\n${"─".repeat(50)}\n${lines}\n\nProgress: ${checked}/${checklist.length} dokumen`;
    navigator.clipboard.writeText(text);
    toast({ title: "Checklist disalin!", description: "Teks checklist SKK sudah tersalin ke clipboard." });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-skk">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-slate-800">Sertifikasi SKK</span>
            <Badge className="text-xs bg-purple-100 text-purple-800 border border-purple-200">UUJK No. 2/2017</Badge>
            <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-200">SK Dirjen BK No. 114/2024</Badge>
            <Badge className="text-xs bg-slate-100 text-slate-700 border border-slate-200">PP 28/2025</Badge>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { setShowRegDetail(true); setSelectedReg(0); }} data-testid="button-reg-skk">
              <BookOpen className="w-4 h-4 mr-1" /> Regulasi
            </Button>
            <ConsultationModal serviceType="skk" serviceLabel="Sertifikasi SKK" triggerSize="sm" data-testid="button-konsultasi-skk" />
            <Link href="/agent-hub">
              <Button size="sm" variant="outline" data-testid="button-ai-skk">
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
            <Badge className="mb-3 bg-purple-600 text-white text-xs px-3 py-1">
              Sertifikat Kompetensi Kerja Konstruksi — BNSP × LPJK
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              SKK Konstruksi<br />
              <span className="text-purple-600">Tenaga Ahli & Tenaga Terampil</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              SKK (Sertifikat Kompetensi Kerja) adalah bukti pengakuan kompetensi tenaga kerja konstruksi
              yang diterbitkan oleh <strong>LSP terakreditasi BNSP</strong>. Tidak ada lagi istilah SKA atau SKT —
              berdasarkan <strong>SK Dirjen Bina Konstruksi No. 114 Tahun 2024</strong>, semua menggunakan
              nomenklatur SKK dengan jabatan kerja dan jenjang KKNI. Per <strong>Pasal 70 UU No. 2/2017</strong>,
              setiap tenaga kerja konstruksi <span className="text-red-600 font-semibold">WAJIB</span> memiliki SKK
              dan menjadi syarat mutlak PJT/PJB dalam pengurusan SBU LPJK.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> 9 Jenjang KKNI</Badge>
              <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> 600+ Skema Kompetensi</Badge>
              <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Terintegrasi SIKI-LPJK</Badge>
              <Badge variant="outline" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Berlaku 3 Tahun</Badge>
            </div>
          </div>

          {/* Jenjang Summary Card */}
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                <Layers className="w-4 h-4" /> Struktur Jenjang SKK — KKNI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { range: "1–2", label: "Operator Dasar", color: "bg-slate-200 text-slate-700" },
                { range: "3–4", label: "Pelaksana Terampil Muda/Madya", color: "bg-green-200 text-green-800" },
                { range: "5", label: "Pelaksana Terampil Utama / Supervisor", color: "bg-teal-200 text-teal-800" },
                { range: "6", label: "Ahli Muda (PJT K1/K2)", color: "bg-blue-200 text-blue-800" },
                { range: "7", label: "Ahli Madya (PJT K3/Menengah)", color: "bg-indigo-200 text-indigo-800" },
                { range: "8", label: "Ahli Utama (PJT Besar)", color: "bg-purple-200 text-purple-800" },
                { range: "9", label: "Pakar / Senior Expert", color: "bg-rose-200 text-rose-800" },
              ].map(j => (
                <div key={j.range} className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 ${j.color}`}>
                    {j.range}
                  </div>
                  <div className="text-sm">{j.label}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Regulasi Banner */}
        <div className="grid md:grid-cols-3 gap-3">
          {regulasiSKK.map((r, i) => (
            <button
              key={r.kode}
              onClick={() => { setSelectedReg(i); setShowRegDetail(true); }}
              className="flex gap-3 p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400 transition-all text-left"
              data-testid={`button-reg-skk-${i}`}
            >
              <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold text-sm text-purple-900 truncate">{r.kode}</div>
                <div className="text-xs text-purple-700 mt-0.5 line-clamp-2">{r.judul}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300 flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>

        {/* Jenjang KKNI Detail */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" /> Jenjang KKNI — Konstruksi (PP 28/2025)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {jenjangSKK.map(j => {
              const isAhli = parseInt(j.jenjang) >= 6;
              const colorMap: Record<string, string> = {
                "1–2": "border-slate-200 bg-slate-50",
                "3": "border-green-200 bg-green-50",
                "4": "border-teal-200 bg-teal-50",
                "5": "border-cyan-200 bg-cyan-50",
                "6": "border-blue-200 bg-blue-50",
                "7": "border-indigo-200 bg-indigo-50",
                "8": "border-purple-200 bg-purple-50",
                "9": "border-rose-200 bg-rose-50",
              };
              const badgeColor: Record<string, string> = {
                "1–2": "bg-slate-500",
                "3": "bg-green-500",
                "4": "bg-teal-500",
                "5": "bg-cyan-500",
                "6": "bg-blue-500",
                "7": "bg-indigo-500",
                "8": "bg-purple-500",
                "9": "bg-rose-500",
              };
              return (
                <Card key={j.jenjang} className={`${colorMap[j.jenjang] || "border-slate-200 bg-white"}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`px-2 py-0.5 rounded text-white text-xs font-bold ${badgeColor[j.jenjang] || "bg-slate-400"}`}>
                        Jenjang {j.jenjang}
                      </div>
                      <Badge variant={isAhli ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                        {j.kategori}
                      </Badge>
                    </div>
                    <div className="font-bold text-sm mb-1">{j.label}</div>
                    <div className="text-xs text-muted-foreground mb-2">{j.deskripsi}</div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Contoh Jabatan</div>
                      <div className="text-xs">{j.contoh}</div>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <div className="text-[10px] bg-white/80 rounded px-1.5 py-0.5 border">{j.pendidikan}</div>
                      {j.pengalaman !== "–" && (
                        <div className="text-[10px] bg-white/80 rounded px-1.5 py-0.5 border">{j.pengalaman}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Persyaratan per Kategori */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-600" /> Persyaratan per Kategori SKK
          </h2>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as KategoriKey)}>
            <TabsList className="grid grid-cols-3 mb-6 h-auto">
              {kategoriOrder.map(k => {
                const cfg = persyaratanPerKategori[k];
                return (
                  <TabsTrigger key={k} value={k} className="py-2 flex flex-col gap-0.5 text-xs h-auto overflow-hidden" data-testid={`tab-kat-${k}`}>
                    <span className="font-bold w-full truncate text-center">{k === "pjt" ? "PJT/PJB" : k === "ahli" ? "Tenaga Ahli" : "Tenaga Terampil"}</span>
                    <span className="hidden sm:block text-[10px] opacity-70 w-full truncate text-center">{k === "pjt" ? "Jenjang 6–8" : k === "ahli" ? "Jenjang 6–8" : "Jenjang 1–5"}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {kategoriOrder.map(katKey => {
              const cfg = persyaratanPerKategori[katKey];
              return (
                <TabsContent key={katKey} value={katKey} className="space-y-5">
                  {/* Banner */}
                  <div className={`p-5 rounded-2xl border ${cfg.warna}`}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-2">{cfg.label}</div>
                        <p className="text-sm opacity-90">{cfg.deskripsi}</p>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-1 gap-2 flex-shrink-0">
                        {[
                          { label: "Estimasi Waktu", val: cfg.waktu, icon: Clock },
                          { label: "Biaya Asesmen", val: cfg.biaya, icon: BarChart3 },
                          { label: "Masa Berlaku", val: cfg.berlaku, icon: RefreshCw },
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
                    {/* Persyaratan */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Persyaratan Dokumen
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
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs text-amber-800 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>Perpanjangan SKK: {cfg.perpanjangan}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dokumen Checklist Preview */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-primary" /> Daftar Dokumen Lengkap
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {checklistDokumen[katKey].filter(d => d.wajib).length} wajib
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {checklistDokumen[katKey].map((d, i) => (
                            <div key={i} className="flex gap-2 p-2.5 rounded-lg border bg-slate-50">
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
                        <Button variant="outline" size="sm" onClick={() => openChecklist(katKey)} data-testid={`button-checklist-${katKey}`}>
                          <ClipboardList className="w-4 h-4 mr-1" /> Checklist Interaktif
                        </Button>
                        <ConsultationModal
                          serviceType="skk"
                          serviceLabel={`SKK ${katKey}`}
                          triggerLabel={`Urus SKK ${katKey}`}
                          triggerSize="sm"
                          data-testid={`button-konsultasi-kat-${katKey}`}
                        />
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* Alur Proses */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-600" /> Alur Proses Sertifikasi SKK (via LSP-BNSP)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {alurSKK.map((s, idx) => (
              <Card key={s.no} className={idx % 2 === 0 ? "bg-purple-50/40 border-purple-200" : ""}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {s.no}
                    </div>
                  </div>
                  <div className="text-sm font-bold mb-1">{s.judul}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.detail}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warning Box */}
          <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-red-800 mb-1">⚠️ Larangan Double Jabatan PJT/PJB</div>
              <p className="text-sm text-red-700">
                Berdasarkan PP No. 28/2025 dan peraturan LPJK, satu orang tenaga ahli <strong>hanya boleh menjabat sebagai PJT atau PJB di satu BUJK</strong>.
                Larangan double jabatan ini diverifikasi melalui sistem SIKI LPJK secara otomatis.
                Pelanggaran dapat mengakibatkan pembatalan SBU BUJK yang bersangkutan.
              </p>
            </div>
          </div>
        </div>

        {/* Jabatan Kerja Lookup */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" /> Cari Jabatan Kerja & Skema SKK
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama jabatan kerja atau kode SKK..."
                    value={searchJabatan}
                    onChange={e => setSearchJabatan(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-jabatan"
                  />
                </div>
                <Select value={filterBidang} onValueChange={setFilterBidang}>
                  <SelectTrigger className="sm:w-52" data-testid="select-filter-bidang-skk">
                    <SelectValue placeholder="Semua Bidang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Bidang</SelectItem>
                    {bidangList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterJenjang} onValueChange={setFilterJenjang}>
                  <SelectTrigger className="sm:w-44" data-testid="select-filter-jenjang-skk">
                    <SelectValue placeholder="Semua Jenjang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Jenjang</SelectItem>
                    <SelectItem value="terampil">Terampil (1–5)</SelectItem>
                    <SelectItem value="ahli-muda">Ahli Muda (6)</SelectItem>
                    <SelectItem value="ahli-madya">Ahli Madya (7)</SelectItem>
                    <SelectItem value="ahli-utama">Ahli Utama (8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredJabatan.length === 0 ? (
                  <p className="text-center py-6 text-sm text-muted-foreground">Tidak ada jabatan yang cocok.</p>
                ) : filteredJabatan.map(j => {
                  const isAhli = j.jenjangMin >= 6;
                  const jenjangColor = j.jenjangMaks >= 8 ? "bg-purple-100 text-purple-800 border-purple-200"
                    : j.jenjangMin >= 7 ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                    : j.jenjangMin >= 6 ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-green-100 text-green-800 border-green-200";
                  return (
                    <div key={j.kode} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-white hover:border-purple-300 transition-colors" data-testid={`jabatan-row-${j.kode}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="font-mono font-bold text-purple-600 text-xs bg-purple-50 px-2 py-1 rounded flex-shrink-0">{j.kode}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{j.nama}</div>
                          <div className="text-xs text-muted-foreground">{j.ket}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <Badge variant="outline" className="text-xs">{j.bidang}</Badge>
                        <div className={`text-xs px-2 py-1 rounded border font-semibold ${jenjangColor}`}>
                          Jenjang {j.jenjangMin}–{j.jenjangMaks}
                        </div>
                        <div className="text-xs text-muted-foreground">SBU: {j.relevansiSBU}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredJabatan.length} dari {jabatanKerja.length} jabatan kerja. Klik badge Jenjang untuk detail persyaratan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hubungan SKK ↔ SBU */}
        <Card className="border-indigo-200 bg-indigo-50/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
              <Award className="w-5 h-5" /> Hubungan SKK ↔ SBU LPJK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { gred: "K1 / K2", pjt: "Jenjang 5–6 (Ahli Muda / Terampil Utama)", icon: "🏠", desc: "BUJK Kecil — proyek s.d. Rp 2,5 miliar" },
                { gred: "M1 / M2", pjt: "Jenjang 7 (Ahli Madya)", icon: "🏢", desc: "BUJK Menengah — proyek s.d. Rp 250 miliar" },
                { gred: "B1 / B2", pjt: "Jenjang 8 (Ahli Utama)", icon: "🏗️", desc: "BUJK Besar — proyek s.d. tidak terbatas" },
              ].map(r => (
                <div key={r.gred} className="p-4 rounded-xl bg-white border border-indigo-200">
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className="font-bold text-sm mb-1">SBU Gred {r.gred}</div>
                  <div className="text-xs text-muted-foreground mb-2">{r.desc}</div>
                  <div className="p-2 rounded bg-indigo-50 border border-indigo-200">
                    <div className="text-[10px] text-indigo-600 font-semibold mb-0.5">SKK PJT yang Wajib:</div>
                    <div className="text-xs font-medium text-indigo-900">{r.pjt}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-200">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Bantu Urus SKK Tenaga Ahli & Terampil</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tim kami membantu pengurusan SKK dari persiapan dokumen, pendaftaran ke LSP terakreditasi,
                hingga SKK terbit dan terintegrasi ke portal LPJK untuk pengurusan SBU.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: GraduationCap, text: "LSP Terakreditasi BNSP" },
                  { icon: Clock, text: "SLA Proses Terukur" },
                  { icon: RefreshCw, text: "Bantuan Perpanjangan" },
                  { icon: Award, text: "Koordinasi dengan SBU" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <f.icon className="w-3.5 h-3.5 text-purple-600" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/agent-hub">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-cta-agent-hub-skk">
                  <Zap className="w-4 h-4 mr-2" /> Konsultasi AI Gratis
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => openChecklist("ahli")} data-testid="button-cta-checklist-skk">
                <ClipboardList className="w-4 h-4 mr-2" /> Buat Checklist Dokumen
              </Button>
              <Link href="/sbu">
                <Button variant="outline" className="w-full" data-testid="button-link-to-sbu">
                  <Award className="w-4 h-4 mr-2" /> Lihat Halaman SBU
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="SKK sudah beres? Dorong kompetensi perusahaan ke level berikutnya:"
          services={[
            { href: "/sbu", icon: Award, label: "SBU Konstruksi", desc: "Sertifikasi badan usaha LPJK — wajib untuk semua tender pemerintah", color: "bg-amber-600", badge: "LPJK" },
            { href: "/iso-smk3", icon: Shield, label: "ISO / SMK3", desc: "Tunjukkan sistem manajemen K3 & mutu yang terakreditasi", color: "bg-emerald-600" },
            { href: "/tender-generator", icon: FileText, label: "Dokumen Tender", desc: "Siapkan dokumen penawaran lengkap setelah sertifikasi selesai", color: "bg-green-600" },
            { href: "/ai-chat", icon: Cpu, label: "Tanya AI OpenClaw", desc: "Konsultasi jalur karir SKK, sub-klasifikasi, dan strategi naik jenjang", color: "bg-indigo-600", badge: "AI" },
          ]}
          nextStep={{ href: "/sbu", label: "Lengkapi SBU Perusahaan →", icon: Award }}
        />
      </main>

      {/* Regulasi Detail Dialog */}
      <Dialog open={showRegDetail} onOpenChange={setShowRegDetail}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {regulasiSKK[selectedReg]?.kode}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="font-semibold text-purple-900 mb-1">{regulasiSKK[selectedReg]?.judul}</div>
            </div>
            <ul className="space-y-2">
              {regulasiSKK[selectedReg]?.poin.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg bg-slate-50 border">
                  <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              {regulasiSKK.map((r, i) => (
                <button
                  key={r.kode}
                  onClick={() => setSelectedReg(i)}
                  className={`flex-1 p-2 rounded-lg border text-xs font-semibold transition-all ${selectedReg === i ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 hover:border-purple-300"}`}
                  data-testid={`button-switch-reg-skk-${i}`}
                >
                  {r.kode.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setShowRegDetail(false)} data-testid="button-close-reg-skk">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Dialog */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              Checklist SKK — {persyaratanPerKategori[checklistKat].label}
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Semua dokumen siap! Bisa langsung daftar ke LSP.
                </p>
              )}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${item.checked ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"}`}
                  onClick={() => toggleCheck(idx)}
                  data-testid={`checklist-skk-item-${idx}`}
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex-shrink-0">Kategori:</span>
              <Select value={checklistKat} onValueChange={v => {
                const k = v as KategoriKey;
                setChecklistKat(k);
                setChecklist(checklistDokumen[k].map(d => ({ ...d, checked: false })));
              }}>
                <SelectTrigger className="flex-1" data-testid="select-checklist-kat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOrder.map(k => <SelectItem key={k} value={k}>{persyaratanPerKategori[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-skk-checklist">
              <Copy className="w-4 h-4 mr-1" /> Salin Checklist
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChecklist(prev => prev.map(c => ({ ...c, checked: false })))} data-testid="button-reset-skk-checklist">
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowChecklist(false)} data-testid="button-close-skk-checklist">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
