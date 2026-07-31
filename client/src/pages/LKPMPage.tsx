import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  ClipboardList, CalendarClock, Building2, ShieldCheck, FileText,
  RefreshCw, Bell, BarChart3, Globe,
} from "lucide-react";

export default function LKPMPage() {
  return (
    <SubdomainLanding
      badge="BKPM · OSS-RBA · Wajib Semua KBLI"
      statusVariant="coming-soon"
      icon={ClipboardList}
      title="LKPM — Laporan Kegiatan Penanaman Modal"
      titleAccent="Penanaman Modal"
      description="Setiap perusahaan pemegang KBLI wajib menyampaikan LKPM secara berkala — triwulan, semesteran, atau tahunan — melalui sistem OSS BKPM. Telat lapor berarti izin usaha terancam dicabut. DokumenProyek.com hadir untuk mengotomatiskan seluruh proses."
      accentColor="bg-blue-600"
      gradientFrom="from-blue-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "Triwulan", label: "Pelaporan Skala Kecil" },
        { value: "Semesteran", label: "Pelaporan Skala Menengah" },
        { value: "Tahunan", label: "Pelaporan Skala Besar" },
        { value: "OSS-RBA", label: "Platform Resmi" },
      ]}
      features={[
        { icon: CalendarClock, title: "Reminder Otomatis Deadline", desc: "Notifikasi jauh sebelum batas waktu pelaporan — tidak ada lagi laporan yang terlewat karena lupa." },
        { icon: Building2,     title: "Multi-KBLI Support",         desc: "Tangani perusahaan dengan lebih dari satu KBLI dengan jadwal pelaporan berbeda secara bersamaan." },
        { icon: FileText,      title: "Generate Laporan Otomatis",  desc: "Isi data realisasi investasi, tenaga kerja, dan produksi dengan bantuan AI — tinggal review dan submit." },
        { icon: ShieldCheck,   title: "Validasi Sebelum Submit",    desc: "AI memeriksa kelengkapan dan konsistensi data sebelum dikirim ke sistem OSS BKPM." },
        { icon: RefreshCw,     title: "Sinkronisasi Data OSS",      desc: "Tarik data profil perusahaan dari OSS-RBA secara otomatis untuk pre-fill formulir LKPM." },
        { icon: Bell,          title: "Notifikasi Status Laporan",  desc: "Pantau status verifikasi laporan dari BKPM — diterima, ditolak, atau perlu perbaikan." },
        { icon: BarChart3,     title: "Riwayat & Arsip Laporan",   desc: "Simpan semua laporan LKPM historis dalam satu tempat yang terorganisir dan mudah diakses kapanpun." },
        { icon: Globe,         title: "Panduan Regulasi Terkini",   desc: "Database aturan LKPM selalu diperbarui mengikuti perubahan kebijakan BKPM dan OSS-RBA." },
      ]}
      sources={[
        "oss.go.id",
        "bkpm.go.id",
        "perizinan.pu.go.id",
        "OSS-RBA Kementerian Investasi",
        "PP No. 5/2021",
        "Perka BKPM No. 5/2021",
      ]}
      ctaPrimary={{ label: "Daftar Akses Awal", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Hubungi Tim Kami", href: "/layanan-ski" }}
      footer="Layanan LKPM DokumenProyek.com akan terintegrasi penuh dengan sistem OSS BKPM resmi."
    />
  );
}
