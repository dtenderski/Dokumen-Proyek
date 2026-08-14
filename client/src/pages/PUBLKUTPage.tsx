import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  ClipboardList, CalendarClock, Building2, FileCheck,
  TrendingUp, Bell, BarChart3, ShieldCheck, Repeat2,
} from "lucide-react";

export default function PUBLKUTPage() {
  return (
    <SubdomainLanding
      badge="SIJK · LPJK · Deadline 30 April · Wajib BUJK"
      statusVariant="coming-soon"
      icon={ClipboardList}
      title="PUB-LKUT — Pengembangan Usaha Berkelanjutan & Laporan Kegiatan Usaha Tahunan"
      titleAccent="Pengembangan Usaha Berkelanjutan"
      description="Aplikasi terpadu untuk pemenuhan kewajiban BUJK: Pengembangan Usaha Berkelanjutan (PUB) dan Laporan Kegiatan Usaha Tahunan (LKUT). Satu platform untuk memantau, mengisi, dan mengirimkan laporan wajib ke SIJK LPJK sebelum deadline 30 April."
      accentColor="bg-emerald-600"
      gradientFrom="from-emerald-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "PUB",    label: "Pengembangan Usaha Berkelanjutan" },
        { value: "LKUT",   label: "Laporan Kegiatan Usaha Tahunan" },
        { value: "30 Apr", label: "Deadline Tahunan" },
        { value: "SIJK",   label: "Submit ke Portal Resmi LPJK" },
      ]}
      features={[
        { icon: CalendarClock, title: "Reminder Deadline Otomatis",   desc: "Notifikasi bertahap 90, 60, 30, dan 7 hari sebelum deadline 30 April — tidak ada BUJK yang ketinggalan." },
        { icon: Building2,     title: "Profil BUJK Otomatis",          desc: "Data profil perusahaan, klasifikasi SBU, dan kualifikasi ter-integrasi dari database LPJK." },
        { icon: TrendingUp,    title: "Pengembangan Usaha (PUB)",      desc: "Pantau dan dokumentasikan kegiatan pengembangan usaha berkelanjutan sesuai kewajiban regulasi." },
        { icon: FileCheck,     title: "Generate LKUT Otomatis",        desc: "AI membantu mengisi laporan kinerja usaha, tenaga kerja SKK, dan realisasi proyek secara akurat." },
        { icon: Repeat2,       title: "Submit Langsung ke SIJK",       desc: "Kirim laporan PUB dan LKUT langsung ke portal SIJK LPJK tanpa berpindah sistem." },
        { icon: ShieldCheck,   title: "Validasi Data SKK Personel",    desc: "Periksa kelengkapan SKK seluruh tenaga ahli sebelum LKUT dikirim ke SIJK." },
        { icon: BarChart3,     title: "Realisasi Proyek & RAB",        desc: "Input data proyek selesai sepanjang tahun dengan nilai kontrak dan progress pekerjaan." },
        { icon: Bell,          title: "Status Verifikasi Real-time",   desc: "Pantau status laporan yang telah dikirim — diterima, dalam review, atau perlu revisi." },
      ]}
      sources={[
        "sijk.pu.go.id",
        "lpjk.pu.go.id",
        "UU Jasa Konstruksi No. 2/2017",
        "PP No. 14/2021",
        "Permen PUPR No. 8/2022",
      ]}
      ctaPrimary={{ label: "Daftar Akses Awal", href: "/login", whatsapp: false }}
      ctaSecondary={{ label: "Tanya via WhatsApp", href: "https://wa.me/6282299417818?text=Halo%2C+saya+tertarik+dengan+aplikasi+PUB-LKUT", whatsapp: true }}
      footer="Integrasi langsung dengan SIJK LPJK — data terkirim aman dan tercatat resmi."
    />
  );
}
