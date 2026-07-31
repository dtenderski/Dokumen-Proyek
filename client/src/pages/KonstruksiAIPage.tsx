import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  Globe, Cpu, BarChart3, Bell, Search, FileText,
  RefreshCw, Users, Zap,
} from "lucide-react";

export default function KonstruksiAIPage() {
  return (
    <SubdomainLanding
      badge="AI-Powered · Update Harian · Portal Publik Konstruksi Indonesia"
      statusVariant="coming-soon"
      icon={Globe}
      title="KonstruksiAI — Portal Informasi Konstruksi"
      titleAccent="Portal Informasi"
      description="Portal konstruksi berbasis kecerdasan buatan yang menjadi media publik DokumenProyek.com. Berisi berita terkini, data regulasi, analisis pasar, peluang tender, dan insight industri konstruksi Indonesia — semuanya dikurasi dan dianalisis oleh Gustafta AI dan diperbarui setiap hari."
      accentColor="bg-cyan-600"
      gradientFrom="from-cyan-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "Daily",     label: "Update Konten AI" },
        { value: "Publik",    label: "Akses Gratis" },
        { value: "Gustafta",  label: "Powered by AI" },
        { value: "Real-time", label: "Data Tender & Regulasi" },
      ]}
      features={[
        { icon: Bell,         title: "Berita Konstruksi Harian",      desc: "Agregasi dan ringkasan berita konstruksi Indonesia dari PUPR, LPJK, LKPP, dan media nasional — dikurasi AI." },
        { icon: Search,       title: "Database Regulasi Terkini",     desc: "Akses cepat ke Permen PUPR, Perpres, dan aturan LPJK terbaru yang diindex dan disederhanakan oleh AI." },
        { icon: BarChart3,    title: "Analisis Pasar Konstruksi",     desc: "Tren nilai proyek, pertumbuhan sektor, distribusi tender per provinsi, dan insight pasar berbasis data nyata." },
        { icon: FileText,     title: "Peluang Tender Terbuka",        desc: "Daftar tender konstruksi aktif dari seluruh LPSE Indonesia — difilter dan diprioritaskan sesuai kualifikasi." },
        { icon: Cpu,          title: "Digest AI Mingguan",            desc: "Ringkasan mingguan kondisi industri konstruksi yang disusun otomatis oleh Gustafta AI — kirim ke email." },
        { icon: Users,        title: "Direktori BUJK Publik",         desc: "Cari dan verifikasi BUJK aktif, kualifikasi SBU, dan data tenaga ahli berlisensi secara publik." },
        { icon: RefreshCw,    title: "Monitor Perubahan Regulasi",    desc: "Notifikasi instan saat ada perubahan aturan yang relevan dengan sektor atau kualifikasi Anda." },
        { icon: Zap,          title: "API Data Konstruksi",           desc: "Endpoint API terbuka untuk developer dan peneliti yang ingin mengintegrasikan data konstruksi Indonesia." },
      ]}
      sources={[
        "pu.go.id",
        "lpjk.pu.go.id",
        "lpse.pu.go.id",
        "lkpp.go.id",
        "inaproc.go.id",
        "sirup.go.id",
        "Media Konstruksi Nasional",
        "Gustafta AI Engine",
      ]}
      ctaPrimary={{ label: "Daftar Akses Awal", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Lihat Agent Hub", href: "/agent-hub" }}
      footer="KonstruksiAI akan tersedia sebagai portal publik terpisah di subdomain konstruksi.dokumenproyek.com"
    />
  );
}
