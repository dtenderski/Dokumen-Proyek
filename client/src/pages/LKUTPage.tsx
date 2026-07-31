import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  BookOpen, CalendarClock, Building2, FileCheck, Upload,
  ShieldCheck, BarChart3, Bell, Database,
} from "lucide-react";

export default function LKUTPage() {
  return (
    <SubdomainLanding
      badge="SIJK · LPJK · Deadline 30 April"
      statusVariant="coming-soon"
      icon={BookOpen}
      title="LKUT — Laporan Kegiatan Usaha Tahunan"
      titleAccent="Usaha Tahunan"
      description="Setiap Badan Usaha Jasa Konstruksi (BUJK) wajib menyampaikan LKUT ke Sistem Informasi Jasa Konstruksi (SIJK) setiap tahun dengan deadline tetap 30 April. Laporan mencakup kinerja usaha, tenaga kerja bersertifikat, dan realisasi proyek. Gagal lapor = SBU terancam tidak dapat diperpanjang."
      accentColor="bg-emerald-600"
      gradientFrom="from-emerald-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "30 Apr",   label: "Deadline Tahunan" },
        { value: "SIJK",     label: "Platform Resmi LPJK" },
        { value: "Wajib",    label: "Semua BUJK" },
        { value: "SBU",      label: "Berpengaruh ke Perpanjangan" },
      ]}
      features={[
        { icon: CalendarClock, title: "Reminder Deadline 30 April",  desc: "Notifikasi bertahap mulai 90, 60, 30, dan 7 hari sebelum deadline — tidak ada BUJK yang ketinggalan." },
        { icon: Building2,     title: "Profil BUJK Otomatis",         desc: "Data profil perusahaan, klasifikasi, dan kualifikasi SBU ter-integrasi langsung dari database LPJK." },
        { icon: FileCheck,     title: "Generate LKUT Otomatis",       desc: "AI membantu mengisi laporan kinerja usaha, tenaga kerja SKK, dan realisasi proyek secara akurat." },
        { icon: Upload,        title: "Submit Langsung ke SIJK",      desc: "Kirim laporan final langsung ke portal SIJK LPJK tanpa perlu berpindah-pindah sistem." },
        { icon: ShieldCheck,   title: "Validasi Data SKK Personel",   desc: "Periksa kelengkapan data SKK seluruh tenaga ahli yang dilaporkan sebelum LKUT dikirim." },
        { icon: BarChart3,     title: "Realisasi Proyek & RAB",       desc: "Input data proyek yang diselesaikan sepanjang tahun dengan nilai kontrak dan progress pekerjaan." },
        { icon: Bell,          title: "Status Verifikasi Real-time",  desc: "Pantau status LKUT yang telah dikirim — diterima, dalam review, atau perlu revisi." },
        { icon: Database,      title: "Arsip Laporan Multi-Tahun",    desc: "Simpan dan akses semua LKUT historis dalam satu dashboard yang terorganisir." },
      ]}
      sources={[
        "sijk.pu.go.id",
        "lpjk.pu.go.id",
        "pu.go.id",
        "UU Jasa Konstruksi No. 2/2017",
        "PP No. 14/2021",
        "Permen PUPR No. 8/2022",
      ]}
      ctaPrimary={{ label: "Daftar Akses Awal", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Hubungi Tim Kami", href: "/layanan-ski" }}
      footer="Integrasi langsung dengan SIJK LPJK — data terkirim aman dan tercatat resmi."
    />
  );
}
