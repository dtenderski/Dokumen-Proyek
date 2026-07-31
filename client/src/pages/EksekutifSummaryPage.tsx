import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  GraduationCap, FileText, BookOpen, BarChart3, Award,
  CalendarClock, Users, RefreshCw, Briefcase,
} from "lucide-react";

export default function EksekutifSummaryPage() {
  return (
    <SubdomainLanding
      badge="SKK Jenjang 7–9 · SKPK · PUB · BNSP · LPJK"
      statusVariant="coming-soon"
      icon={GraduationCap}
      title="Eksekutif Summary & Pengembangan Berkelanjutan"
      titleAccent="Pengembangan Berkelanjutan"
      description="SKK Jenjang 7–9 yang akan memperpanjang sertifikat wajib mengumpulkan poin SKPK dari Pengalaman Kerja dan Pengembangan Keprofesian Berkelanjutan (PKB). Setiap perusahaan juga wajib melaksanakan Pengembangan Usaha Berkelanjutan (PUB). Platform ini membantu dokumentasi, penilaian, dan penyusunan Eksekutif Summary secara otomatis."
      accentColor="bg-amber-600"
      gradientFrom="from-amber-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "Jenjang 7–9", label: "SKK Wajib Perpanjangan" },
        { value: "SKPK",        label: "Sistem Kredit Poin" },
        { value: "PKB",         label: "Pengembangan Keprofesian" },
        { value: "PUB",         label: "Pengembangan Usaha Berkelanjutan" },
      ]}
      features={[
        { icon: FileText,      title: "Generate Eksekutif Summary",   desc: "AI menyusun dokumen Eksekutif Summary berbasis portofolio pengalaman kerja dan penugasan tenaga ahli." },
        { icon: BarChart3,     title: "Tracker Poin SKPK",            desc: "Pantau akumulasi poin dari setiap kegiatan PKB — pelatihan, seminar, publikasi, penugasan — secara real-time." },
        { icon: BookOpen,      title: "Modul PKB Terstruktur",        desc: "Akses pembelajaran Pengembangan Keprofesian Berkelanjutan yang diakui LPJK untuk penambahan poin SKPK." },
        { icon: CalendarClock, title: "Reminder Masa Berlaku SKK",    desc: "Notifikasi 180, 90, dan 30 hari sebelum SKK expired agar persiapan perpanjangan tidak terburu-buru." },
        { icon: Award,         title: "APL01 & APL02 Otomatis",       desc: "Generate dokumen permohonan SKK (APL01 Formulir Permohonan dan APL02 Asesmen Mandiri) secara akurat." },
        { icon: Users,         title: "Manajemen Portofolio Tenaga Ahli", desc: "Kelola SKK seluruh personel BUJK — masa berlaku, bidang keahlian, dan status perpanjangan — dalam satu dashboard." },
        { icon: Briefcase,     title: "PUB untuk BUJK",               desc: "Dokumentasi dan laporan Pengembangan Usaha Berkelanjutan perusahaan melalui kegiatan pembelajaran dan pendampingan." },
        { icon: RefreshCw,     title: "Alur Uji Kompetensi",          desc: "Panduan lengkap proses verifikasi dokumen APL hingga jadwal uji kompetensi di LSP terakreditasi." },
      ]}
      sources={[
        "lpjk.pu.go.id",
        "bnsp.go.id",
        "sijk.pu.go.id",
        "Permen PUPR No. 8/2022",
        "PP No. 14/2021",
        "LSP Konstruksi Terakreditasi",
        "Portal SIKI LPJK",
      ]}
      ctaPrimary={{ label: "Mulai Kelola SKK", href: "/skk", whatsapp: false }}
      ctaSecondary={{ label: "Hubungi Kami", href: "/layanan-ski" }}
      footer="Tersedia untuk semua bidang keahlian SKK: Sipil, Mekanikal, Elektrikal, Arsitektur, Manajemen, dan Spesialis."
    />
  );
}
