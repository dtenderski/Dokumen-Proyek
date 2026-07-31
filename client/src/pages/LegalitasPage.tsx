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
  ArrowLeft, Building2, FileText, CheckCircle2, AlertCircle, Clock,
  ChevronRight, Copy, Info, Zap, AlertTriangle, BookOpen, ArrowRight,
  RefreshCw, Star, BarChart3, Award, Layers, TrendingUp, CheckCheck,
  Users, Globe, ClipboardList, Target, Shield, Search, Activity,
  Lightbulb, FileCheck, HardHat, MapPin, Hash
} from "lucide-react";

// ─── Jenis Badan Usaha ────────────────────────────────────────────────────
const jenisUsaha = [
  {
    id: "pt",
    nama: "PT (Perseroan Terbatas)",
    icon: "🏢",
    warna: "bg-blue-50 border-blue-200 text-blue-900",
    badge: "bg-blue-600",
    cocok: "BUJK yang ingin SBU, mengerjakan proyek besar, atau bermitra asing",
    keunggulan: [
      "Bisa mendapatkan semua gred SBU (K1 hingga B2)",
      "Dapat menerima modal asing / joint venture",
      "Liability terbatas — aset pribadi terlindungi",
      "Lebih dipercaya klien & instansi pemerintah",
      "Bisa go public (Tbk) jika berkembang",
    ],
    kelemahan: [
      "Proses pendirian lebih lama & mahal (notaris, AHU, dll)",
      "Membutuhkan minimal 2 pendiri/pemegang saham",
      "Kewajiban laporan tahunan ke Kemenkumham & pajak",
      "Modal dasar minimal Rp 50 juta (modal disetor min. 25%)",
    ],
    modal_min: "Rp 50 juta (modal dasar) — modal disetor minimal 25%",
    pendiri_min: "2 orang / badan hukum",
    waktu: "7 – 14 hari kerja",
    biaya: "Rp 3 – 10 juta (notaris + AHU + legalisir)",
    regulasi: "UU No. 40/2007 tentang Perseroan Terbatas, PP No. 8/2021",
    syarat_sbu: "WAJIB — SBU hanya dapat dimiliki PT atau Badan Usaha berbadan hukum",
    dokumen: [
      { nama: "KTP semua pendiri / pemegang saham", wajib: true },
      { nama: "NPWP pribadi semua pendiri", wajib: true },
      { nama: "Foto 4x6 semua pendiri", wajib: true },
      { nama: "Surat pernyataan modal disetor (bermaterai)", wajib: true },
      { nama: "Domisili usaha / surat sewa kantor", wajib: true },
      { nama: "Email aktif perusahaan", wajib: true },
      { nama: "Nomor telepon aktif perusahaan", wajib: true },
      { nama: "Susunan pengurus (Direksi & Komisaris)", wajib: true },
      { nama: "Komposisi saham per pendiri (%)", wajib: true },
      { nama: "KBLI usaha yang akan dijalankan", wajib: true },
      { nama: "Nama PT pilihan (3 alternatif)", wajib: true },
      { nama: "Sertifikat tanah / bukti kepemilikan tempat usaha", wajib: false },
      { nama: "Izin khusus sektor (jika ada)", wajib: false },
    ],
    alur: [
      { no: 1, judul: "Cek Nama PT di AHU Online", detail: "Cek ketersediaan nama PT di portal AHU Kemenkumham (ahu.go.id). Nama harus belum dipakai dan tidak mengandung kata terlarang." },
      { no: 2, judul: "Penandatanganan Akta Pendirian di Notaris", detail: "Buat akta pendirian PT di hadapan notaris berlisensi. Berisi nama PT, susunan pengurus, modal, KBLI, dan alamat." },
      { no: 3, judul: "Pengesahan di Kemenkumham via AHU", detail: "Notaris mengajukan permohonan pengesahan badan hukum ke Kemenkumham melalui sistem AHU Online. Output: SK Pengesahan PT (Menkumham)." },
      { no: 4, judul: "Pengumuman di Berita Negara RI", detail: "Notaris mendaftarkan PT ke Berita Negara RI (BNRI). Wajib untuk PT berbadan hukum penuh. Biasanya 1–2 minggu setelah SK Kemenkumham." },
      { no: 5, judul: "Daftar NIB via OSS-RBA", detail: "Daftar akun OSS di oss.go.id menggunakan email perusahaan. Input data PT, pilih KBLI, dan NIB akan terbit otomatis setelah verifikasi sistem." },
      { no: 6, judul: "Daftar NPWP Badan Usaha", detail: "Daftar NPWP Badan Usaha di DJP Online atau kunjungi KPP terdekat. Lampirkan SK Kemenkumham, NIB, dan KTP/NPWP pengurus." },
      { no: 7, judul: "Persetujuan Kegiatan Usaha (PKU)", detail: "Untuk KBLI konstruksi tertentu, PKU diterbitkan otomatis setelah NIB. Beberapa KBLI risiko tinggi memerlukan Persetujuan Teknis dari DPMPTSP." },
      { no: 8, judul: "Proses SBU & SIUJK (Tahap Berikutnya)", detail: "Setelah PT, NIB, dan NPWP aktif — proses SBU di LPJK dan SIUJK bisa dimulai. Ini syarat utama operasional BUJK konstruksi." },
    ],
  },
  {
    id: "cv",
    nama: "CV (Commanditaire Vennootschap)",
    icon: "🏠",
    warna: "bg-green-50 border-green-200 text-green-900",
    badge: "bg-green-600",
    cocok: "Usaha skala kecil, kontraktor lokal, atau supplier material",
    keunggulan: [
      "Proses pendirian lebih mudah dan cepat dari PT",
      "Biaya pendirian lebih rendah",
      "Tidak ada persyaratan modal minimum",
      "Cocok untuk usaha konstruksi skala kecil (K1/K2 — jika memenuhi syarat baru)",
      "Lebih fleksibel dalam pengelolaan",
    ],
    kelemahan: [
      "Liability tidak terbatas — sekutu aktif bertanggung jawab penuh",
      "Tidak bisa mendapat modal asing / joint venture",
      "Terbatas untuk SBU gred kecil (regulasi LPJK semakin membatasi CV)",
      "Tidak bisa go public",
      "Sulit mendapat kepercayaan proyek besar / BUMN",
    ],
    modal_min: "Tidak ada minimum formal (sesuai kesepakatan anggota)",
    pendiri_min: "2 orang (sekutu aktif & sekutu pasif)",
    waktu: "3 – 7 hari kerja",
    biaya: "Rp 1 – 3 juta (notaris + pendaftaran PN)",
    regulasi: "KUH Dagang Pasal 19–35, PP No. 24/2018 jo. UU Cipta Kerja 2020",
    syarat_sbu: "Dibatasi — berdasarkan regulasi LPJK terbaru, SBU semakin mensyaratkan badan hukum (PT). Cek kelayakan di LPJK.",
    dokumen: [
      { nama: "KTP sekutu aktif dan sekutu pasif", wajib: true },
      { nama: "NPWP pribadi semua sekutu", wajib: true },
      { nama: "Foto 4x6 sekutu aktif", wajib: true },
      { nama: "Domisili usaha / surat sewa kantor", wajib: true },
      { nama: "Nama CV yang diinginkan", wajib: true },
      { nama: "KBLI usaha yang akan dijalankan", wajib: true },
      { nama: "Komposisi saham/kontribusi per sekutu", wajib: true },
      { nama: "Email dan nomor telepon aktif", wajib: true },
      { nama: "Sertifikat tanah / kepemilikan tempat usaha", wajib: false },
    ],
    alur: [
      { no: 1, judul: "Persiapan Akta CV di Notaris", detail: "Buat akta pendirian CV di hadapan notaris berlisensi. Berisi nama CV, alamat, KBLI, sekutu aktif/pasif, dan pembagian keuntungan." },
      { no: 2, judul: "Pendaftaran di Pengadilan Negeri (PN)", detail: "Notaris mendaftarkan CV ke Pengadilan Negeri setempat. Output: Nomor pendaftaran CV di PN." },
      { no: 3, judul: "Pengumuman di Berita Negara RI", detail: "Untuk CV yang memerlukan pengumuman formal (opsional, namun sangat disarankan untuk keperluan legalitas penuh)." },
      { no: 4, judul: "Daftar NIB via OSS-RBA", detail: "Daftar di oss.go.id, pilih KBLI, dan NIB diterbitkan secara otomatis oleh sistem OSS." },
      { no: 5, judul: "Daftar NPWP Badan Usaha", detail: "Daftar NPWP CV di DJP Online atau KPP terdekat. Lampirkan akta CV, NIB, dan KTP/NPWP sekutu aktif." },
      { no: 6, judul: "Persetujuan Kegiatan Usaha", detail: "Untuk KBLI tertentu di OSS-RBA, PKU diterbitkan otomatis. Cek risiko KBLI untuk tahu apakah diperlukan izin tambahan." },
    ],
  },
  {
    id: "firma",
    nama: "Firma / Perorangan",
    icon: "👤",
    warna: "bg-amber-50 border-amber-200 text-amber-900",
    badge: "bg-amber-600",
    cocok: "Pengusaha perorangan, usaha mikro, atau kontraktor mandiri",
    keunggulan: [
      "Paling mudah didirikan — tidak butuh notaris untuk usaha mikro",
      "Biaya minimal atau hampir gratis",
      "Cukup NIB via OSS untuk usaha mikro/kecil tertentu",
      "Pajak lebih sederhana (PPh orang pribadi)",
    ],
    kelemahan: [
      "Tidak bisa mendapat SBU konstruksi (syarat SBU = badan usaha berbadan hukum)",
      "Liability penuh — semua aset pribadi bisa menjadi tanggung jawab",
      "Tidak bisa memenangkan tender pemerintah senilai besar",
      "Sulit mendapat akses kredit perbankan untuk proyek",
    ],
    modal_min: "Tidak ada persyaratan minimum",
    pendiri_min: "1 orang",
    waktu: "1 – 3 hari kerja",
    biaya: "Rp 0 – 500 ribu (biaya OSS + NPWP)",
    regulasi: "UU No. 7/2021 tentang Harmonisasi Peraturan Perpajakan, PP 28/2025",
    syarat_sbu: "TIDAK BISA — SBU hanya untuk badan usaha, bukan perseorangan",
    dokumen: [
      { nama: "KTP pemilik usaha", wajib: true },
      { nama: "NPWP pribadi pemilik", wajib: true },
      { nama: "Foto 4x6", wajib: true },
      { nama: "Domisili usaha / alamat tempat usaha", wajib: true },
      { nama: "KBLI usaha yang akan dijalankan", wajib: true },
      { nama: "Email dan nomor telepon aktif", wajib: true },
    ],
    alur: [
      { no: 1, judul: "Daftar Akun OSS di oss.go.id", detail: "Buat akun OSS menggunakan NIK & data KTP. Pilih jenis pelaku usaha: Orang Perseorangan." },
      { no: 2, judul: "Lengkapi Data Usaha & KBLI", detail: "Input nama usaha, alamat, KBLI, dan skala usaha (Mikro/Kecil). NIB terbit otomatis setelah data terverifikasi." },
      { no: 3, judul: "Daftar NPWP (jika belum punya)", detail: "Daftar NPWP pribadi di DJP Online. NPWP diperlukan untuk transaksi bisnis, pembukaan rekening usaha, dan pelaporan pajak." },
      { no: 4, judul: "Pertimbangkan Upgrade ke PT/CV", detail: "Jika target mengerjakan proyek konstruksi atau mendapat SBU, sangat disarankan untuk upgrade ke bentuk badan usaha PT atau CV secepatnya." },
    ],
  },
];

// ─── KBLI Konstruksi Penting ──────────────────────────────────────────────
const kbliPenting = [
  { kode: "41011", nama: "Konstruksi Gedung Hunian", jenis: "Konstruksi", risiko: "MT", sbu: "BG001" },
  { kode: "41012", nama: "Konstruksi Gedung Perkantoran", jenis: "Konstruksi", risiko: "MT", sbu: "BG002" },
  { kode: "41014", nama: "Konstruksi Gedung Industri", jenis: "Konstruksi", risiko: "Tinggi", sbu: "BG004" },
  { kode: "42101", nama: "Konstruksi Jalan Raya & Tol", jenis: "Sipil", risiko: "Tinggi", sbu: "SI001" },
  { kode: "42201", nama: "Konstruksi Jaringan Irigasi & Drainase", jenis: "Sipil", risiko: "MT", sbu: "SI003" },
  { kode: "42202", nama: "Konstruksi Jaringan Air Bersih", jenis: "Sipil", risiko: "MT", sbu: "SI004" },
  { kode: "42901", nama: "Konstruksi Bangunan Sipil Lainnya", jenis: "Sipil", risiko: "MT", sbu: "SI005" },
  { kode: "43211", nama: "Instalasi Listrik Bangunan", jenis: "ME", risiko: "MT", sbu: "EL010" },
  { kode: "43221", nama: "Instalasi Saluran Air & Sanitasi", jenis: "ME", risiko: "MR", sbu: "MK001" },
  { kode: "43290", nama: "Instalasi Bangunan Lainnya (HVAC, dll)", jenis: "ME", risiko: "MR", sbu: "MK003" },
  { kode: "43301", nama: "Pengecatan & Pemasangan Kaca", jenis: "Spesialis", risiko: "Rendah", sbu: "SP006" },
  { kode: "71101", nama: "Aktivitas Arsitektur", jenis: "Konsultan", risiko: "Rendah", sbu: "AR001" },
  { kode: "71102", nama: "Aktivitas Keinsinyuran & Konsultasi Teknis", jenis: "Konsultan", risiko: "Rendah", sbu: "PR301" },
];

// ─── Regulasi Legalitas ───────────────────────────────────────────────────
const regulasiLegalitas = [
  { kode: "UU No. 40 Tahun 2007", judul: "Perseroan Terbatas", poin: ["Dasar hukum pendirian PT di Indonesia", "Mengatur modal dasar, pemegang saham, direksi, komisaris", "Liability terbatas bagi pemegang saham", "Kewajiban RUPS tahunan dan laporan keuangan"] },
  { kode: "PP No. 8 Tahun 2021", judul: "Modal Dasar Perseroan", poin: ["Modal dasar PT minimum Rp 50 juta (naik dari PP 29/2016 yang menghapus minimum)", "Modal disetor minimum 25% dari modal dasar", "PT Perorangan bisa didirikan 1 orang untuk UMKM", "Penyederhanaan pendirian PT UMKM melalui SABH"] },
  { kode: "UU No. 11 Tahun 2020 (Cipta Kerja)", judul: "Kemudahan Berusaha & Perizinan", poin: ["NIB sebagai identitas tunggal berusaha menggantikan SIUP, TDP, API", "OSS-RBA sebagai sistem perizinan terintegrasi", "Pendirian PT UMKM bisa perorangan (1 pendiri)", "Persyaratan notaris disederhanakan untuk usaha kecil"] },
  { kode: "PP No. 28 Tahun 2025", judul: "Penyelenggaraan Perizinan Berusaha Berbasis Risiko", poin: ["Perbaruan sistem OSS-RBA — memperbarui PP No. 5/2021", "KBLI diklasifikasi ke 4 level risiko: Rendah/MR/MT/Tinggi", "NIB terbit otomatis untuk KBLI berisiko rendah & MR", "Integrasi data NIB ↔ NPWP ↔ BPJS ↔ SBU/SKK"] },
  { kode: "UU No. 7 Tahun 2014 (Perdagangan) & Perubahannya", judul: "KBLI & Perizinan Usaha", poin: ["KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) sebagai dasar klasifikasi usaha di OSS", "Pemilihan KBLI yang tepat menentukan jenis izin yang diperlukan", "KBLI bisa ditambahkan/diubah tanpa ganti NIB di OSS-RBA"] },
];

type JenisId = "pt" | "cv" | "firma";
type CheckItem = { nama: string; wajib: boolean; checked: boolean };

export default function LegalitasPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<JenisId>("pt");
  const [searchKBLI, setSearchKBLI] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistJenis, setChecklistJenis] = useState<JenisId>("pt");
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [showReg, setShowReg] = useState(false);
  const [selectedReg, setSelectedReg] = useState(0);

  const currentJenis = jenisUsaha.find(j => j.id === activeTab)!;

  const filteredKBLI = kbliPenting.filter(k =>
    k.kode.includes(searchKBLI) ||
    k.nama.toLowerCase().includes(searchKBLI.toLowerCase()) ||
    k.jenis.toLowerCase().includes(searchKBLI.toLowerCase())
  );

  function openChecklist(id: JenisId) {
    const jenis = jenisUsaha.find(j => j.id === id)!;
    setChecklistJenis(id);
    setChecklist(jenis.dokumen.map(d => ({ ...d, checked: false })));
    setShowChecklist(true);
  }

  function toggleCheck(idx: number) {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  }

  const checked = checklist.filter(c => c.checked).length;
  const progress = checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0;

  function copyChecklist() {
    const jenis = jenisUsaha.find(j => j.id === checklistJenis)!;
    const lines = checklist.map(c => `${c.checked ? "✅" : "⬜"} ${c.nama} — ${c.wajib ? "Wajib" : "Kondisional"}`).join("\n");
    const text = `CHECKLIST DOKUMEN LEGALITAS — ${jenis.nama}\n${"─".repeat(50)}\n${lines}\n\nProgress: ${checked}/${checklist.length}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Checklist legalitas tersalin ke clipboard." });
  }

  const risikoColor: Record<string, string> = {
    "Rendah": "bg-green-100 text-green-800",
    "MR": "bg-yellow-100 text-yellow-800",
    "MT": "bg-orange-100 text-orange-800",
    "Tinggi": "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-legalitas">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="w-5 h-5 text-slate-700" />
            <span className="font-bold text-slate-800">Legalitas Usaha Konstruksi</span>
            <Badge className="text-xs bg-slate-200 text-slate-700">UU 40/2007</Badge>
            <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-200">PP 28/2025</Badge>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowReg(true)} data-testid="button-reg-legalitas">
              <BookOpen className="w-4 h-4 mr-1" /> Regulasi
            </Button>
            <ConsultationModal serviceType="legalitas" serviceLabel="Legalitas Usaha" triggerSize="sm" data-testid="button-konsultasi-legalitas" />
            <Link href="/agent-hub">
              <Button size="sm" variant="outline" data-testid="button-ai-legalitas">
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
            <Badge className="mb-3 bg-slate-700 text-white text-xs px-3 py-1">
              Pendirian PT · CV · NIB · NPWP · KBLI Konstruksi
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Legalitas Usaha<br />
              <span className="text-slate-600">Badan Usaha Jasa Konstruksi</span>
            </h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              Legalitas usaha adalah fondasi operasional BUJK (Badan Usaha Jasa Konstruksi).
              Tanpa legalitas yang benar — mulai dari <strong>akta pendirian</strong>, <strong>NIB via OSS-RBA</strong>,
              hingga <strong>NPWP Badan Usaha</strong> — perusahaan tidak bisa mengurus SBU, SIUJK,
              mengikuti tender pemerintah, atau membuka rekening perusahaan.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Pendirian PT/CV", "NIB via OSS-RBA", "NPWP Badan Usaha", "KBLI Konstruksi", "AHU Kemenkumham", "Perubahan Akta"].map(b => (
                <Badge key={b} variant="outline" className="text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-500" /> {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Perbandingan Cepat */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Layers className="w-4 h-4" /> Perbandingan Cepat Bentuk Usaha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 pr-3 font-semibold">Aspek</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-blue-700">PT</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-green-700">CV</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-amber-700">Perorang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { aspek: "Bisa dapat SBU", pt: "✅", cv: "⚠️ Terbatas", perorangan: "❌" },
                      { aspek: "Liability", pt: "Terbatas", cv: "Tidak terbatas", perorangan: "Penuh" },
                      { aspek: "Modal minimum", pt: "Rp 50 juta*", cv: "Bebas", perorangan: "Bebas" },
                      { aspek: "Pendiri minimum", pt: "2 orang", cv: "2 orang", perorangan: "1 orang" },
                      { aspek: "Waktu pendirian", pt: "7–14 hari", cv: "3–7 hari", perorangan: "1–3 hari" },
                      { aspek: "Tender Pemerintah", pt: "✅ Semua", cv: "⚠️ Terbatas", perorangan: "❌ Tidak" },
                      { aspek: "Modal Asing (JO)", pt: "✅", cv: "❌", perorangan: "❌" },
                    ].map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                        <td className="py-1.5 pr-3 text-slate-600">{r.aspek}</td>
                        <td className="text-center py-1.5 px-2">{r.pt}</td>
                        <td className="text-center py-1.5 px-2">{r.cv}</td>
                        <td className="text-center py-1.5 px-2">{r.perorangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-muted-foreground mt-2">*Modal disetor min. 25% dari modal dasar PT.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regulasi Banner */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {regulasiLegalitas.map((r, i) => (
            <button
              key={r.kode}
              onClick={() => { setSelectedReg(i); setShowReg(true); }}
              className="flex gap-3 p-4 rounded-xl border bg-white hover:border-slate-400 transition-all text-left"
              data-testid={`button-reg-lek-${i}`}
            >
              <BookOpen className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-800 leading-tight">{r.kode}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{r.judul}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>

        {/* Detail per Jenis Badan Usaha */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" /> Pilih Bentuk Badan Usaha
          </h2>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as JenisId)}>
            <TabsList className="grid grid-cols-3 h-auto mb-6">
              {jenisUsaha.map(j => (
                <TabsTrigger key={j.id} value={j.id} className="flex flex-col py-3 gap-1 h-auto" data-testid={`tab-jenis-${j.id}`}>
                  <span className="text-base">{j.icon}</span>
                  <span className="font-bold text-xs hidden sm:block">{j.nama.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-60 hidden sm:block">{j.biaya.split("(")[0].trim()}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {jenisUsaha.map(j => (
              <TabsContent key={j.id} value={j.id} className="space-y-5">
                {/* Banner Header */}
                <div className={`p-5 rounded-2xl border-2 ${j.warna}`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-3xl">{j.icon}</span>
                        <div>
                          <div className="font-bold text-xl">{j.nama}</div>
                          <div className="text-sm opacity-80">{j.cocok}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-start gap-2 text-sm">
                          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                          <span><strong>Regulasi:</strong> {j.regulasi}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                          <span><strong>Syarat SBU:</strong> {j.syarat_sbu}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Users className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                          <span><strong>Pendiri:</strong> {j.pendiri_min} | <strong>Modal Min:</strong> {j.modal_min}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2 flex-shrink-0">
                      {[
                        { label: "Estimasi Waktu", val: j.waktu, icon: Clock },
                        { label: "Estimasi Biaya", val: j.biaya.split("(")[0].trim(), icon: BarChart3 },
                      ].map(i => (
                        <div key={i.label} className="bg-white/60 rounded-lg p-3 text-center">
                          <i.icon className="w-4 h-4 mx-auto mb-1 opacity-60" />
                          <div className="text-[10px] opacity-70">{i.label}</div>
                          <div className="font-bold text-xs">{i.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Keunggulan & Kelemahan */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" /> Keunggulan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {j.keunggulan.map((k, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{k}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" /> Keterbatasan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {j.kelemahan.map((k, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>{k}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dokumen yang diperlukan */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" /> Dokumen yang Diperlukan
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {j.dokumen.filter(d => d.wajib).length} wajib
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {j.dokumen.map((d, i) => (
                          <div key={i} className="flex gap-2 p-2.5 rounded-lg border bg-slate-50">
                            {d.wajib
                              ? <CheckCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              : <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
                            <div>
                              <div className="text-sm">{d.nama}</div>
                              <Badge variant={d.wajib ? "default" : "secondary"} className="text-[10px] mt-1 h-4 px-1">
                                {d.wajib ? "Wajib" : "Kondisional"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => openChecklist(j.id as JenisId)} data-testid={`button-checklist-${j.id}`}>
                        <ClipboardList className="w-4 h-4 mr-1" /> Checklist Interaktif
                      </Button>
                      <Link href="/agent-hub">
                        <Button size="sm" data-testid={`button-tanya-${j.id}`}>
                          <Zap className="w-4 h-4 mr-1" /> Tanya AI
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>

                {/* Alur Proses */}
                <div>
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-600" /> Alur Pendirian {j.nama}
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {j.alur.map((a, idx) => (
                      <Card key={a.no} className={idx % 2 === 0 ? "bg-slate-50/60 border-slate-200" : ""}>
                        <CardContent className="pt-4 pb-3">
                          <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center mb-2">
                            {a.no}
                          </div>
                          <div className="text-sm font-bold mb-1">{a.judul}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">{a.detail}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Next Step Alert */}
                {j.id === "pt" && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-blue-900 mb-1">Langkah Selanjutnya setelah PT & NIB aktif:</div>
                      <p className="text-sm text-blue-800">
                        Setelah PT terdaftar, NIB terbit, dan NPWP Badan Usaha aktif —
                        langkah berikutnya adalah mengurus <strong>SBU di LPJK</strong> (Lembaga Pengembangan Jasa Konstruksi)
                        dan menyiapkan <strong>SKK Tenaga Ahli</strong> sebagai PJT/PJB.
                        Tanpa SBU, PT tidak bisa beroperasi secara resmi sebagai BUJK.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Link href="/sbu">
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300" data-testid="button-goto-sbu">
                            <Award className="w-3.5 h-3.5 mr-1" /> Urus SBU
                          </Button>
                        </Link>
                        <Link href="/skk">
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300" data-testid="button-goto-skk">
                            Urus SKK
                          </Button>
                        </Link>
                        <Link href="/oss-rba">
                          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300" data-testid="button-goto-oss">
                            Panduan OSS-RBA
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {j.id === "cv" && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm text-amber-900 mb-1">⚠️ Perhatian: CV dan SBU Konstruksi</div>
                      <p className="text-sm text-amber-800">
                        Regulasi LPJK terbaru (PP No. 28/2025) semakin membatasi CV untuk memiliki SBU.
                        Jika tujuan usaha adalah mengerjakan proyek konstruksi senilai di atas Rp 2,5 miliar atau memerlukan
                        gred SBU Menengah/Besar, <strong>sangat disarankan langsung mendirikan PT</strong> sejak awal
                        untuk menghindari biaya konversi di kemudian hari.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* NIB & NPWP Detail */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* NIB */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                <Globe className="w-5 h-5" /> NIB — Nomor Induk Berusaha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">
                NIB adalah <strong>identitas tunggal berusaha</strong> yang berlaku seumur hidup,
                menggantikan SIUP, TDP, dan API. Diterbitkan otomatis oleh sistem <strong>OSS-RBA</strong>
                sesuai PP No. 28/2025.
              </p>
              <div className="space-y-2">
                {[
                  { f: "13-digit nomor unik per badan usaha", ok: true },
                  { f: "Berlaku seumur hidup — tidak perlu perpanjang", ok: true },
                  { f: "Berlaku sebagai TDP, API, akses BPJS TK & Kesehatan", ok: true },
                  { f: "Bisa ditambah KBLI baru tanpa ganti NIB", ok: true },
                  { f: "Wajib ada sebelum mengurus SBU di LPJK", ok: true },
                  { f: "Terintegrasi sistem SIKI LPJK & portal SKK", ok: true },
                ].map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{f.f}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-white border border-blue-200">
                <div className="text-xs font-semibold text-blue-800 mb-1">Cara daftar NIB:</div>
                <ol className="text-xs space-y-1 text-blue-700 list-decimal list-inside">
                  <li>Buka oss.go.id — klik "Daftar" atau "Masuk"</li>
                  <li>Verifikasi NIK (KTP) atau akun bisnis</li>
                  <li>Input data badan usaha & pilih KBLI</li>
                  <li>NIB terbit otomatis (risiko rendah & MR)</li>
                  <li>Unduh NIB + Persetujuan Kegiatan Usaha</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* NPWP */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-900">
                <Hash className="w-5 h-5" /> NPWP Badan Usaha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">
                NPWP (Nomor Pokok Wajib Pajak) Badan Usaha wajib dimiliki setiap perusahaan
                untuk transaksi bisnis, pembukaan rekening korporasi, penagihan pajak, dan
                pengurusan SBU/SKK di LPJK.
              </p>
              <div className="space-y-2">
                {[
                  { f: "Wajib ada sebelum membuka rekening perusahaan", ok: true },
                  { f: "Diperlukan untuk invoice & tagihan ke klien", ok: true },
                  { f: "Syarat pengajuan SBU & tender pemerintah", ok: true },
                  { f: "Terintegrasi dengan e-Faktur DJP Online", ok: true },
                  { f: "SPT Tahunan PPh Badan wajib dilaporkan setiap April", ok: true },
                  { f: "PKP (Pengusaha Kena Pajak) jika omzet di atas Rp 4,8 miliar/tahun", ok: false },
                ].map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    {f.ok
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
                    <span>{f.f}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-white border border-green-200">
                <div className="text-xs font-semibold text-green-800 mb-1">Cara daftar NPWP Badan:</div>
                <ol className="text-xs space-y-1 text-green-700 list-decimal list-inside">
                  <li>Buka ereg.pajak.go.id atau kunjungi KPP</li>
                  <li>Pilih "Badan" → isi formulir NPWP</li>
                  <li>Upload SK Kemenkumham + NIB + KTP Direksi</li>
                  <li>NPWP diterbitkan dalam 1–3 hari kerja</li>
                  <li>Aktivasi e-Filing & e-Bupot di DJP Online</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KBLI Lookup */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-700" /> KBLI Konstruksi — Panduan Pemilihan
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode atau nama KBLI konstruksi..."
                  value={searchKBLI}
                  onChange={e => setSearchKBLI(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-kbli"
                />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredKBLI.length === 0 ? (
                  <p className="text-center py-6 text-sm text-muted-foreground">Tidak ada KBLI yang cocok.</p>
                ) : filteredKBLI.map(k => (
                  <div key={k.kode} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-white hover:border-slate-300 transition-colors" data-testid={`kbli-row-${k.kode}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="font-mono font-bold text-slate-700 text-sm bg-slate-100 px-2 py-1 rounded flex-shrink-0">{k.kode}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{k.nama}</div>
                        <div className="text-xs text-muted-foreground">SBU: {k.sbu}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Badge variant="outline" className="text-xs">{k.jenis}</Badge>
                      <div className={`text-xs px-2 py-0.5 rounded font-semibold ${risikoColor[k.risiko] || "bg-slate-100 text-slate-800"}`}>
                        Risiko {k.risiko}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Tips:</strong> Pilih KBLI yang paling sesuai dengan pekerjaan utama perusahaan.
                  KBLI 41xxx = Gedung, 42xxx = Sipil, 43xxx = ME/Spesialis, 71xxx = Konsultan.
                  Salah pilih KBLI = SBU tidak bisa diproses di LPJK. Bisa ditambahkan KBLI baru di OSS tanpa ganti NIB.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link ke layanan lanjutan */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-slate-700" /> Langkah Selanjutnya Setelah Legalitas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/oss-rba", icon: Globe, label: "OSS-RBA & Perizinan", desc: "NIB, Izin Usaha, PKU per level risiko KBLI", color: "border-blue-200 bg-blue-50 text-blue-900", badge: "PP 28/2025" },
              { href: "/sbu", icon: Award, label: "Sertifikasi SBU", desc: "Gred K1–B2, dokumen LPJK, PP 28/2025", color: "border-amber-200 bg-amber-50 text-amber-900", badge: "LPJK" },
              { href: "/skk", icon: "graduation_cap", label: "SKK Tenaga Ahli", desc: "PJT/PJB Jenjang 6–8 untuk SBU BUJK", color: "border-purple-200 bg-purple-50 text-purple-900", badge: "BNSP" },
              { href: "/iso-smk3", icon: Shield, label: "ISO & SMK3", desc: "Standar mutu, lingkungan, dan K3 konstruksi", color: "border-green-200 bg-green-50 text-green-900", badge: "PP 50/2012" },
            ].map(s => (
              <Link key={s.href} href={s.href}>
                <Card className={`border-2 ${s.color} h-full hover:shadow-md transition-all cursor-pointer`} data-testid={`button-next-${s.href.replace("/", "")}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      {s.icon === "graduation_cap"
                        ? <span className="text-2xl">🎓</span>
                        : <s.icon className="w-6 h-6" />}
                      <Badge variant="secondary" className="text-[10px]">{s.badge}</Badge>
                    </div>
                    <div className="font-bold text-sm mb-1">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Bantu Pendirian PT/CV & Pengurusan Legalitas BUJK</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tim kami membantu pengurusan legalitas dari awal — dari konsultasi pemilihan bentuk badan usaha,
                pendirian PT/CV, NIB OSS, NPWP, hingga SIUJK dan SBU LPJK.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Users, text: "Notaris Rekanan" },
                  { icon: Clock, text: "Proses Cepat" },
                  { icon: FileCheck, text: "Dokumen Terverifikasi" },
                  { icon: TrendingUp, text: "Siap Lanjut SBU" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <f.icon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/agent-hub">
                <Button className="w-full" data-testid="button-cta-agent-hub-legal">
                  <Zap className="w-4 h-4 mr-2" /> Konsultasi AI Gratis
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => openChecklist("pt")} data-testid="button-cta-checklist-pt">
                <ClipboardList className="w-4 h-4 mr-2" /> Checklist Dokumen PT
              </Button>
              <Link href="/oss-rba">
                <Button variant="outline" className="w-full" data-testid="button-cta-oss">
                  <Globe className="w-4 h-4 mr-2" /> Panduan OSS-RBA
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Layanan Terkait */}
        <RelatedServices
          subtitle="Setelah legalitas badan usaha selesai, langkah berikutnya:"
          services={[
            { href: "/oss-rba", icon: Globe, label: "Perizinan OSS-RBA", desc: "Urus NIB, SBUJK & izin usaha konstruksi via OSS-RBA", color: "bg-blue-600", badge: "Wajib" },
            { href: "/sbu", icon: Award, label: "SBU Konstruksi", desc: "Sertifikasi Badan Usaha LPJK — syarat ikut tender pemerintah", color: "bg-amber-600", badge: "LPJK" },
            { href: "/doc-generator", icon: FileText, label: "Generator Dokumen", desc: "Buat akta, surat kuasa, PKS & dokumen legalitas lainnya", color: "bg-rose-600" },
            { href: "/ai-chat", icon: Zap, label: "Konsultasi AI", desc: "Tanya langsung ke OpenClaw soal jenis badan usaha yang tepat", color: "bg-indigo-600", badge: "AI" },
          ]}
          nextStep={{ href: "/oss-rba", label: "Lanjut ke Perizinan OSS-RBA →", icon: Globe }}
        />
      </main>

      {/* Dialog Regulasi */}
      <Dialog open={showReg} onOpenChange={setShowReg}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-700" />
              {regulasiLegalitas[selectedReg]?.kode}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border">
              <div className="font-semibold text-slate-900 mb-1">{regulasiLegalitas[selectedReg]?.judul}</div>
            </div>
            <ul className="space-y-2">
              {regulasiLegalitas[selectedReg]?.poin.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg bg-white border">
                  <TrendingUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 flex-wrap">
              {regulasiLegalitas.map((r, i) => (
                <button
                  key={r.kode}
                  onClick={() => setSelectedReg(i)}
                  className={`flex-1 min-w-20 p-2 rounded-lg border text-[10px] font-semibold transition-all ${selectedReg === i ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 hover:border-slate-400"}`}
                  data-testid={`button-switch-reg-${i}`}
                >
                  {r.kode.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setShowReg(false)} data-testid="button-close-reg-legal">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Checklist */}
      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-5 h-5 text-slate-700" />
              Checklist Dokumen — {jenisUsaha.find(j => j.id === checklistJenis)?.nama}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kelengkapan dokumen</span>
                <span className="font-bold">{checked}/{checklist.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
              {progress === 100 && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Semua dokumen siap! Bisa langsung ke notaris / OSS.
                </p>
              )}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.checked ? "bg-green-50 border-green-200" : "bg-white hover:bg-slate-50"}`}
                  onClick={() => toggleCheck(idx)}
                  data-testid={`checklist-legal-item-${idx}`}
                >
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleCheck(idx)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm flex items-center gap-2 flex-wrap">
                      {item.nama}
                      <Badge variant={item.wajib ? "default" : "secondary"} className="text-[10px] h-4 px-1 flex-shrink-0">
                        {item.wajib ? "Wajib" : "Kondisional"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyChecklist} data-testid="button-copy-checklist-legal">
              <Copy className="w-4 h-4 mr-1" /> Salin
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChecklist(p => p.map(c => ({ ...c, checked: false })))} data-testid="button-reset-checklist-legal">
              <RefreshCw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowChecklist(false)} data-testid="button-close-checklist-legal">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
