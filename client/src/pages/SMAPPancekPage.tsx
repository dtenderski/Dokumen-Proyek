import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  ShieldCheck, FileText, ClipboardList, Users, Search,
  Scale, Bell, BookOpen, CheckCircle,
} from "lucide-react";

export default function SMAPPancekPage() {
  return (
    <SubdomainLanding
      badge="ISO 37001 · KPK · SMAP · Pancek · Wajib Semua PT Terdaftar"
      statusVariant="coming-soon"
      icon={ShieldCheck}
      title="SMAP & Pancek — Sistem Anti Penyuapan"
      titleAccent="Anti Penyuapan"
      description="Setiap perusahaan terdaftar di Indonesia wajib memiliki Sistem Manajemen Anti Penyuapan (SMAP) berbasis ISO 37001 atau Panduan Cegah Korupsi (Pancek) dari KPK. Ini bukan pilihan — ini kewajiban hukum. DokumenProyek.com membantu perusahaan membangun sistem ini dari nol hingga tersertifikasi."
      accentColor="bg-teal-600"
      gradientFrom="from-teal-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "ISO 37001", label: "Standar SMAP Internasional" },
        { value: "Pancek",    label: "Panduan KPK Indonesia" },
        { value: "Wajib",    label: "Semua Perusahaan Terdaftar" },
        { value: "KPK",      label: "Diawasi Langsung" },
      ]}
      features={[
        { icon: Search,        title: "Risk Assessment Anti-Korupsi",  desc: "Identifikasi area risiko penyuapan dalam proses bisnis perusahaan menggunakan metodologi ISO 37001." },
        { icon: FileText,      title: "Dokumen SMAP Siap Pakai",       desc: "Generate kebijakan anti-penyuapan, prosedur pelaporan, dan kode etik sesuai standar KPK dan ISO 37001." },
        { icon: ClipboardList, title: "Panduan Pancek KPK",            desc: "Implementasi 8 area Pancek: komitmen, kebijakan, kepatuhan, organisasi, kontrol, komunikasi, pelaporan, evaluasi." },
        { icon: Users,         title: "Pelatihan & Sosialisasi",       desc: "Modul pelatihan anti-korupsi untuk seluruh level karyawan — dari direksi hingga staf lapangan." },
        { icon: Scale,         title: "Whistle-blowing System",        desc: "Bangun mekanisme pelaporan pelanggaran internal yang aman, terlindungi, dan terdokumentasi." },
        { icon: BookOpen,      title: "Due Diligence Mitra Bisnis",    desc: "Prosedur verifikasi dan penilaian integritas vendor, subkontraktor, dan mitra bisnis pihak ketiga." },
        { icon: Bell,          title: "Monitoring & Evaluasi Berkala", desc: "Jadwal review sistem, internal audit, dan laporan kepatuhan SMAP secara berkala." },
        { icon: CheckCircle,   title: "Sertifikasi ISO 37001",         desc: "Pendampingan penuh menuju sertifikasi ISO 37001 oleh lembaga sertifikasi terakreditasi KAN." },
      ]}
      sources={[
        "kpk.go.id",
        "ISO 37001:2016",
        "Perpres No. 54/2018",
        "UU No. 31/1999 (Tipikor)",
        "bsn.go.id",
        "KAN (Komite Akreditasi Nasional)",
        "Panduan Pancek KPK",
      ]}
      ctaPrimary={{ label: "Mulai Implementasi SMAP", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Tanya via WhatsApp", href: "https://wa.me/6281287941900" }}
      footer="Implementasi SMAP & Pancek melindungi perusahaan dari sanksi hukum dan mendukung tata kelola yang baik."
    />
  );
}
