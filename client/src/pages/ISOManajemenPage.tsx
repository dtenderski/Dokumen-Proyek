import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  Award, ClipboardList, RefreshCw, Search, CalendarClock,
  Bell, FileText, Users, BarChart3,
} from "lucide-react";

export default function ISOManajemenPage() {
  return (
    <SubdomainLanding
      badge="ISO 9001 · ISO 14001 · ISO 45001 · SMK3 · IATF 16949"
      statusVariant="coming-soon"
      icon={Award}
      title="Manajemen ISO & Sistem Sertifikasi"
      titleAccent="Sistem Sertifikasi"
      description="Platform end-to-end untuk pengurusan, pemeliharaan, dan pembaruan sertifikasi ISO bagi perusahaan jasa konstruksi, ESDM, dan industri manufaktur Indonesia. Dari gap analysis, implementasi dokumen, hingga surveillance audit — semua terpantau dalam satu sistem."
      accentColor="bg-violet-600"
      gradientFrom="from-violet-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "ISO 9001", label: "Sistem Manajemen Mutu" },
        { value: "ISO 14001", label: "Sistem Manajemen Lingkungan" },
        { value: "ISO 45001", label: "K3 Internasional" },
        { value: "SMK3",     label: "PP No. 50/2012" },
      ]}
      features={[
        { icon: Search,        title: "Gap Analysis Otomatis",        desc: "AI mengevaluasi kondisi sistem manajemen perusahaan saat ini vs persyaratan standar ISO yang dipilih." },
        { icon: FileText,      title: "Generate Dokumen ISO",         desc: "Buat manual mutu, prosedur, instruksi kerja, dan rekaman secara otomatis sesuai klausul ISO." },
        { icon: CalendarClock, title: "Jadwal Audit Tersinkronisasi", desc: "Pantau internal audit, surveillance audit tahunan, dan renewal 3 tahunan dalam satu kalender terpadu." },
        { icon: Bell,          title: "Reminder Masa Berlaku",        desc: "Notifikasi otomatis saat sertifikat ISO mendekati masa berakhir — jangan sampai lapsed." },
        { icon: ClipboardList, title: "Manajemen Ketidaksesuaian",    desc: "Catat, tindak lanjuti, dan verifikasi corrective action atas temuan audit dalam sistem terstruktur." },
        { icon: Users,         title: "Multi-Standar & Multi-Site",   desc: "Kelola sertifikasi berbeda (9001, 14001, 45001) di beberapa lokasi atau anak perusahaan sekaligus." },
        { icon: RefreshCw,     title: "Surveillance & Renewal",       desc: "Siapkan dokumen dan evidence untuk audit surveillance tahunan dan renewal sertifikasi 3 tahun." },
        { icon: BarChart3,     title: "Dashboard Kepatuhan ISO",      desc: "Lihat persentase implementasi tiap klausul, status audit, dan tren temuan dalam satu tampilan eksekutif." },
      ]}
      sources={[
        "bsn.go.id",
        "KAN (Komite Akreditasi Nasional)",
        "ISO 9001:2015",
        "ISO 14001:2015",
        "ISO 45001:2018",
        "PP No. 50/2012 (SMK3)",
        "Permen PUPR No. 21/2019",
      ]}
      ctaPrimary={{ label: "Konsultasi ISO Gratis", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Lihat Layanan ISO", href: "/iso-smk3" }}
      footer="Tersedia untuk sektor konstruksi, ESDM, manufaktur, dan layanan profesional."
    />
  );
}
