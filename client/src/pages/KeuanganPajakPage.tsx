import { SubdomainLanding } from "@/components/SubdomainLanding";
import {
  DollarSign, BarChart3, FileText, Calculator, CalendarClock,
  ShieldCheck, RefreshCw, Bell, PieChart,
} from "lucide-react";

export default function KeuanganPajakPage() {
  return (
    <SubdomainLanding
      badge="Konstruksi · ESDM · Manufaktur · PPh · PPN · SPT"
      statusVariant="coming-soon"
      icon={DollarSign}
      title="Keuangan & Perpajakan Proyek Konstruksi"
      titleAccent="Perpajakan Proyek"
      description="Platform keuangan dan perpajakan yang dirancang khusus untuk badan usaha jasa konstruksi, kontraktor, konsultan, dan perusahaan ESDM Indonesia. Dari arus kas proyek, RAB, retensi, hingga pelaporan SPT — semua dalam satu sistem yang memahami regulasi perpajakan konstruksi."
      accentColor="bg-green-600"
      gradientFrom="from-green-950"
      gradientTo="to-slate-950"
      highlights={[
        { value: "PPh 4(2)", label: "Jasa Konstruksi" },
        { value: "PPN",      label: "Faktur Otomatis" },
        { value: "SPT",      label: "Laporan Pajak Terpadu" },
        { value: "RAB",      label: "Estimasi Biaya Proyek" },
      ]}
      features={[
        { icon: BarChart3,    title: "Dashboard Keuangan Proyek",     desc: "Pantau arus kas, progress billing, retensi, dan profitabilitas per proyek dalam satu tampilan eksekutif." },
        { icon: Calculator,   title: "PPh Pasal 4 Ayat 2 Konstruksi", desc: "Hitung dan potong PPh final jasa konstruksi secara otomatis sesuai tarif PP No. 9/2022 — 2,65% s/d 6%." },
        { icon: FileText,     title: "Faktur Pajak PPN Otomatis",     desc: "Generate e-Faktur PPN secara otomatis untuk setiap termin pembayaran proyek — siap upload ke DJP Online." },
        { icon: CalendarClock,title: "Reminder Batas Waktu Pajak",    desc: "Notifikasi deadline SPT Masa (tiap bulan) dan SPT Tahunan (April/Maret) agar tidak kena denda." },
        { icon: PieChart,     title: "RAB & Analisis Harga Satuan",   desc: "Buat Rencana Anggaran Biaya berbasis AHSP terbaru — Permen PUPR dan SNI untuk setiap jenis pekerjaan." },
        { icon: ShieldCheck,  title: "Kepatuhan Perpajakan ESDM",     desc: "Modul khusus perhitungan pajak sektor ESDM: PPh migas, batu bara, dan mineral — sesuai PSC/CoW." },
        { icon: RefreshCw,    title: "Rekonsiliasi Kontrak & Invoice", desc: "Otomatis rekonsiliasi nilai kontrak, addendum, termin, retensi, dan pembayaran dalam satu alur kerja." },
        { icon: Bell,         title: "Peringatan Risiko Keuangan",    desc: "AI mendeteksi potensi masalah arus kas, biaya melebihi anggaran, atau risiko klaim lebih awal." },
      ]}
      sources={[
        "DJP Online (pajak.go.id)",
        "PP No. 9/2022 (PPh Konstruksi)",
        "UU PPN No. 7/2021",
        "Permen PUPR AHSP Terbaru",
        "SKK Migas (sektor ESDM)",
        "PSAK 34 (Kontrak Konstruksi)",
        "Coretax DJP 2025",
      ]}
      ctaPrimary={{ label: "Daftar Akses Awal", href: "/auth", whatsapp: false }}
      ctaSecondary={{ label: "Lihat Keuangan Proyek", href: "/financial" }}
      footer="Terintegrasi dengan sistem akuntansi dan DJP Coretax 2025 — pajak konstruksi jadi lebih mudah."
    />
  );
}
