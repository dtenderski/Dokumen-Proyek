import { useState, useEffect, useRef } from "react";
import { 
  FileText, Shield, LayoutDashboard, HardHat, DollarSign, Recycle,
  BookOpen, Users, Building, Building2, ShoppingBasket, ShieldCheck, PieChart,
  UserCheck, Truck, Wallet, Leaf, CheckCircle, Mail, Phone, MapPin,
  ChevronRight, ArrowRight, LucideIcon, Cpu, Network, Bot, Sparkles, Zap,
  Award, GraduationCap, FolderOpen, Landmark, Briefcase,
  AlertTriangle, Clock, Search, ClipboardList, Bell, BarChart3,
  XCircle, RefreshCw, BookMarked, Star, TrendingUp, Lock, Globe,
  Activity, Brain, Database, Layers, GitBranch, CheckSquare, Timer,
  BarChart, LineChart, PieChart as PieChartIcon, Workflow, Scan, FileCheck
} from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { FeatureCard } from "@/components/FeatureCard";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Module, UserRole, Benefit, HeroContent, CtaContent } from "@shared/schema";
import { LandingSection } from "@/components/LandingSection";

const iconMap: Record<string, LucideIcon> = {
  FileText, Shield, LayoutDashboard, HardHat, DollarSign, Recycle,
  BookOpen, Users, Building, Building2, ShoppingBasket, ShieldCheck, PieChart,
  UserCheck, Truck, Wallet, Leaf, CheckCircle, Mail, Phone, MapPin,
  Award, GraduationCap, FolderOpen, Landmark, Briefcase
};

function getIcon(iconName: string, className: string = "w-6 h-6") {
  const IconComponent = iconMap[iconName];
  if (IconComponent) return <IconComponent className={className} />;
  return <FileText className={className} />;
}

interface LandingContentData {
  hero: HeroContent | null;
  modules: Module[];
  userRoles: UserRole[];
  benefits: Benefit[];
  cta: CtaContent | null;
}

// ── Image-only carousel (hero right column) ──
const CAROUSEL_IMAGES = [
  { src: "/poster-1-brand.jpg",   alt: "DokumenProyek — Lebih Mudah Lebih Aman" },
  { src: "/poster-2-sbu.jpg",     alt: "Bangun Bisnis Konstruksi — SBU SKK ISO" },
  { src: "/poster-3-ai.jpg",      alt: "Gustafta AI — Platform Cerdas Konstruksi" },
  { src: "/poster-4-team.jpg",    alt: "Bersama Kita Bangun Indonesia" },
  { src: "/poster-5-minimal.jpg", alt: "Dokumen Lengkap Proyek Lebih Kuat" },
];

function MediaCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % CAROUSEL_IMAGES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const item = CAROUSEL_IMAGES[current];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Image frame — natural square size, no crop */}
      <div className="relative w-full shadow-2xl shadow-blue-900/40 border border-white/10 rounded-2xl bg-slate-900" style={{ lineHeight: 0 }}>
        <div className="transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
          <img src={item.src} alt={item.alt} className="w-full h-auto block rounded-2xl" />
        </div>
      </div>
      {/* Dot indicators */}
      <div className="flex items-center gap-2 justify-center">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 300); }}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


export default function LandingPage() {
  const { data, isLoading } = useQuery<LandingContentData>({
    queryKey: ['/api/landing-content'],
  });

  const quickAccessItems = [
    { icon: <Building2 className="w-6 h-6" />, label: "Legalitas", to: "mod-legalitas" },
    { icon: <ShieldCheck className="w-6 h-6" />, label: "Perizinan", to: "mod-perizinan" },
    { icon: <Award className="w-6 h-6" />, label: "SBU", to: "mod-sbu" },
    { icon: <GraduationCap className="w-6 h-6" />, label: "SKK", to: "mod-skk" },
    { icon: <FileText className="w-6 h-6" />, label: "Tender", to: "mod-tender" },
    { icon: <FolderOpen className="w-6 h-6" />, label: "Proyek", to: "mod-proyek" },
  ];

  const hero = data?.hero;
  const modules = data?.modules || [];
  const userRoles = data?.userRoles || [];
  const benefits = data?.benefits || [];
  const cta = data?.cta;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh]">
        <div className="absolute inset-0 z-0">
          <img 
            src={hero?.backgroundImage || "/hero-bg.jpg"}
            alt="Platform Dokumen Konstruksi Indonesia"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-slate-900/20" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-[55%_45%] min-h-[92vh] items-end gap-8 pb-16 pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-7 bg-slate-950/80 backdrop-blur-md rounded-2xl p-6 lg:p-8"
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64 bg-white/20" />
                <Skeleton className="h-16 w-full bg-white/20" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-sm backdrop-blur-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                    </span>
                    Platform Dokumen Usaha Konstruksi #1 Indonesia
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs backdrop-blur-sm">
                    <Cpu className="w-3 h-3" />
                    Ditenagai OpenClaw AI • 12 Agen Spesialis
                  </div>
                </div>
                
                <h1 className="font-extrabold leading-tight text-white drop-shadow-sm text-4xl md:text-5xl">
                  Urus <span className="text-accent">Legalitas, Perizinan, Sertifikasi</span> & Dokumen Proyek — Lebih Cepat, Lebih Aman
                </h1>
                
                <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                  Ribuan BUJK, kontraktor, dan tenaga ahli se-Indonesia mempercayakan pengurusan SBU, SKK, ISO, SIUJK, NIB OSS, dan dokumen proyek kepada kami. Didukung Gustafta AI dengan 12 agen spesialis — TenderaClaw, SBUClaw, MultiClaw, LexCom, dan lainnya.
                </p>

                {/* Key facts bar */}
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Industri konstruksi Indonesia menghadapi perubahan regulasi yang masif dan berkesinambungan.
                    Kegagalan administrasi dokumen menjadi penyebab utama gugurnya BUJK di tender —
                    bukan karena tidak kompeten, tetapi karena sistem yang belum mendukung.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <ScrollLink to="eligibility" smooth={true} offset={-80}>
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-slate-900 font-bold px-7 h-12">
                      Cek Kelayakan Gratis <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </ScrollLink>
                  <a href="https://gustafta.my.id/klinik-konsultasi" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="border-amber-400/50 hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 h-12 gap-2">
                      <Cpu className="w-4 h-4" />
                      Konsultasi dengan AI
                    </Button>
                  </a>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  {[
                    "Klien dari berbagai sektor jasa konstruksi di seluruh Indonesia",
                    "Legalitas, sertifikasi, dan dokumen proyek selesai tepat waktu",
                    "Didukung Gustafta AI — kecerdasan buatan khusus konstruksi Indonesia",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent font-bold text-sm mt-0.5 flex-shrink-0">✓</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                {/* ── SOLUSI UNTUK ── */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Solusi Untuk:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Kontraktor",    href: "/sbu",           active: true },
                      { label: "Biro Jasa",     href: "/layanan-ski",   active: false },
                      { label: "Konsultan ISO", href: "/iso-smk3",      active: false },
                      { label: "Portal SKK",    href: "/skk",           active: false },
                      { label: "Ekosistem",     href: "/ekosistem-kompetensi", active: false },
                    ].map((s, i) => (
                      <Link key={i} href={s.href}>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all ${s.active ? "bg-accent text-slate-900 border-accent" : "bg-white/10 text-slate-300 border-white/20 hover:bg-white/20 hover:text-white"}`}>
                          {s.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* ── Right column: Akses Cepat, pushed to bottom ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex flex-col justify-end gap-3"
          >
            {/* Akses Cepat Layanan */}
            <div className="bg-white/8 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/15 shadow-xl">
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                Akses Cepat Layanan
              </p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {quickAccessItems.map((item, idx) => (
                  <ScrollLink
                    key={idx}
                    to={item.to}
                    smooth={true}
                    offset={-120}
                    className="group flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/15 rounded-xl cursor-pointer transition-all border border-transparent hover:border-accent/30"
                  >
                    <div className="p-1.5 bg-accent/20 rounded-lg text-accent group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-white/80 font-medium group-hover:text-accent transition-colors text-[10px] text-center">{item.label}</span>
                  </ScrollLink>
                ))}
              </div>
              {/* Live ticker */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-emerald-300 text-xs"><strong>3 klien</strong> sedang proses SBU hari ini</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile quick access */}
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 overflow-x-auto">
          <div className="container flex gap-6 min-w-max px-6">
            {quickAccessItems.map((item, idx) => (
              <ScrollLink 
                key={idx}
                to={item.to}
                smooth={true}
                offset={-100}
                className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer opacity-80 hover:opacity-100"
              >
                <div className="p-3 bg-slate-100 rounded-full text-slate-700 shadow-sm">{item.icon}</div>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{item.label}</span>
              </ScrollLink>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JASA PT. SKI ─── */}
      <LandingSection title="Jasa PT. SKI — Pengelola Platform" subtitle="Layanan profesional di balik DokumenProyek.com" defaultOpen>
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs mb-4">
              <Building2 className="w-3.5 h-3.5" />
              PT. Sarana Kompetensi Indonesia (SKI)
            </div>
            <h2 className="mt-2 mb-4">Siapa di Balik Platform Ini?</h2>
            <p className="text-muted-foreground leading-relaxed">
              DokumenProyek.com dibangun dan dioperasikan oleh <strong>PT. Sarana Kompetensi Indonesia (SKI)</strong> — perusahaan jasa konsultasi konstruksi berpengalaman yang kini diperkuat teknologi AI Gustafta.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              {
                id: "sertifikasi",
                icon: Award,
                color: "amber",
                title: "Sertifikasi & Kompetensi",
                items: ["SBU LPJK — baru, perpanjang, naik kualifikasi", "SKK Konstruksi semua jenjang KKNI", "SBU & SKK ESDM / Migas / EBT", "Bimtek SKK & pendampingan uji BNSP"],
                tag: "Paling Dicari",
              },
              {
                id: "tender",
                icon: FileText,
                color: "orange",
                title: "Tender & Dokumen",
                items: ["Analisis & strategi tender AI 4-tahap", "Bedah dokumen RKS & RAB dalam 30 detik", "Konsultasi hukum kontrak konstruksi", "Monitoring peluang tender LPSE real-time"],
                tag: "Unggulan",
              },
              {
                id: "manajemen",
                icon: Shield,
                color: "blue",
                title: "ISO & SMAP",
                items: ["ISO 9001 — Sistem Manajemen Mutu", "ISO 37001 SMAP — wajib tender pemerintah", "ISO 45001 — K3 Konstruksi", "ISO 14001 — Manajemen Lingkungan"],
                tag: "Wajib BUJK",
              },
              {
                id: "keuangan",
                icon: DollarSign,
                color: "green",
                title: "Keuangan Proyek",
                items: ["Laporan keuangan proyek konstruksi", "Analisis kelayakan finansial tender", "Realisasi RAB vs aktual", "Simulasi arus kas proyek"],
                tag: null,
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              const colorMap: Record<string, { header: string; badge: string; check: string; border: string }> = {
                amber: { header: "from-amber-500 to-orange-500", badge: "bg-amber-100 text-amber-700", check: "text-amber-500", border: "border-amber-100 hover:border-amber-300" },
                orange: { header: "from-orange-500 to-red-500",  badge: "bg-orange-100 text-orange-700", check: "text-orange-500", border: "border-orange-100 hover:border-orange-300" },
                blue:   { header: "from-blue-500 to-indigo-600", badge: "bg-blue-100 text-blue-700",   check: "text-blue-500",   border: "border-blue-100 hover:border-blue-300" },
                green:  { header: "from-green-500 to-emerald-600", badge: "bg-green-100 text-green-700", check: "text-green-500", border: "border-green-100 hover:border-green-300" },
              };
              const c = colorMap[cat.color];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl border ${c.border} overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-white`}
                >
                  <Link href="/layanan-ski#layanan">
                    <div className={`bg-gradient-to-br ${c.header} p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {cat.tag && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${c.badge}`}>{cat.tag}</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-base leading-snug">{cat.title}</h3>
                    </div>
                  </Link>
                  <div className="p-4">
                    <ul className="space-y-1.5">
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className={`w-3.5 h-3.5 ${c.check} flex-shrink-0 mt-0.5`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/layanan-ski">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 h-12 gap-2">
                Lihat Semua Layanan SKI
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-slate-400 mt-3">
              Konsultasi gratis · Respons 1×24 jam kerja · +62 822-9941-7818
            </p>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── FAKTA PASAR ─── */}
      <LandingSection title="Fakta Pasar Konstruksi Indonesia" subtitle="Kondisi nyata industri 2024–2025" theme="dark" defaultOpen>
      <section className="py-14 bg-slate-900 border-y border-slate-800">
        <div className="container max-w-4xl">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest font-semibold mb-8">
            Kondisi Nyata Industri Konstruksi Indonesia 2024–2025
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: "Anggaran infrastruktur nasional terus meningkat",
                desc: "Pemerintah mengalokasikan porsi terbesar APBN untuk infrastruktur. PSN dan IKN terus bergulir — peluang nyata bagi BUJK yang siap secara dokumen dan legalitas.",
              },
              {
                title: "Pasar jasa konstruksi Indonesia sangat luas",
                desc: "Ratusan ribu badan usaha jasa konstruksi aktif di seluruh Indonesia. Persaingan semakin ketat — hanya BUJK dengan kelengkapan dokumen yang tampil kompetitif di pengadaan.",
              },
              {
                title: "Gugur administrasi masih jadi masalah utama",
                desc: "Mayoritas kegagalan tender bukan karena kalah teknis atau harga — melainkan dokumen administrasi tidak lengkap, SBU tidak sesuai subklasifikasi, atau SKK tenaga ahli sudah kedaluwarsa.",
              },
              {
                title: "Jutaan tenaga kerja konstruksi wajib ber-SKK",
                desc: "Regulasi mewajibkan seluruh tenaga ahli dan terampil di proyek memiliki SKK aktif. Banyak yang belum diperbarui karena tidak ada sistem monitoring yang efektif dan proaktif.",
              },
              {
                title: "Proses manual SBU memakan waktu sangat lama",
                desc: "Pengurusan SBU secara manual — bolak-balik ke asosiasi dan SIKI — bisa memakan waktu berbulan-bulan tanpa kepastian. Platform digital memangkas waktu ini secara drastis.",
              },
              {
                title: "Regulasi berubah masif dan berkesinambungan",
                desc: "Perpres 46/2025 (pengadaan), Permen PU 6/2025 (SBU), PP 28/2025 (OSS-RBA) terbit hampir bersamaan. BUJK yang tidak update langsung berisiko gugur administrasi.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── MASALAH PASAR ─── */}
      <LandingSection title="Mengapa BUJK Gagal di Urusan Dokumen?" subtitle="Masalah nyata di lapangan" defaultOpen>
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-red-500 font-bold tracking-wide uppercase text-sm">Masalah yang Terjadi di Lapangan</span>
            <h2 className="mt-2 mb-4">Mengapa Ribuan BUJK Gagal di Urusan Dokumen?</h2>
            <p className="text-muted-foreground leading-relaxed">Bukan karena tidak kompeten — tetapi karena regulasi yang terus berubah, proses yang tidak transparan, dan keterbatasan sumber daya manusia untuk urusan administrasi legal. Kami hadir untuk mengubah ini.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: AlertTriangle, color: "text-red-500 bg-red-50 border-red-100",
                title: "Gugur Administrasi di Tender",
                stat: "Penyebab Terbesar Kegagalan",
                desc: "Sebagian besar kegagalan tender bukan karena kalah teknis atau harga — melainkan kekurangan dokumen administrasi. SBU tidak sesuai subklasifikasi, SKK tenaga ahli masa berlaku habis, atau format surat penawaran tidak tepat.",
                tags: ["SBU Expired", "SKK Tidak Sesuai", "Format Salah"]
              },
              { 
                icon: Clock, color: "text-orange-500 bg-orange-50 border-orange-100",
                title: "Proses SBU Manual Memakan Waktu Berbulan-bulan",
                stat: "Berbulan-bulan Tanpa Kepastian",
                desc: "Pengurusan SBU secara manual — bolak-balik ke asosiasi, upload berkali-kali ke SIKI, menunggu verifikasi tanpa kepastian waktu — bisa memakan waktu sangat lama. Padahal tender menunggu.",
                tags: ["SIKI LPJK", "Asosiasi", "Verifikasi Lambat"]
              },
              { 
                icon: XCircle, color: "text-red-600 bg-red-50 border-red-100",
                title: "Sertifikat Kedaluwarsa Tanpa Disadari",
                stat: "Mayoritas Terlambat Perpanjang",
                desc: "Banyak SBU dan SKK tidak diperbarui tepat waktu karena tidak ada sistem reminder yang andal. Perusahaan baru sadar ketika sudah ikut tender atau saat audit klien.",
                tags: ["SBU Habis", "SKK Expired", "ISO Lapse"]
              },
              { 
                icon: Search, color: "text-amber-500 bg-amber-50 border-amber-100",
                title: "Tidak Paham Regulasi yang Terus Berubah",
                stat: "Perubahan Masif & Serempak",
                desc: "Sejak 2024–2025: Perpres 46/2025 (pengadaan), Permen PU 6/2025 (SBU), PP 28/2025 (OSS-RBA), SK Dirjen 114/2024 (SKK) — semua berubah. Banyak perusahaan masih menggunakan panduan lama yang sudah tidak berlaku.",
                tags: ["Perpres 46/2025", "Permen PU 6/2025", "PP 28/2025"]
              },
              { 
                icon: FolderOpen, color: "text-slate-500 bg-slate-50 border-slate-100",
                title: "Proyek Berjalan Tanpa Dokumen Kontrol",
                stat: "Risiko sengketa tinggi",
                desc: "Banyak proyek tidak punya submittal register, RFI log, atau NCR yang rapi. Saat ada klaim, addendum, atau dispute — tidak ada dokumentasi yang kuat. Ini menjadi risiko hukum serius.",
                tags: ["Klaim Tanpa Bukti", "Sengketa Kontrak", "Close-Out Gagal"]
              },
              { 
                icon: Users, color: "text-blue-500 bg-blue-50 border-blue-100",
                title: "Koordinasi Klien–Konsultan Tidak Efisien",
                stat: "Bolak-balik Berminggu-minggu",
                desc: "Tanpa sistem digital terintegrasi, koordinasi terjadi via WhatsApp dan email yang tidak terstruktur. Dokumen hilang, revisi tidak terlacak, dan timeline molor jauh dari target awal.",
                tags: ["WhatsApp Chaos", "Revisi Tidak Terlacak", "Molor Timeline"]
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl border ${item.color.split(' ').slice(2).join(' ')} hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${item.color.split(' ').slice(0, 2).join(' ')}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 leading-snug">{item.title}</h4>
                      <span className="text-xs font-bold text-red-500">{item.stat}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((t, ti) => (
                      <span key={ti} className="text-[10px] bg-white/80 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── SOLUSI ─── */}
      <LandingSection title="Satu Platform, Semua Kebutuhan Dokumen" subtitle="Layanan inti DokumenProyek.com" defaultOpen>
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/40">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-accent font-bold tracking-wide uppercase text-sm">Solusi Terintegrasi</span>
            <h2 className="mt-2 mb-4">Satu Platform, Semua Kebutuhan Dokumen Usaha Konstruksi</h2>
            <p className="text-muted-foreground leading-relaxed">Kami menggabungkan tim konsultan berpengalaman, teknologi AI generatif, dan sistem otomasi berbasis regulasi Indonesia — bukan sekadar jasa pengurusan biasa.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                color: "from-blue-600 to-indigo-700",
                tag: "Fondasi Usaha",
                title: "Legalitas & Perizinan",
                desc: "Pendirian badan usaha hingga izin operasional sektoral. Kami kenali KBLI yang tepat, alur OSS-RBA, dan persyaratan SIUJK — sehingga proses lebih cepat dan tidak bolak-balik.",
                items: [
                  "Pendirian PT/CV/Firma via Notaris & AHU",
                  "NIB OSS-RBA + KBLI Konstruksi yang Tepat",
                  "SIUJK/IUJK Konstruksi via Dinas PU",
                  "Izin Lingkungan, AMDAL, & Dokumen K3",
                ],
                highlight: "Proses Cepat & Terjadwal Jelas"
              },
              {
                icon: Award,
                color: "from-amber-500 to-orange-600",
                tag: "Sertifikasi Wajib",
                title: "SBU, SKK & ISO",
                desc: "Sertifikasi yang menentukan nilai tender Anda. SBUClaw AI bantu analisis kelayakan, siapkan dokumen, dan pantau progres real-time hingga sertifikat terbit.",
                items: [
                  "SBU Kontraktor & Konsultan (semua sub)",
                  "SKK Tenaga Ahli & Terampil + Uji BNSP",
                  "Bimtek SKK — modul latihan & AI Tutor",
                  "ISO 9001 / 14001 / 45001 & SMK3",
                ],
                highlight: "SBUClaw AI — analisis 4 tahap"
              },
              {
                icon: FileText,
                color: "from-green-500 to-emerald-700",
                tag: "Tender Intelligence",
                title: "Tender Desk + TenderaClaw",
                desc: "TenderaClaw AI pipeline 4 tahap: evaluasi kelayakan → strategi → draft dokumen. Ditambah monitoring otomatis peluang tender baru via MultiClaw.",
                items: [
                  "TenderaClaw: Go/No-Go → Strategi → Draft",
                  "Compliance Matrix per paket tender",
                  "MultiClaw Tender Monitor — LPSE real-time",
                  "Post-Mortem & analisis tender yang gagal",
                ],
                highlight: "Tingkat Lolos Admin Sangat Tinggi"
              },
              {
                icon: ClipboardList,
                color: "from-purple-500 to-violet-700",
                tag: "Dokumen Proyek",
                title: "Project Doc Control",
                desc: "Administrasi proyek rapi sejak kontrak hingga serah terima. Workroom AI bantu tim bekerja terstruktur dengan gerbang persetujuan human-in-the-loop.",
                items: [
                  "Kontrak, Addendum & Perubahan Lingkup",
                  "Workroom — ruang kolaborasi berstruktur",
                  "Berita Acara, Laporan & Submittal Register",
                  "AI Dokumen — tanya jawab isi kontrak/spek",
                ],
                highlight: "Risiko Dispute Jauh Lebih Rendah"
              },
              {
                icon: Bot,
                color: "from-rose-500 to-pink-700",
                tag: "Gustafta AI Intelligence",
                title: "MultiClaw & LexCom",
                desc: "Sistem monitoring multi-agen dan konsultasi hukum konstruksi berbasis AI. MultiClaw jalankan 4 tim agen spesialis secara mandiri; LexCom tangani FIDIC, Perpres, dan UUJK.",
                items: [
                  "MultiClaw: monitoring SBU/SKK/BUJK/Tender",
                  "LexCom Hukum — AI legal konstruksi",
                  "Freelance Board BUJK & SKK",
                  "Brain Project — dashboard intelijen proyek",
                ],
                highlight: "Agen Otonom Aktif Non-Stop"
              },
              {
                icon: GraduationCap,
                color: "from-teal-500 to-cyan-700",
                tag: "Kompetensi & Training",
                title: "Kompetensi Hub + ASKOM",
                desc: "Ekosistem pengembangan kompetensi konstruksi: analisis gap, roadmap SKK, mock asesmen BNSP, hingga pendampingan asesor oleh ASKOM Coach AI.",
                items: [
                  "KompetensiHub — gap analysis & roadmap SKK",
                  "Mock Asesmen BNSP dengan AI feedback",
                  "ASKOM Coach — panduan asesor konstruksi",
                  "Klinik Konsultasi — tanya jawab proyek",
                ],
                highlight: "Siap uji BNSP dalam 30 hari"
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-br ${card.color} p-6`}>
                    <Badge className="bg-white/20 text-white border-0 text-xs mb-4">{card.tag}</Badge>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight">{card.title}</h3>
                    <p className="text-white/80 text-sm mt-1.5 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-2 mb-4">
                      {card.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-accent">{card.highlight}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── CARA KERJA ─── */}
      <LandingSection title="Cara Kerja — 7 Langkah" subtitle="Dari konsultasi ke dokumen selesai">
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-accent font-bold tracking-wide uppercase text-sm">Cara Kerja</span>
            <h2 className="mt-2 mb-4">7 Langkah — Dari Konsultasi ke Dokumen Selesai</h2>
            <p className="text-muted-foreground">Proses yang biasanya tidak transparan dan penuh ketidakpastian kini dapat dipantau real-time oleh Anda.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-24" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { step: "01", icon: Search, title: "Konsultasi & Intent", desc: "AI mendeteksi kebutuhan Anda via chat atau form — tanpa perlu mengisi banyak formulir manual", color: "bg-blue-500", ai: true },
                { step: "02", icon: Scan, title: "Smart Eligibility", desc: "Sistem scoring otomatis menilai kesiapan dokumen & menentukan layanan yang relevan", color: "bg-indigo-500", ai: true },
                { step: "03", icon: FolderOpen, title: "Upload Dokumen", desc: "Upload via drag-and-drop atau WhatsApp. AI ekstrak data dan deteksi dokumen yang kurang", color: "bg-violet-500", ai: true },
                { step: "04", icon: Brain, title: "AI Review & Gap", desc: "OCR + analisis AI mendeteksi data tidak sinkron, masa berlaku habis, dan potensi red flag", color: "bg-purple-600", ai: true },
                { step: "05", icon: Users, title: "Tim Mendampingi", desc: "Konsultan spesialis kami proses dokumen, koordinasi dengan lembaga, dan update Anda secara proaktif", color: "bg-amber-500", ai: false },
                { step: "06", icon: Activity, title: "Track Real-Time", desc: "Portal client — pantau status, download draft, dan tanda tangani persetujuan secara digital", color: "bg-orange-500", ai: false },
                { step: "07", icon: Bell, title: "Terima + Radar", desc: "Dokumen terbit. Sistem Deadline Radar aktif — reminder renewal otomatis sebelum kedaluwarsa", color: "bg-green-500", ai: true },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div className={`w-[52px] h-[52px] rounded-full ${item.color} flex items-center justify-center mb-3 shadow-lg z-10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-400">{item.step}</span>
                      {item.ai && <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] px-1 py-0 h-3.5">AI</Badge>}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              Langkah ber-label <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] px-1 py-0 h-3.5 mx-1">AI</Badge> dijalankan otomatis oleh OpenClaw — tidak perlu menunggu staf
            </div>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── SERVICES ─── */}
      <LandingSection title="Ekosistem Layanan Konstruksi" subtitle="6 layanan inti + konsultasi">
      <section id="ekosistem" className="section bg-slate-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent font-bold tracking-wide uppercase text-sm">6 Layanan Inti</span>
            <h2 className="mt-2 mb-6">Jasa & Konsultasi Dokumen Usaha Konstruksi</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              End-to-end dari legalitas pendirian perusahaan, perizinan sektoral, sertifikasi kompetensi, sistem manajemen, hingga dokumen tender dan proyek — semuanya dalam satu ekosistem.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <Skeleton key={idx} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod) => {
                const anchorToPath: Record<string, string> = {
                  "mod-legalitas": "/legalitas",
                  "mod-perizinan": "/oss-rba",
                  "mod-sbu": "/sbu",
                  "mod-skk": "/skk",
                  "mod-tender": "/tender-generator",
                  "mod-proyek": "/proyek",
                };
                const pagePath = mod.anchorId ? anchorToPath[mod.anchorId] : undefined;
                return (
                  <div key={mod.id} id={mod.anchorId || undefined} className="group">
                    <FeatureCard 
                      featured={mod.type === "featured"}
                      type={mod.type === "safety" ? "safety" : mod.type === "circular" ? "circular" : "default"}
                      featuredLabel={mod.featuredLabel || undefined}
                      icon={getIcon(mod.icon)}
                      title={mod.title}
                      description={mod.description}
                      features={mod.features}
                    />
                    {pagePath && (
                      <div className="mt-2 px-1">
                        <Link href={pagePath}>
                          <button className="w-full text-xs text-primary font-semibold py-2 px-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all flex items-center justify-center gap-1.5" data-testid={`button-explore-${mod.anchorId}`}>
                            Buka Tools & Info Interaktif <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sertifikasi Sistem Manajemen */}
          <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <Badge className="bg-amber-500 text-slate-900 mb-3">Sertifikasi Sistem Manajemen</Badge>
              <h3 className="text-white text-xl font-bold">ISO & SMK3 — Meningkatkan Nilai Tender dan Kredibilitas</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
                Semakin banyak BUMN, BHMN, dan swasta besar yang mensyaratkan ISO dalam kualifikasi tender. SMK3 wajib per PP 50/2012 bagi perusahaan dengan risiko tinggi. Kami bantu dari gap analysis hingga sertifikat terbit.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  icon: Shield, label: "ISO 9001:2015", desc: "Sistem Manajemen Mutu",
                  detail: "Paling banyak disyaratkan tender BUMN & swasta. Meningkatkan nilai evaluasi teknis hingga 15 poin.",
                  tag: "Paling Diminati"
                },
                { 
                  icon: Leaf, label: "ISO 14001:2015", desc: "Sistem Manajemen Lingkungan",
                  detail: "Wajib untuk proyek yang membutuhkan izin lingkungan atau AMDAL. Dipersyaratkan proyek hijau & EPC.",
                  tag: "Proyek Hijau"
                },
                { 
                  icon: HardHat, label: "ISO 45001 / SMK3", desc: "Sistem Manajemen K3",
                  detail: "SMK3 wajib PP 50/2012 untuk usaha berisiko tinggi. ISO 45001 menggantikan OHSAS 18001 secara internasional.",
                  tag: "Wajib Risiko Tinggi"
                },
                { 
                  icon: ShieldCheck, label: "ISO 37001:2016", desc: "Anti-Penyuapan (SMAP)",
                  detail: "Makin disyaratkan oleh BUMN dan lembaga internasional. Meningkatkan kepercayaan & akses pembiayaan.",
                  tag: "Good Governance"
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <Badge className="bg-white/10 text-slate-300 border-0 text-[10px]">{item.tag}</Badge>
                    </div>
                    <div>
                      <p className="text-white font-bold">{item.label}</p>
                      <p className="text-amber-400/80 text-xs">{item.desc}</p>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed border-t border-white/10 pt-3">{item.detail}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {[
                "Proses sertifikasi ISO didampingi konsultan berpengalaman dari awal hingga audit selesai",
                "Klien yang mengikuti proses kami memiliki persiapan dokumen yang matang sebelum audit",
                "Sertifikat ISO meningkatkan nilai evaluasi teknis secara nyata di pengadaan pemerintah",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <p className="text-slate-400 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── FITUR UNGGULAN ─── */}
      <LandingSection title="Teknologi yang Membuat Kami Berbeda" subtitle="Fitur unggulan platform">
      <section id="eligibility" className="py-20 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-accent font-bold tracking-wide uppercase text-sm">Fitur Unggulan Platform</span>
            <h2 className="mt-2 mb-4">Teknologi yang Membuat Kami Berbeda</h2>
            <p className="text-muted-foreground leading-relaxed">DokumenProyek.com bukan sekadar jasa pengurusan — kami adalah sistem operasi compliance dan dokumen usaha Anda, ditenagai AI generatif terdepan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              {
                icon: Search,
                color: "bg-blue-600",
                title: "Smart Eligibility Checker",
                badge: "Coba Gratis",
                badgeColor: "bg-blue-100 text-blue-700",
                desc: "Jawab 8–12 pertanyaan singkat tentang profil perusahaan Anda. Sistem AI kami akan menilai kesiapan dokumen (scoring 0–100), merekomendasikan layanan yang relevan, memperkirakan biaya dan waktu proses, serta mengidentifikasi dokumen yang kurang.",
                highlights: [
                  "Scoring kesiapan dokumen 0–100",
                  "Rekomendasi layanan otomatis",
                  "Estimasi biaya & timeline",
                  "Identifikasi gap dokumen"
                ]
              },
              {
                icon: ClipboardList,
                color: "bg-indigo-600",
                title: "Dynamic Checklist Engine",
                badge: "AI-Powered",
                badgeColor: "bg-indigo-100 text-indigo-700",
                desc: "Checklist bukan lagi dokumen statis. Sistem kami membangun checklist dinamis berdasarkan: jenis badan usaha (PT/CV/perseorangan), KBLI, klasifikasi & kualifikasi SBU, nilai tender (Kecil/Menengah/Besar), dan lokasi proyek. Regulasi berubah — checklist ikut berubah otomatis.",
                highlights: [
                  "Adaptif per KBLI & klasifikasi",
                  "Update otomatis saat regulasi berubah",
                  "Checklist tender spesifik per paket",
                  "Export ke PDF & Excel"
                ]
              },
              {
                icon: Brain,
                color: "bg-amber-500",
                title: "AI Document Review",
                badge: "OpenClaw OCR",
                badgeColor: "bg-amber-100 text-amber-700",
                desc: "Upload dokumen dalam format apapun — PDF, foto KTP, scan akta. AI kami melakukan: (1) OCR ekstraksi teks, (2) validasi cross-check antar dokumen, (3) deteksi masa berlaku habis, (4) identifikasi ketidaksesuaian data, dan (5) red flag compliance tender. Tidak perlu cek manual satu per satu.",
                highlights: [
                  "OCR multi-format (PDF, JPG, PNG)",
                  "Cross-validation antar dokumen",
                  "Deteksi expiry date otomatis",
                  "Red flag compliance tender"
                ]
              },
              {
                icon: Activity,
                color: "bg-green-600",
                title: "Case Tracker Real-Time",
                badge: "Live Status",
                badgeColor: "bg-green-100 text-green-700",
                desc: "Setiap case punya timeline visual yang jelas — dari lead masuk, pengumpulan dokumen, verifikasi tim, proses di lembaga (LPJK/BNSP/BSN), hingga serah terima. Klien menerima notifikasi otomatis di setiap milestone. Tidak ada lagi tanya 'Sudah sampai mana?'",
                highlights: [
                  "Timeline visual per milestone",
                  "Notifikasi WhatsApp & email",
                  "Upload & approve dokumen digital",
                  "Riwayat komunikasi tersimpan"
                ]
              },
              {
                icon: Bell,
                color: "bg-orange-500",
                title: "Deadline & Renewal Radar",
                badge: "Auto-Remind",
                badgeColor: "bg-orange-100 text-orange-700",
                desc: "Sistem secara aktif memantau masa berlaku SBU, SKK, ISO, SIUJK, NPWP, dan dokumen legal lainnya. Reminder dikirim via email dan WhatsApp pada H-90, H-60, dan H-30. Perpanjangan bisa langsung diinisiasi dari notifikasi — satu klik, proses dimulai.",
                highlights: [
                  "Monitoring semua dokumen & sertifikat",
                  "Reminder H-90, H-60, H-30",
                  "Inisiasi perpanjangan dari notifikasi",
                  "Dashboard kalender compliance"
                ]
              },
              {
                icon: FileCheck,
                color: "bg-purple-600",
                title: "Tender Intelligence Center",
                badge: "Premium",
                badgeColor: "bg-purple-100 text-purple-700",
                desc: "Analisis komprehensif sebelum Anda memutuskan ikut tender. Meliputi: Go/No-Go scoring (7 dimensi), compliance matrix builder, evaluasi sistem gugur/nilai/EBLUP, cek TKDN, panduan LPSE/SPSE, dan checklist final submission berbasis Perpres 46/2025.",
                highlights: [
                  "Go/No-Go scoring 7 dimensi",
                  "Panduan daftar & pakai LPSE/SPSE",
                  "TKDN checker & surat dukungan bank",
                  "Evaluasi sistem gugur, nilai & EBLUP"
                ]
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={`text-xs ${feat.badgeColor} border-0`}>{feat.badge}</Badge>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mb-2">{feat.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{feat.desc}</p>
                  <ul className="space-y-1.5">
                    {feat.highlights.map((h, hi) => (
                      <li key={hi} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckSquare className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── GUSTAFTA AI VISUAL ─── */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Teks kiri */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Platform Intelligence — Gustafta AI
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-extrabold leading-tight">
                Satu Platform. <span className="text-amber-400">Dua Kekuatan.</span>
                <br />Konstruksi & Legalitas.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Gustafta AI adalah sistem kecerdasan buatan yang dirancang khusus untuk ekosistem jasa konstruksi Indonesia. Dibangun di atas OpenAI Agents SDK, Gustafta mengintegrasikan regulasi, sertifikasi, dokumen proyek, dan hukum konstruksi dalam satu platform yang cerdas dan terintegrasi.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "AI Cerdas",              desc: "Analisis cepat & akurat berbasis regulasi terkini" },
                  { label: "Legalitas Terjamin",      desc: "Sesuai Permen PU, Perpres, OSS-RBA Indonesia" },
                  { label: "Konstruksi Terintegrasi", desc: "Dari perencanaan hingga close-out proyek" },
                  { label: "Data & Insight",          desc: "Keputusan lebih tepat berdasarkan data nyata" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white text-xs font-bold mb-1">{item.label}</p>
                    <p className="text-slate-400 text-[11px] leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/agent-hub">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 h-11">
                  <Cpu className="w-4 h-4 mr-2" />
                  Jelajahi Gustafta AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Carousel kanan — gambar + video bergantian */}
            <MediaCarousel />
          </div>
        </div>
      </section>

      {/* ─── OPENCLAW AI ENGINE ─── */}
      <LandingSection title="OpenClaw AI Engine" subtitle="Gustafta intelligence layer" theme="dark">
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-7"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  OpenClaw Agentic AI — Built on OpenAI Agents SDK
                </div>
                <h2 className="text-white text-3xl md:text-4xl font-extrabold leading-tight">
                  Bukan Chatbot Biasa — Ini <span className="text-amber-400">Sistem Agentic AI</span> untuk Dokumen Usaha
                </h2>
              </div>
              <p className="text-slate-400 text-base leading-relaxed">
                OpenClaw dibangun di atas <strong className="text-white">OpenAI Agents SDK</strong> dengan model <strong className="text-white">GPT-4o</strong>. Setiap permintaan Anda dianalisis oleh <strong className="text-amber-400">Orchestrator</strong> menggunakan intent classification, lalu tugas dipecah dan didelegasikan ke agen spesialis yang tepat melalui <strong className="text-white">tool calling & handoff</strong>. Hasilnya dikompilasi dan dikembalikan dalam format yang terstruktur.
              </p>
              
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Teknologi Inti</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { icon: Brain, title: "GPT-4o Model", desc: "Model terbaru OpenAI untuk reasoning kompleks" },
                    { icon: Network, title: "Agents SDK", desc: "Orchestrator + tool calling + handoff natively" },
                    { icon: Database, title: "RAG Pipeline", desc: "Knowledge base regulasi Indonesia ter-update" },
                    { icon: Scan, title: "Document OCR", desc: "Ekstraksi & validasi data dari dokumen scan" },
                    { icon: Layers, title: "Context Memory", desc: "Agen mengingat konteks percakapan & data klien" },
                    { icon: GitBranch, title: "Parallel Execution", desc: "Beberapa agen bekerja bersamaan, lebih cepat" },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-2.5 bg-slate-800/50 rounded-lg p-2.5">
                        <Icon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white text-xs font-semibold">{item.title}</p>
                          <p className="text-slate-500 text-[10px] leading-tight">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Network, title: "Orchestrator", desc: "Routing & task decomposition" },
                  { icon: Building2, title: "Agen Legalitas", desc: "NIB, OSS, KBLI, AHU, PT/CV" },
                  { icon: ShieldCheck, title: "Agen Perizinan", desc: "SIUJK, IUJK, izin sektoral" },
                  { icon: Award, title: "Agen SBU", desc: "SBU LPJK, grading, renewal" },
                  { icon: GraduationCap, title: "Agen SKK", desc: "Tenaga Ahli, Terampil, LSP/BNSP" },
                  { icon: Shield, title: "Agen ISO/SMK3", desc: "Gap analysis, implementasi" },
                  { icon: FileText, title: "Agen Tender", desc: "Go/No-Go, compliance matrix" },
                  { icon: FolderOpen, title: "Agen Proyek", desc: "Kontrak, laporan, close-out" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5 hover:bg-slate-800/70 transition-colors">
                      <div className="p-1.5 bg-amber-500/10 rounded-lg flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{item.title}</p>
                        <p className="text-slate-500 text-[10px]">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/agent-hub">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 h-11 shadow-lg shadow-amber-900/30" data-testid="button-open-agent-hub">
                  <Cpu className="w-4 h-4 mr-2" />
                  Buka Agent Hub OpenClaw
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400 font-mono">OpenClaw Agent Hub — Live Demo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400">8 Active</span>
                  </div>
                </div>
                
                <div className="p-5 space-y-4 text-sm font-mono">
                  {/* User */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-xs leading-relaxed">
                      Kami kontraktor Gred Kecil, mau naik ke Gred Menengah dan tambah ISO 9001. Bisa bantu?
                    </div>
                  </div>
                  
                  {/* Orchestrator */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
                      <Network className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Orchestrator</p>
                      <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] text-slate-300 text-xs leading-relaxed">
                        Terdeteksi: upgrade SBU + sertifikasi ISO 9001. Mendelegasikan ke Agen SBU dan Agen ISO&SMK3 secara paralel...
                      </div>
                    </div>
                  </div>
                  
                  {/* SBU Agent */}
                  <div className="flex items-start gap-2.5 ml-5">
                    <div className="w-6 h-6 rounded-lg bg-amber-900 border border-amber-700 flex items-center justify-center flex-shrink-0">
                      <Award className="w-3 h-3 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-500 mb-1">Agen SBU</p>
                      <div className="bg-amber-900/30 border border-amber-800/50 rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[85%] text-xs text-amber-200 leading-relaxed">
                        <p className="font-bold mb-1">Upgrade SBU Kontraktor → Gred Menengah (M1):</p>
                        ✓ Modal disetor min. Rp 750 juta<br/>
                        ✓ Laporan keuangan 2 tahun (diaudit KAP)<br/>
                        ✓ Min. 3 tenaga ahli ber-SKK Madya<br/>
                        ✓ Pengalaman proyek min. Rp 500 juta<br/>
                        ✓ Rekening koran 3 bulan terakhir<br/>
                        <span className="text-amber-400 font-semibold">Estimasi: 3–4 minggu, mulai Rp 3,5 juta</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ISO Agent */}
                  <div className="flex items-start gap-2.5 ml-5">
                    <div className="w-6 h-6 rounded-lg bg-green-900 border border-green-700 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-500 mb-1">Agen ISO & SMK3</p>
                      <div className="bg-green-900/25 border border-green-800/40 rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[85%] text-xs text-green-200 leading-relaxed">
                        <p className="font-bold mb-1">Gap Analysis ISO 9001 — Estimasi Awal:</p>
                        📋 14 klausul perlu diverifikasi<br/>
                        ⚠️ Klausul 8 (Operasi) butuh perhatian khusus<br/>
                        🗓️ Timeline: Gap Analysis 2-3 mgg → Penyusunan Dok 4-6 mgg → Implementasi 6-8 mgg<br/>
                        <span className="text-green-400 font-semibold">Total estimasi: 4–6 bulan, mulai dari gap analysis</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 pl-2 border-t border-slate-800 pt-3">
                    <Zap className="w-3 h-3 text-amber-500" />
                    OpenAI Agents SDK • GPT-4o • Parallel Tool Calling • RAG Regulasi Indonesia
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── SEGMENTASI MULTI-SEKTOR & BUNDLING PAKET ─── */}
      <LandingSection title="Platform Multi-Sektor & Bundling Paket" subtitle="Bukan hanya konstruksi">
      <section id="multi-sektor" className="py-20 bg-white">
        <div className="container">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-4">
              <Globe className="w-4 h-4" />
              Segmentasi Pasar Multi-Sektor & Paket Layanan
            </div>
            <h2 className="mt-1 mb-4">Platform Ini Bukan Hanya untuk Konstruksi</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Kebutuhan sertifikasi, legalitas, tender, dan compliance ada di setiap sektor industri berbasis keteknikan. Kami melayani 6 sektor utama — dengan domain knowledge spesifik per sektor.
            </p>
          </div>

          {/* 6 Sektor Industri */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {[
              {
                icon: HardHat, color: "bg-blue-600", textColor: "text-blue-600", bgLight: "bg-blue-50 border-blue-100",
                badge: "PRIORITAS UTAMA", badgeColor: "bg-blue-600 text-white",
                sector: "Jasa Konstruksi",
                sub: ["Pelaksana Jasa Konstruksi (Kontraktor)", "Jasa Konsultansi Konstruksi (Perencana/Pengawas)", "Rantai Pasok & Subkontraktor Spesialis"],
                docs: ["SBU LPJK — K1/K2/K3/Menengah/Besar", "SKK Tenaga Ahli & Terampil", "ISO 9001, ISO 45001, SMK3"],
                stat: "Ratusan ribu BUJK aktif di Indonesia",
              },
              {
                icon: Zap, color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-50 border-amber-100",
                badge: "HIGH GROWTH", badgeColor: "bg-amber-500 text-white",
                sector: "Ketenagalistrikan",
                sub: ["Kontraktor Instalasi Listrik", "Konsultan Teknik Listrik", "Vendor Panel, Kabel, Proteksi & Instrumen"],
                docs: ["SBU sektor ketenagalistrikan", "Sertifikasi kompetensi teknisi listrik", "ISO 9001, ISO 14001"],
                stat: "Pasar EPC kelistrikan bernilai sangat besar",
              },
              {
                icon: Leaf, color: "bg-emerald-600", textColor: "text-emerald-600", bgLight: "bg-emerald-50 border-emerald-100",
                badge: "GROWING FAST", badgeColor: "bg-emerald-600 text-white",
                sector: "Energi Baru Terbarukan (EBT)",
                sub: ["EPC Renewable Energy (PLTS, Bioenergi, Mikrohidro)", "Instalator Sistem Energi Terbarukan", "Konsultan Energi & Efisiensi Energi"],
                docs: ["Sertifikasi usaha sektor EBT", "Kompetensi teknisi & engineer EBT", "ISO 50001 — Manajemen Energi"],
                stat: "Target 23% EBT 2025 — peluang besar",
              },
              {
                icon: Database, color: "bg-stone-600", textColor: "text-stone-600", bgLight: "bg-stone-50 border-stone-100",
                badge: "COMPLIANCE INTENSIVE", badgeColor: "bg-stone-600 text-white",
                sector: "Mineral & Pertambangan",
                sub: ["Kontraktor Pertambangan", "Jasa Penunjang Tambang", "Vendor Alat Berat, Material & Rekayasa"],
                docs: ["Sertifikasi kelayakan penyedia jasa tambang", "Kompetensi personel operasional & teknis", "SMK3, ISO 14001 — wajib sektor tambang"],
                stat: "Regulasi tambang → vendor approval ketat",
              },
              {
                icon: Recycle, color: "bg-teal-600", textColor: "text-teal-600", bgLight: "bg-teal-50 border-teal-100",
                badge: "REGULASI KETAT", badgeColor: "bg-teal-600 text-white",
                sector: "Lingkungan",
                sub: ["Konsultan Lingkungan (AMDAL, UKL-UPL)", "Laboratorium Lingkungan", "Kontraktor Pengendalian Lingkungan"],
                docs: ["Sertifikasi kompetensi tenaga lingkungan", "ISO 14001 — Manajemen Lingkungan", "Kepatuhan dokumen lingkungan hidup"],
                stat: "Syarat lingkungan di semua proyek besar",
              },
              {
                icon: Briefcase, color: "bg-violet-600", textColor: "text-violet-600", bgLight: "bg-violet-50 border-violet-100",
                badge: "ENGINEERING SERVICES", badgeColor: "bg-violet-600 text-white",
                sector: "Engineering Related Services",
                sub: ["Inspeksi, Pengujian & Commissioning", "HSE / Safety Engineering", "QS / Cost Engineering & Document Control"],
                docs: ["Sertifikasi kompetensi personel teknis", "Sertifikasi badan usaha sesuai sektor", "ISO 9001, ISO 45001"],
                stat: "Backbone setiap proyek besar nasional",
              },
            ].map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  viewport={{ once: true }}
                  className={`border ${sec.bgLight} rounded-2xl p-5 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${sec.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge className={`text-[10px] h-5 border-0 ${sec.badgeColor}`}>{sec.badge}</Badge>
                  </div>
                  <h4 className={`font-bold text-base mb-2 ${sec.textColor}`}>{sec.sector}</h4>
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">Segmen:</p>
                    {sec.sub.map((s, i) => (
                      <div key={i} className="flex items-start gap-1 text-[11px] text-slate-600">
                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">Layanan kami:</p>
                    {sec.docs.map((d, i) => (
                      <div key={i} className="flex items-start gap-1 text-[11px] text-slate-600">
                        <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-accent" />
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className={`text-[10px] font-semibold ${sec.textColor} mt-2 pt-2 border-t border-current/10`}>
                    {sec.stat}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 3 Pilar Sertifikasi */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-14">
            <div className="text-center mb-8">
              <Badge className="bg-slate-800 text-white border-0 mb-3">3 Pilar Domain Sertifikasi</Badge>
              <h3 className="text-slate-800 font-bold text-xl">Sertifikasi Bukan Sekedar Menu — Ini adalah Mesin Layanan Terstruktur</h3>
              <p className="text-slate-500 text-sm mt-2">Domain sertifikasi dibangun bertingkat: Sector → Family → Scheme → Classification → Requirements → Workflow</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Building2, color: "from-blue-600 to-indigo-700", border: "border-blue-100",
                  title: "Sertifikasi Badan Usaha",
                  sub: "SBU, SBUJK, Sertifikasi Usaha Sektoral",
                  items: [
                    "Klasifikasi & subklasifikasi badan usaha",
                    "Kualifikasi: Kecil 1 (K1), Kecil 2 (K2), Kecil 3 (K3), Menengah (M), Besar (B)",
                    "Persyaratan personel inti / PJT & peralatan",
                    "Renewal, upgrade & perubahan subklasifikasi",
                    "Integrasi data SIKI LPJK real-time",
                  ],
                  example: "SBU Kontraktor (Sipil, ME, Arsitektur) | SBU Konsultan (Perencana, Pengawas)",
                },
                {
                  icon: GraduationCap, color: "from-purple-600 to-violet-700", border: "border-purple-100",
                  title: "Sertifikasi Kompetensi Kerja",
                  sub: "SKK — Tenaga Ahli & Tenaga Terampil",
                  items: [
                    "Jabatan kerja & jenjang (Junior, Madya, Utama)",
                    "Unit kompetensi sesuai SKKNI per bidang",
                    "Persyaratan pendidikan, pengalaman & portofolio",
                    "Asesmen, uji kompetensi LSP/BNSP",
                    "Resertifikasi & pengembangan kompetensi berkelanjutan",
                  ],
                  example: "SKK Sipil, Arsitektur, ME | SKK Ketenagalistrikan | SKK EBT",
                },
                {
                  icon: ShieldCheck, color: "from-emerald-600 to-teal-700", border: "border-emerald-100",
                  title: "Sertifikasi Manajemen Usaha",
                  sub: "ISO Global + Standar Nasional Indonesia",
                  items: [
                    "ISO 9001 (Mutu), ISO 14001 (Lingkungan), ISO 45001 (K3)",
                    "ISO 37001 (Anti-Suap), ISO 50001 (Energi)",
                    "SMK3 — Sistem Manajemen K3 (PP 50/2012)",
                    "Gap analysis, implementasi dokumen sistem",
                    "Audit readiness, surveillance & resertifikasi",
                  ],
                  example: "Wajib untuk proyek BUMN | Nilai tambah tender pemerintah",
                },
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className={`bg-white border ${pillar.border} rounded-xl overflow-hidden`}>
                    <div className={`bg-gradient-to-br ${pillar.color} p-5`}>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-white font-bold text-base">{pillar.title}</h4>
                      <p className="text-white/70 text-xs mt-1">{pillar.sub}</p>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2 mb-4">
                        {pillar.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-600">Contoh: </span>{pillar.example}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bundling Paket */}
          <div>
            <h3 className="text-slate-800 font-bold text-xl text-center mb-2">Paket Bundling — Solusi Lengkap, Lebih Efisien</h3>
            <p className="text-center text-slate-500 text-sm mb-8">Paket bundling dirancang untuk kebutuhan nyata di lapangan — mengombinasikan layanan yang saling terkait dalam satu alur pendampingan</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Building2, gradient: "from-blue-600 to-indigo-700",
                  name: "Startup Contractor", label: "BUJK BARU",
                  desc: "Untuk perusahaan konstruksi baru yang ingin segera aktif & bisa ikut tender daerah",
                  includes: ["Pendirian PT & NIB OSS", "SBU Kontraktor K1 (s.d. Rp 2M)", "2 SKK Tenaga Ahli", "Perizinan SIUJK dasar"],
                  timeline: "Estimasi 6–10 minggu",
                  badge: "Most Popular",
                },
                {
                  icon: FileText, gradient: "from-orange-500 to-amber-600",
                  name: "Tender Ready", label: "IKUT TENDER",
                  desc: "Untuk perusahaan yang sudah ada tapi dokumen belum siap untuk ikut tender pemerintah/BUMN",
                  includes: ["Review & upgrade SBU", "Review dokumen tender", "Compliance matrix builder", "Go/No-Go analysis"],
                  timeline: "Estimasi 2–4 minggu",
                  badge: "Best Value",
                },
                {
                  icon: ShieldCheck, gradient: "from-emerald-600 to-teal-700",
                  name: "ISO & Compliance", label: "NAIK KELAS",
                  desc: "Untuk perusahaan yang ingin masuk proyek BUMN atau naik kualifikasi tender dengan sistem manajemen terstandar",
                  includes: ["ISO 9001 implementasi", "SMK3 pendampingan", "Audit readiness assessment", "Surveillance tahunan"],
                  timeline: "Estimasi 3–6 bulan",
                  badge: "High ROI",
                },
                {
                  icon: Truck, gradient: "from-violet-600 to-purple-700",
                  name: "Supply Chain Ready", label: "VENDOR/SUPPLIER",
                  desc: "Untuk supplier, vendor, dan subkontraktor yang ingin masuk ekosistem proyek besar sebagai mitra terverifikasi",
                  includes: ["Legalitas & NIB usaha", "Vendor compliance check", "Sertifikasi pendukung", "Readiness scoring"],
                  timeline: "Estimasi 4–8 minggu",
                  badge: "B2B Focus",
                },
              ].map((pkg, idx) => {
                const Icon = pkg.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className={`bg-gradient-to-br ${pkg.gradient} p-5 relative`}>
                      <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/30 text-[10px]">{pkg.badge}</Badge>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{pkg.label}</p>
                      <h4 className="text-white font-extrabold text-lg">Paket {pkg.name}</h4>
                    </div>
                    <div className="p-5">
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">{pkg.desc}</p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-2">Mencakup:</p>
                      <ul className="space-y-1.5 mb-4">
                        {pkg.includes.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <CheckCircle className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] text-slate-500">{pkg.timeline}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
      </LandingSection>


      {/* ─── MINI APPS & GENERATOR DOKUMEN ─── */}
      <LandingSection title="Mini Apps & Generator Dokumen" subtitle="Tools siap pakai untuk setiap kebutuhan">
      <section id="mini-apps" className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/40">
        <div className="container">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Mini Apps & Generator Dokumen — Powered by Gustafta AI
            </div>
            <h2 className="mt-1 mb-4">
              <span className="text-indigo-600">Gustafta</span> — Tools Siap Pakai untuk Setiap Kebutuhan Konstruksi
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Lebih dari sekadar AI generik — setiap mini app dirancang khusus untuk satu tugas dokumen konstruksi, menggunakan <strong>Gustafta Framework</strong> dengan konteks regulasi Indonesia yang terkini. Draft siap pakai dalam hitungan menit.
            </p>
          </div>

          {/* Mini Apps Showcase */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <h3 className="text-slate-800 font-bold text-xl mb-2">Mini Apps — Tools Siap Pakai per Kebutuhan Spesifik</h3>
              <p className="text-slate-500 text-sm max-w-2xl mx-auto">Alat bantu terstruktur yang langsung bisa digunakan tanpa konfigurasi — setiap mini app dirancang untuk satu tugas spesifik dengan UX yang sederhana.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: FileText,
                  color: "bg-rose-50 border-rose-100 hover:border-rose-300",
                  iconBg: "bg-rose-100 text-rose-600",
                  title: "Tender Document Builder",
                  desc: "Wizard 5 langkah — isi profil perusahaan, pilih paket tender, dan sistem generate seluruh paket dokumen penawaran sesuai Perpres 46/2025 + format LPSE/SPSE secara otomatis.",
                  tags: ["Perpres 46/2025", "LPSE Format", "Auto-fill"],
                  link: "/tender-generator",
                  cta: "Buka Generator",
                },
                {
                  icon: ClipboardList,
                  color: "bg-violet-50 border-violet-100 hover:border-violet-300",
                  iconBg: "bg-violet-100 text-violet-600",
                  title: "Project Report Generator",
                  desc: "Template laporan proyek (harian, mingguan, bulanan) yang otomatis mengisi data dari input sederhana: progres fisik, hambatan, rencana minggu depan.",
                  tags: ["Laporan Harian", "Progres S-Curve", "Export PDF"],
                  link: "/projects",
                  cta: "Buka Generator",
                },
                {
                  icon: GraduationCap,
                  color: "bg-amber-50 border-amber-100 hover:border-amber-300",
                  iconBg: "bg-amber-100 text-amber-600",
                  title: "SKK CV Builder",
                  desc: "CV terstruktur untuk pengajuan SKK ke LSP/BNSP — format SIKI LPJK yang tepat, lengkap dengan portofolio proyek dan pendidikan yang terverifikasi.",
                  tags: ["Format SIKI", "BNSP-Ready", "Validasi Otomatis"],
                  link: "/agent-hub",
                  cta: "Mulai Build",
                },
                {
                  icon: Shield,
                  color: "bg-teal-50 border-teal-100 hover:border-teal-300",
                  iconBg: "bg-teal-100 text-teal-600",
                  title: "ISO Document Builder",
                  desc: "Wizard pembuatan dokumen sistem manajemen ISO 9001/14001/45001 — dari kebijakan mutu, SOP, formulir, hingga rekaman audit internal yang siap sertifikasi.",
                  tags: ["ISO 9001", "SOP Builder", "Audit Ready"],
                  link: "/agent-hub",
                  cta: "Mulai Build",
                },
                {
                  icon: CheckSquare,
                  color: "bg-blue-50 border-blue-100 hover:border-blue-300",
                  iconBg: "bg-blue-100 text-blue-600",
                  title: "Compliance Checklist Generator",
                  desc: "Input: jenis layanan + profil perusahaan + KBLI + nilai tender → output: checklist dokumen dinamis yang sudah disesuaikan regulasi terbaru.",
                  tags: ["Dinamis", "Regulasi Update", "Export Excel"],
                  link: "/agent-hub",
                  cta: "Generate Checklist",
                },
                {
                  icon: BarChart3,
                  color: "bg-green-50 border-green-100 hover:border-green-300",
                  iconBg: "bg-green-100 text-green-600",
                  title: "Go/No-Go Scoring Calculator",
                  desc: "Evaluasi 7 dimensi kelayakan tender dalam 3 menit: SBU, SKK, pengalaman, keuangan, kapasitas, timeline, dan risiko kompetisi — skor otomatis keluar.",
                  tags: ["7 Dimensi", "Scoring Otomatis", "Rekomendasi AI"],
                  link: "/tender-generator",
                  cta: "Cek Kelayakan",
                },
                {
                  icon: Bell,
                  color: "bg-orange-50 border-orange-100 hover:border-orange-300",
                  iconBg: "bg-orange-100 text-orange-600",
                  title: "Renewal Radar Dashboard",
                  desc: "Dashboard monitoring masa berlaku SBU, SKK, ISO, SIUJK, NPWP, dan dokumen legal lainnya — dengan reminder H-90/60/30 via email dan WhatsApp.",
                  tags: ["Auto-Remind", "Multi-Dokumen", "WhatsApp Alert"],
                  link: "/projects",
                  cta: "Lihat Dashboard",
                },
                {
                  icon: Scan,
                  color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
                  iconBg: "bg-indigo-100 text-indigo-600",
                  title: "Smart Document OCR & Validator",
                  desc: "Upload scan dokumen (PDF, foto) — AI mengekstrak data, memvalidasi kesesuaian antar dokumen, mendeteksi expired date, dan memberi laporan red flag.",
                  tags: ["OCR Multi-format", "Cross-validation", "Red Flag Alert"],
                  link: "/agent-hub",
                  cta: "Upload & Validasi",
                },
              ].map((app, idx) => {
                const Icon = app.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    viewport={{ once: true }}
                    className={`bg-white rounded-2xl p-5 border-2 ${app.color} transition-all hover:-translate-y-1 hover:shadow-lg group`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${app.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1.5">{app.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed mb-3">{app.desc}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.tags.map((t, ti) => (
                        <span key={ti} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">{t}</span>
                      ))}
                    </div>
                    <Link href={app.link}>
                      <Button size="sm" variant="outline" className="w-full h-7 text-[11px] font-semibold" data-testid={`button-miniapp-${idx}`}>
                        {app.cta} <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
      </LandingSection>

      {/* ─── TREN AI & INDUSTRI ─── */}
      <LandingSection title="Mengapa Digitalisasi Tidak Bisa Ditunda" subtitle="Tren industri 2025–2026" theme="dark">
      <section className="py-16 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-amber-400 font-bold tracking-wide uppercase text-xs">Tren Industri 2025–2026</span>
            <h3 className="text-white text-2xl font-extrabold mt-2">Mengapa Digitalisasi Dokumen Konstruksi Tidak Bisa Ditunda</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Globe,
                title: "Regulasi Berubah Serentak di 2025",
                desc: "Perpres 46/2025 (pengadaan), Permen PU 6/2025 (SBU), PP 28/2025 (OSS-RBA) terbit hampir bersamaan. BUJK yang tidak update dokumen dan strateginya langsung berisiko gugur administrasi.",
                stat: "Perubahan Serempak"
              },
              {
                icon: TrendingUp,
                title: "Anggaran Infrastruktur 2025",
                desc: "APBN 2025 mengalokasikan anggaran besar untuk infrastruktur. PSN dan IKN terus bergulir — peluang tender makin besar bagi BUJK yang dokumennya siap dan comply.",
                stat: "+PSN & IKN"
              },
              {
                icon: Brain,
                title: "AI Generatif Mengubah Legal Tech",
                desc: "GPT-4o dan model multimodal terbaru mampu menganalisis dokumen hukum, mendeteksi ketidaksesuaian, dan men-draft kontrak dengan akurasi mendekati profesional. Platform yang tidak mengadopsi AI akan kalah efisien.",
                stat: "Jauh Lebih Cepat"
              },
              {
                icon: CheckSquare,
                title: "TKDN & e-Tendering Makin Wajib",
                desc: "Perpres 46/2025 memperkuat wajib TKDN untuk konstruksi pemerintah. LPSE semakin canggih — peserta tender yang tidak paham alur e-procurement sering gugur di tahap teknis administrasi.",
                stat: "Banyak Gugur Adm."
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-amber-500/15 rounded-lg">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <Badge className="bg-white/10 text-slate-300 border-0 text-xs">{item.stat}</Badge>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── EKOSISTEM KOMPETENSI COLLABORATION ─── */}
      <LandingSection title="Ekosistem Kompetensi & Keunggulan Platform" subtitle="Perbandingan dan kolaborasi" theme="blue">
      <section className="py-20 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Kolaborasi Strategis — Ekosistem Digital
            </div>
            <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-4">
              Sinergi dengan <span className="text-violet-400">Ekosistem Kompetensi</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Di Indonesia, gap antara standar kompetensi dan kemampuan praktis masih lebar. Bisnis jasa dokumen dan ekosistem edukasi kompetensi saling melengkapi: klien yang teredukasi lebih siap — dokumen lebih cepat diurus. Perusahaan yang dokumennya terurus — lebih mudah naik kelas dan ekspansi.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-blue-500/20 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">DokumenProyek.com</h3>
                  <p className="text-blue-400 text-sm">Jasa Dokumen & Konsultansi Legal</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { t: "Legalitas & Perizinan", d: "PT/CV, NIB OSS, SIUJK, izin sektoral" },
                  { t: "Sertifikasi SBU & SKK", d: "LPJK, BNSP, semua klasifikasi" },
                  { t: "ISO & SMK3", d: "9001, 14001, 45001, 37001, PP 50/2012" },
                  { t: "Tender & Proyek", d: "Go/No-Go, compliance, dokumen pelaksanaan" },
                  { t: "AI Case Tracker & Renewal Radar", d: "Status real-time + reminder otomatis" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 text-sm font-semibold">{item.t}</span>
                      <span className="text-slate-500 text-xs ml-2">— {item.d}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-blue-300 text-xs font-semibold">Nilai proposisi utama:</p>
                <p className="text-slate-400 text-xs mt-1">Pengurusan dokumen resmi yang lebih cepat, transparan, dan sesuai regulasi — dengan kecanggihan AI sebagai diferensiator kompetitif.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-violet-500/20 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ekosistem Kompetensi</h3>
                  <p className="text-violet-400 text-sm">Produk Digital Edukasi Konstruksi</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { t: "eBook & Panduan Regulasi", d: "UUJK, LPJK, BNSP, Perpres — edisi terbaru" },
                  { t: "eCourse Persiapan SBU & SKK", d: "Modul terstruktur per klasifikasi & jenjang" },
                  { t: "AI Tutor & Chatbot Belajar", d: "Tanya jawab regulasi & uji kompetensi mandiri" },
                  { t: "Mini Apps & Kalkulator", d: "Simulator SKK, kalkulator biaya SBU, self-assessment" },
                  { t: "Template & SOP Siap Pakai", d: "Dokumen ISO, checklist K3, SOP operasional" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 text-sm font-semibold">{item.t}</span>
                      <span className="text-slate-500 text-xs ml-2">— {item.d}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                <p className="text-violet-300 text-xs font-semibold">Nilai proposisi utama:</p>
                <p className="text-slate-400 text-xs mt-1">Edukasi berbasis digital yang membuat profesional konstruksi lebih siap — mulai dari persiapan SKK, pemahaman regulasi, hingga manajemen compliance jangka panjang.</p>
              </div>
            </motion.div>
          </div>

          {/* Synergy flywheel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
            <h4 className="text-white font-bold text-center mb-6">Siklus Sinergi — Flywheel Growth</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: GraduationCap,
                  step: "01",
                  title: "Klien Datang Lebih Siap",
                  desc: "Klien yang belajar via Ekosistem Kompetensi memahami persyaratan lebih baik — dokumen lebih lengkap di submission pertama, proses lebih cepat secara signifikan.",
                  color: "text-blue-400"
                },
                {
                  icon: TrendingUp,
                  step: "02",
                  title: "Upsell Natural & Relevan",
                  desc: "Setelah SBU terbit, klien butuh mempertahankan kompetensi. Ekosistem Kompetensi adalah upsell yang 100% relevan — bukan jualan paksa, melainkan kebutuhan nyata.",
                  color: "text-amber-400"
                },
                {
                  icon: RefreshCw,
                  step: "03",
                  title: "Renewal Terintegrasi Edukasi",
                  desc: "Reminder perpanjangan SBU/SKK diiringi rekomendasi modul update kompetensi. Regulasi berubah → notifikasi → klien belajar → perpanjangan dengan data terbaru.",
                  color: "text-green-400"
                },
                {
                  icon: Star,
                  step: "04",
                  title: "Retensi & Lifetime Value",
                  desc: "Klien yang teredukasi lebih loyal, lebih patuh compliance, lebih sedikit kesalahan dokumen, dan menghasilkan lebih banyak repeat order layanan jasa maupun produk edukasi.",
                  color: "text-violet-400"
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.step}</span>
                    </div>
                    <h5 className="text-white font-bold text-sm mb-2">{item.title}</h5>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── MODEL KEAGENAN / FASILITATOR ─── */}
      <LandingSection title="Model Keagenan 3-Tier" subtitle="Kendali terpusat, jangkauan nasional">
      <section id="keagenan" className="py-24 bg-white">
        <div className="container">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-4">
              <Network className="w-4 h-4" />
              Model Bisnis Keagenan — Bergabunglah sebagai Fasilitator
            </div>
            <h2 className="mt-1 mb-4">Model 3-Tier — Kendali Terpusat, Jangkauan Nasional</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Kami membangun jaringan distribusi layanan nasional melalui model <strong>tiga lapis</strong>: Pusat sebagai <em>command center & processing hub</em>, Master Agent / Regional Partner sebagai <em>network development layer</em>, dan Fasilitator Lapangan sebagai <em>service extension layer</em> — tanpa kehilangan standar mutu dan compliance.
            </p>
          </div>

          {/* Overview Model */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-14">

            {/* Pusat / Central */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-slate-900 rounded-2xl p-7 text-white"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-blue-500 text-white border-0 text-xs mb-1">LAPIS 1 — PUSAT</Badge>
                  <h3 className="text-white font-bold text-lg leading-tight">Pusat — Command & Processing Center</h3>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {[
                  { icon: ShieldCheck, title: "Client & Case Governance", desc: "Menerima lead, menetapkan scope, SLA, prioritas, dan penugasan" },
                  { icon: FileCheck, title: "Document & Compliance Control", desc: "Review dokumen, gap analysis, approval resmi sebelum pengajuan" },
                  { icon: Landmark, title: "Official Processing Desk", desc: "Pengurusan resmi ke LPJK, BNSP, BSN, OSS, Kemenaker, dan instansi" },
                  { icon: Brain, title: "Technology & AI Control", desc: "Mengelola OpenClaw Orchestrator, 12 Agen Spesialis Gustafta, & knowledge base" },
                  { icon: BarChart3, title: "Quality Assurance & Billing", desc: "Standar mutu nasional, audit agen, invoice, komisi, profitabilitas" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.title}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <p className="text-blue-300 text-xs font-bold mb-1.5">Roles di Pusat:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Super Admin", "Operations Director", "Case Manager", "Compliance Reviewer", "Certification Officer", "Tender Officer", "Billing Officer", "QA Manager"].map((role, i) => (
                    <span key={i} className="text-[10px] bg-blue-900/50 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full">{role}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Level 2 — Master Agent / Regional Partner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-indigo-500 text-white border-0 text-xs mb-1">LAPIS 2 — REGIONAL</Badge>
                  <h3 className="text-slate-800 font-bold text-lg leading-tight">Master Agent — Regional Partner</h3>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {[
                  { icon: Globe, title: "Network Development", desc: "Mengembangkan pasar wilayah / komunitas / asosiasi dengan target tertentu" },
                  { icon: Users, title: "Fasilitator Network", desc: "Merekrut, membina, dan mensupervisi Fasilitator Lapangan (Lapis 3)" },
                  { icon: BarChart3, title: "Regional Performance", desc: "Bertanggung jawab atas performa wilayah dan kualitas jaringan di bawahnya" },
                  { icon: Wallet, title: "Override Revenue", desc: "Mendapat override revenue dari case agen Lapis 3 di jaringannya" },
                  { icon: TrendingUp, title: "Territory Management", desc: "Hak eksklusif pengembangan area dengan minimum target & standar pusat" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/80 border border-indigo-200 rounded-xl hover:bg-white transition-colors">
                      <div className="p-1.5 bg-indigo-100 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold text-sm">{item.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-indigo-100 border border-indigo-200 rounded-xl p-4">
                <p className="text-indigo-800 text-xs font-bold mb-1.5">Cocok untuk:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Perusahaan Mitra", "Asosiasi Wilayah", "Komunitas Usaha", "Jaringan Profesional"].map((role, i) => (
                    <span key={i} className="text-[10px] bg-white text-indigo-700 border border-indigo-300 px-2 py-0.5 rounded-full">{role}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Fasilitator Lapangan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-amber-500 text-white border-0 text-xs mb-1">LAPIS 3 — LAPANGAN</Badge>
                  <h3 className="text-slate-800 font-bold text-lg leading-tight">Fasilitator Lapangan — Service Extension Layer</h3>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Search, title: "Local User Acquisition", desc: "Menjangkau calon klien di wilayah, edukasi awal, konsultasi tatap muka" },
                  { icon: ClipboardList, title: "Local Intake & Assistance", desc: "Bantu pengumpulan dokumen, verifikasi identitas, profil usaha, dan data lapangan" },
                  { icon: Activity, title: "Case Follow-up & Evidence", desc: "Ingatkan kekurangan, foto bukti lapangan, jadwalkan kunjungan & asesmen" },
                  { icon: RefreshCw, title: "Relationship & Retention", desc: "Jaga hubungan klien lokal, bantu cross-sell, dan renewal sertifikat" },
                  { icon: Wallet, title: "Komisi Transparan", desc: "Komisi akuisisi + pendampingan + case selesai + bonus performa berbasis KPI" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/80 border border-amber-200 rounded-xl hover:bg-white transition-colors">
                      <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold text-sm">{item.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-100 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-xs font-bold mb-1.5">Roles di Lapangan:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Regional Coordinator", "Senior Facilitator", "Facilitator", "Field Verifier"].map((role, i) => (
                    <span key={i} className="text-[10px] bg-white text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full">{role}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Prinsip Dasar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-14">
            <h3 className="text-slate-800 font-bold text-lg text-center mb-7">4 Prinsip Dasar Model Operasi</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Globe, color: "text-blue-600 bg-blue-50 border-blue-100",
                  title: "Sentralisasi Kendali, Desentralisasi Pelayanan",
                  desc: "Klien dilayani dekat secara geografis oleh fasilitator, tetapi keputusan, validasi dokumen, dan pengurusan resmi tetap dikendalikan pusat secara ketat."
                },
                {
                  icon: Database, color: "text-green-600 bg-green-50 border-green-100",
                  title: "Semua Proses Tercatat di Sistem",
                  desc: "Tidak ada jalur informal. Lead, dokumen, checklist, status, catatan, approval, dan hasil akhir — semuanya masuk ke platform secara real-time."
                },
                {
                  icon: ShieldCheck, color: "text-purple-600 bg-purple-50 border-purple-100",
                  title: "Pusat Pemegang Tanggung Jawab Akhir",
                  desc: "Kualitas dokumen, ketepatan proses, dan compliance ke instansi berwenang adalah tanggung jawab pusat — bukan fasilitator secara mandiri."
                },
                {
                  icon: Layers, color: "text-amber-600 bg-amber-50 border-amber-100",
                  title: "Fasilitator = Front Operation, Bukan Sovereign",
                  desc: "Fasilitator adalah mitra pelaksana lapangan dan kanal layanan lokal — bukan entitas independen. Scope, SOP, dan komitmen ditetapkan pusat."
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                const [textC, bgC, borderC] = item.color.split(' ');
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className={`p-5 rounded-xl border ${bgC} ${borderC}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white border ${borderC}`}>
                      <Icon className={`w-5 h-5 ${textC}`} />
                    </div>
                    <h4 className={`font-bold text-sm mb-2 ${textC}`}>{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Alur Kerja 8 Tahap */}
          <div className="mb-14">
            <h3 className="text-slate-800 font-bold text-xl text-center mb-2">Alur Kerja Operasional End-to-End</h3>
            <p className="text-center text-slate-500 text-sm mb-10">8 tahap dari lead masuk hingga klien menerima hasil dan dipantau renewalnya</p>
            <div className="relative">
              <div className="hidden lg:block absolute top-[44px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-16" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { step: "01", icon: Search, title: "Lead Masuk", desc: "Website, WA, referral, atau fasilitator lapangan", who: "Sistem + Fasilitator", color: "bg-blue-500" },
                  { step: "02", icon: UserCheck, title: "Penugasan Fasilitator", desc: "Auto-assign berdasarkan wilayah, sektor & beban kerja", who: "Pusat + AI", color: "bg-indigo-500" },
                  { step: "03", icon: ClipboardList, title: "Intake & Pengumpulan Data", desc: "Fasilitator mendampingi klien, dokumen masuk ke sistem", who: "Fasilitator", color: "bg-violet-500" },
                  { step: "04", icon: Brain, title: "Review Pusat & AI Gap Analysis", desc: "Pusat + AI cek kelengkapan & kepatuhan regulasi", who: "Pusat + OpenClaw", color: "bg-purple-600" },
                  { step: "05", icon: RefreshCw, title: "Perbaikan & Validasi", desc: "Fasilitator bantu klien lengkapi kekurangan, pusat validasi ulang", who: "Fasilitator + Pusat", color: "bg-pink-500" },
                  { step: "06", icon: Landmark, title: "Pengurusan Resmi", desc: "Pusat ajukan ke LPJK, BNSP, OSS, atau instansi terkait", who: "Pusat", color: "bg-rose-500" },
                  { step: "07", icon: CheckSquare, title: "Terbit & Serah Terima", desc: "Final QA oleh pusat, hasil diserahkan via portal + fasilitator", who: "Pusat + Fasilitator", color: "bg-green-600" },
                  { step: "08", icon: Bell, title: "Renewal & Retention", desc: "Radar aktif: reminder perpanjangan & layanan lanjutan", who: "Sistem + Fasilitator", color: "bg-teal-600" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.06 }}
                      viewport={{ once: true }}
                      className="relative flex flex-col items-center text-center group"
                    >
                      <div className={`w-[48px] h-[48px] rounded-full ${item.color} flex items-center justify-center mb-2.5 shadow-lg z-10 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mb-1">{item.step}</span>
                      <h5 className="font-bold text-slate-800 text-[11px] leading-tight mb-1">{item.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-tight mb-1.5">{item.desc}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">{item.who}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Coordination Layer */}
          <div className="bg-slate-900 rounded-2xl p-8 mb-14 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <Badge className="bg-amber-500 text-slate-900 mb-3">OpenClaw Coordination Layer</Badge>
                <h3 className="text-white text-xl font-bold">AI Bekerja untuk Pusat & Fasilitator</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
                  Model keagenan ini dikuatkan oleh arsitektur multi-agent OpenClaw — setiap lapis operasi memiliki agen AI yang membantu secara spesifik, bukan generik.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Network, color: "border-blue-500/30 bg-blue-500/5",
                    badgeColor: "bg-blue-500/20 text-blue-300",
                    title: "Orchestrator Pusat",
                    badge: "Central AI",
                    items: ["Membaca tipe & prioritas case", "Assign fasilitator optimal (wilayah + beban)", "Pilih agen spesialis yang aktif", "Jaga semua proses sesuai policy & SOP"],
                  },
                  {
                    icon: Users, color: "border-amber-500/30 bg-amber-500/5",
                    badgeColor: "bg-amber-500/20 text-amber-300",
                    title: "Agen Fasilitator Assistant",
                    badge: "Lapangan AI",
                    items: ["Panduan dokumen yang harus diminta klien", "Checklist wawancara & verifikasi lapangan", "Ringkasan case untuk fasilitator baru", "Reminder follow-up & status update ke klien"],
                  },
                  {
                    icon: Brain, color: "border-green-500/30 bg-green-500/5",
                    badgeColor: "bg-green-500/20 text-green-300",
                    title: "Agen Central Processing",
                    badge: "Review AI",
                    items: ["Review kelengkapan & format dokumen", "Gap analysis & compliance checking", "Draft surat resmi / email ke instansi", "Rekomendasi next action untuk tim pusat"],
                  },
                  {
                    icon: RefreshCw, color: "border-purple-500/30 bg-purple-500/5",
                    badgeColor: "bg-purple-500/20 text-purple-300",
                    title: "Agen Retention & Renewal",
                    badge: "Retention AI",
                    items: ["Monitor masa berlaku semua sertifikat klien", "Kampanye follow-up renewal otomatis", "Rekomendasi bundling & cross-sell", "Proposal layanan lanjutan ke fasilitator"],
                  },
                ].map((agent, idx) => {
                  const Icon = agent.icon;
                  return (
                    <div key={idx} className={`border ${agent.color} rounded-xl p-5`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Icon className="w-5 h-5 text-slate-300" />
                        </div>
                        <Badge className={`${agent.badgeColor} border-0 text-[10px]`}>{agent.badge}</Badge>
                      </div>
                      <h4 className="text-white font-bold text-sm mb-3">{agent.title}</h4>
                      <ul className="space-y-1.5">
                        {agent.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dashboard Per Role */}
          <div className="mb-14">
            <h3 className="text-slate-800 font-bold text-xl text-center mb-2">3 Dashboard — Disesuaikan per Peran</h3>
            <p className="text-center text-slate-500 text-sm mb-8">Setiap peran mendapatkan tampilan dan informasi yang relevan dengan tanggung jawabnya</p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Building2, title: "Dashboard Pusat", gradient: "from-blue-600 to-indigo-700",
                  items: ["Lead nasional & sebaran wilayah", "Performa fasilitator (KPI per orang)", "Case per sektor & status real-time", "Antrean review & compliance warnings", "Case yang diproses ke lembaga/instansi", "SLA risk tracker & eskalasi otomatis", "Omzet, insentif & profitabilitas"],
                },
                {
                  icon: Users, title: "Dashboard Fasilitator", gradient: "from-amber-500 to-orange-600",
                  items: ["Lead & case yang ditugaskan ke saya", "Tugas follow-up & reminder harian", "Dokumen kurang & status revisi", "Jadwal kunjungan & meeting lokal", "Catatan dari pusat & instruksi terbaru", "Status case klien saya", "Komisi & insentif performa saya"],
                },
                {
                  icon: UserCheck, title: "Dashboard Klien", gradient: "from-green-500 to-emerald-700",
                  items: ["Status layanan & timeline visual", "Checklist dokumen & progress upload", "Permintaan revisi & item kurang", "Jadwal meeting / asesmen / audit", "Hasil & download sertifikat / dokumen", "Invoice & riwayat pembayaran", "Notifikasi renewal & masa berlaku"],
                },
              ].map((dash, idx) => {
                const Icon = dash.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className={`bg-gradient-to-br ${dash.gradient} p-5`}>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-white font-bold text-base">{dash.title}</h4>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2">
                        {dash.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* KPI Framework */}
          <div className="grid md:grid-cols-2 gap-5 mb-14">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h4 className="text-blue-800 font-bold">KPI Pusat</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "TAT Review Dokumen", target: "< 24 jam", desc: "Waktu review dari dokumen masuk ke status" },
                  { label: "TAT Pengurusan Resmi", target: "Sesuai SLA", desc: "Waktu dari submit ke instansi hingga terbit" },
                  { label: "Error Rate Dokumen", target: "< 5%", desc: "Persentase dokumen yang dikembalikan" },
                  { label: "SLA Compliance", target: "> 90%", desc: "Case selesai tepat waktu sesuai janji ke klien" },
                  { label: "Conversion Lead → Case", target: "> 30%", desc: "Lead yang berhasil dikonversi menjadi case aktif" },
                  { label: "Repeat Revenue", target: "Naik 20% YoY", desc: "Kontribusi klien lama terhadap total revenue" },
                ].map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-blue-100">
                    <div>
                      <p className="text-blue-800 text-xs font-semibold">{kpi.label}</p>
                      <p className="text-slate-400 text-[10px]">{kpi.desc}</p>
                    </div>
                    <span className="text-blue-600 font-extrabold text-xs flex-shrink-0 ml-3">{kpi.target}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-amber-600" />
                <h4 className="text-amber-800 font-bold">KPI Fasilitator</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Kecepatan Follow-up", target: "< 2 jam", desc: "Waktu respons ke lead atau permintaan pusat" },
                  { label: "Kelengkapan Intake Awal", target: "> 80%", desc: "Dokumen lengkap pada pengumpulan pertama" },
                  { label: "Conversion Lead Lokal", target: "> 25%", desc: "Lead di wilayah yang berhasil menjadi case" },
                  { label: "Case Completion Support", target: "> 95%", desc: "Case yang didampingi hingga selesai" },
                  { label: "Retention Wilayah", target: "> 60%", desc: "Klien yang kembali untuk layanan berikutnya" },
                  { label: "Kepuasan Klien (NPS)", target: "> 8/10", desc: "Skor kepuasan klien di area fasilitator" },
                ].map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-amber-100">
                    <div>
                      <p className="text-amber-800 text-xs font-semibold">{kpi.label}</p>
                      <p className="text-slate-400 text-[10px]">{kpi.desc}</p>
                    </div>
                    <span className="text-amber-600 font-extrabold text-xs flex-shrink-0 ml-3">{kpi.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Batasan Fasilitator */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-7 mb-14">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-800 font-bold text-base">Batasan Wewenang Fasilitator — Untuk Menjaga Compliance & Reputasi</h4>
                <p className="text-red-600 text-sm mt-0.5">Hal-hal berikut TIDAK BOLEH dilakukan fasilitator tanpa otorisasi eksplisit dari pusat:</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                "Menjanjikan hasil yang belum disetujui pusat",
                "Mengubah scope layanan tanpa approval tertulis",
                "Mengajukan dokumen resmi ke lembaga di luar prosedur",
                "Mengubah checklist atau format dokumen standar",
                "Memberikan interpretasi regulasi final tanpa validasi pusat",
                "Menerima pembayaran di luar mekanisme resmi perusahaan",
                "Menyimpan dokumen penting di luar sistem platform",
                "Menawarkan harga / diskon berbeda dari tarif resmi",
                "Mengatasnamakan perusahaan tanpa surat kuasa yang sah",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2.5 border border-red-100">
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Jenis Lisensi Agen */}
          <div className="mb-14">
            <h3 className="text-slate-800 font-bold text-xl text-center mb-2">4 Jenis Lisensi Keagenan</h3>
            <p className="text-center text-slate-500 text-sm mb-8">Pilih model bergabung yang paling sesuai dengan profil, kapasitas, dan target pasar Anda</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  badge: "REFERRAL", color: "border-slate-200 bg-white", badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                  icon: Users, iconClass: "bg-slate-100 text-slate-600",
                  title: "Referral Agent",
                  cocok: "Individu, konsultan freelance, relasi bisnis, komunitas",
                  items: ["Fokus membawa prospek — tidak wajib dampingi penuh", "Komisi berbasis lead yang berhasil closing", "Tidak ada target minimum", "Akses tools & AI assistant dasar"],
                },
                {
                  badge: "SERVICE", color: "border-amber-200 bg-amber-50", badgeClass: "bg-amber-500 text-white border-0",
                  icon: ClipboardList, iconClass: "bg-amber-100 text-amber-600",
                  title: "Service Agent (Fasilitator)",
                  cocok: "Fasilitator aktif, kantor perwakilan, agen lokal",
                  items: ["Akuisisi + pendampingan + follow-up dokumen", "Komisi lebih besar karena ada peran operasional", "Akses dashboard case & AI assistant penuh", "Mendapat training & SOP dari pusat"],
                },
                {
                  badge: "MASTER", color: "border-indigo-200 bg-indigo-50", badgeClass: "bg-indigo-500 text-white border-0",
                  icon: Network, iconClass: "bg-indigo-100 text-indigo-600",
                  title: "Master Agent / Regional Operator",
                  cocok: "Perusahaan mitra, komunitas wilayah, tokoh pasar",
                  items: ["Boleh rekrut & bina Fasilitator (Lapis 3)", "Override komisi dari jaringan di bawahnya", "Dashboard performa wilayah & kluster", "Target wilayah & cluster market eksklusif"],
                },
                {
                  badge: "STRATEGIC", color: "border-emerald-200 bg-emerald-50", badgeClass: "bg-emerald-600 text-white border-0",
                  icon: Star, iconClass: "bg-emerald-100 text-emerald-600",
                  title: "Strategic Institutional Partner",
                  cocok: "Asosiasi, koperasi, inkubator, lembaga pelatihan",
                  items: ["Membawa volume pasar terorganisasi (bulk)", "Skema enterprise: sharing fee / subscription", "Dedicated desk & SLA khusus", "Semi-white-label atau managed federation"],
                },
              ].map((lic, idx) => {
                const Icon = lic.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className={`border ${lic.color} rounded-2xl p-5 flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lic.iconClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={`text-[10px] h-5 ${lic.badgeClass}`}>{lic.badge}</Badge>
                    </div>
                    <h4 className="text-slate-800 font-bold text-sm mb-1">{lic.title}</h4>
                    <p className="text-slate-500 text-[10px] mb-3 leading-relaxed">Cocok untuk: {lic.cocok}</p>
                    <ul className="space-y-1.5 flex-1">
                      {lic.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA Bergabung */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10">
              <Badge className="bg-amber-500 text-slate-900 mb-4">Buka Peluang Bergabung</Badge>
              <h3 className="text-white text-2xl md:text-3xl font-extrabold mb-3">
                Jadilah Bagian Jaringan Keagenan <br className="hidden md:block" />
                <span className="text-amber-400">DokumenProyek.com</span>
              </h3>
              <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                Bergabunglah sebagai Referral Agent, Fasilitator, Master Agent, atau Strategic Partner — pilih model yang sesuai, dapatkan AI assistant, training, tools, dan komisi transparan dari setiap case yang berhasil.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { icon: Wallet, value: "Komisi Bertingkat", desc: "Akuisisi + Pendampingan + Selesai + Bonus Performa" },
                  { icon: Brain, value: "Didukung AI", desc: "Agen Fasilitator Assistant membantu kerja lapangan Anda" },
                  { icon: Globe, value: "Jangkauan Nasional", desc: "Operasi di seluruh wilayah Indonesia tanpa batasan provinsi" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <Icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-white font-bold text-sm">{item.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ScrollLink to="footer" smooth={true} offset={-80}>
                  <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 h-11 shadow-lg shadow-amber-900/30" data-testid="button-join-facilitator">
                    <Users className="w-4 h-4 mr-2" />
                    Daftar Menjadi Fasilitator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </ScrollLink>
                <ScrollLink to="footer" smooth={true} offset={-80}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-11 gap-2 bg-transparent" data-testid="button-facilitator-info">
                    <Mail className="w-4 h-4" />
                    Minta Info Lebih Lanjut
                  </Button>
                </ScrollLink>
              </div>
            </div>
          </div>

        </div>
      </section>
      </LandingSection>

      {/* ─── USERS / SEGMEN ─── */}
      <LandingSection title="Siapa yang Kami Layani?" subtitle="Semua segmen industri konstruksi">
      <section id="pengguna" className="section bg-white border-y border-slate-100">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="mb-3">Siapa yang Kami Layani?</h2>
            <p className="text-muted-foreground">Dari BUJK yang baru berdiri hingga kontraktor skala nasional, dari tenaga ahli mandiri hingga instansi pemerintah — ekosistem kami melayani semua segmen industri konstruksi Indonesia.</p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-48 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {userRoles.map((role) => (
                <div key={role.id} className="group bg-slate-50 p-6 rounded-2xl w-48 text-center hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-100 hover:border-accent/20 cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-accent shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                    {getIcon(role.icon, "w-8 h-8")}
                  </div>
                  <h3 className="text-base font-bold mb-1">{role.title}</h3>
                  <p className="text-xs text-muted-foreground">{role.subtitle}</p>
                </div>
              ))}
            </div>
          )}

          {/* Segmen detail */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "BUJK & Kontraktor",
                desc: "Badan Usaha Jasa Konstruksi yang membutuhkan SBU, SIUJK, dan dokumen tender untuk bisa mengikuti lelang pemerintah maupun swasta. Target utama layanan kami.",
                needs: ["SBU Kontraktor (K1/K2/K3/Menengah/Besar)", "SIUJK & perizinan operasional", "Dokumen tender Perpres 46/2025", "Upgrade & perpanjangan sertifikat"],
                count: "1.200+ klien"
              },
              {
                title: "Tenaga Ahli & Profesional",
                desc: "Insinyur, arsitek, dan profesional konstruksi yang membutuhkan SKK untuk syarat SBU perusahaan atau untuk meningkatkan nilai jual diri di pasar kerja.",
                needs: ["SKK Tenaga Ahli (Muda/Madya/Utama)", "SKK Tenaga Terampil (Kelas I/II/III)", "Uji kompetensi LSP/BNSP", "Perpanjangan & upgrade SKK"],
                count: "800+ individu"
              },
              {
                title: "Konsultan & Developer",
                desc: "Konsultan perencana/pengawas dan developer swasta yang butuh SBU Konsultan, ISO untuk syarat kualifikasi, dan dokumen proyek yang rapi untuk klien mereka.",
                needs: ["SBU Konsultan (Perencana & Pengawas)", "ISO 9001 & sistem manajemen", "KAK & dokumen penawaran konsultan", "Laporan proyek & berita acara"],
                count: "400+ perusahaan"
              },
            ].map((seg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800">{seg.title}</h4>
                  <Badge variant="secondary" className="text-xs">{seg.count}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{seg.desc}</p>
                <ul className="space-y-2">
                  {seg.needs.map((n, ni) => (
                    <li key={ni} className="flex items-center gap-2 text-xs text-slate-600">
                      <ChevronRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── WHY US ─── */}
      <LandingSection title="Kenapa Percayakan Dokumen ke DokumenProyek.com?" subtitle="Tentang kami & keunggulan">
      <section id="tentang" className="section bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4">Mengapa Pilih Kami?</Badge>
              <h2 className="mb-5">Kenapa Percayakan Dokumen Usaha ke <span className="text-accent">DokumenProyek.com</span>?</h2>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Kami bukan biro jasa biasa. Kami adalah platform terintegrasi yang memahami kompleksitas regulasi jasa konstruksi Indonesia — mulai dari UUJK No.2/2017, Perpres 46/2025, Permen PU 6/2025, PP 28/2025, PP 50/2012 K3, hingga standar LPJK dan BNSP terbaru.
              </p>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, idx) => <Skeleton key={idx} className="h-8 w-full" />)}
                </div>
              ) : (
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit.id} className="flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent group-hover:text-white transition-colors">
                        <CheckCircle className="w-3.5 h-3.5 text-accent group-hover:text-white" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm leading-relaxed">{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Regulatory refs */}
              <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Regulasi Acuan Utama</p>
                <div className="flex flex-wrap gap-2">
                  {["UU No.2/2017 Jaskon", "Perpres 46/2025", "Permen PU 6/2025", "PP 28/2025 OSS", "PP 50/2012 K3", "SE LPJK 2024"].map((reg, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md font-mono">{reg}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  icon: Cpu, color: "border-l-amber-500", iconBg: "bg-amber-100", iconColor: "text-amber-600",
                  title: "AI-Powered dengan OpenClaw",
                  desc: "Engine multi-agent kami (OpenClaw) menggunakan GPT-4o dengan RAG (Retrieval-Augmented Generation) dari knowledge base regulasi Indonesia. Draft dokumen, review compliance, dan gap analysis yang biasanya butuh berhari-hari kini bisa dalam menit."
                },
                {
                  icon: Shield, color: "border-l-blue-500", iconBg: "bg-blue-100", iconColor: "text-blue-600",
                  title: "Sesuai Regulasi Terkini & Terverifikasi",
                  desc: "Tim hukum kami memperbarui knowledge base setiap ada perubahan regulasi. Checklist dan template dokumen kami dikalibrasi ulang mengikuti SE LPJK terbaru, Permen PUPR terbaru, dan perubahan OSS-RBA."
                },
                {
                  icon: Users, color: "border-l-green-500", iconBg: "bg-green-100", iconColor: "text-green-600",
                  title: "Hub & Spoke — Jangkauan Nasional",
                  desc: "Pusat operasi mengendalikan mutu, teknologi, dan standar. Fasilitator lapangan mendampingi klien di kota-kota seluruh Indonesia. Klien di Aceh atau Papua mendapatkan standar pelayanan yang sama dengan klien di Jakarta."
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className={`bg-white rounded-2xl p-6 border-l-4 ${card.color} shadow-md hover:shadow-lg transition-shadow flex gap-5 items-start`}>
                    <div className={`${card.iconBg} p-3.5 rounded-xl flex-shrink-0 ${card.iconColor}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold mb-1.5 ${card.iconColor}`}>{card.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      </LandingSection>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-0 mb-5">Konsultasi Awal Gratis — Tanpa Komitmen</Badge>
            <h2 className="text-white text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
              {cta?.title || "Mulai Urus Dokumen Usaha Anda Sekarang"}
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
              {cta?.subtitle || "Tim konsultan dan AI kami siap membantu dari legalitas, perizinan, SBU, SKK, ISO/SMK3, hingga dokumen tender dan proyek. Tidak perlu bayar untuk konsultasi pertama."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-400 mb-10">
              {["✓ Tidak ada biaya tersembunyi", "✓ Estimasi waktu & biaya transparan", "✓ Update status real-time", "✓ Jaminan sesuai regulasi"].map((t, i) => (
                <span key={i} className="bg-white/10 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/6282299417818?text=Halo%2C+saya+ingin+konsultasi+layanan+dokumen+di+DokumenProyek.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-cta-register"
              >
                <Button
                  size="lg"
                  className="bg-accent text-slate-900 hover:bg-accent/90 text-lg px-8 py-6 h-auto shadow-xl shadow-accent/20 font-bold w-full sm:w-auto"
                >
                  {cta?.primaryButtonText || "Mulai Konsultasi Gratis"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a
                href="https://gustafta.my.id/agent-hub"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-cta-ai"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-white hover:bg-white hover:text-primary text-lg px-8 py-6 h-auto bg-transparent gap-2 font-bold w-full sm:w-auto"
                >
                  <Cpu className="w-5 h-5" />
                  Coba OpenClaw AI Sekarang
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="footer" className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="bg-accent p-1.5 rounded text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-white">
                  DokumenProyek<span className="text-accent">.com</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Platform digital terpadu untuk layanan legalitas usaha, perizinan, sertifikasi SBU & SKK, ISO/SMK3, dokumen tender, dan proyek konstruksi Indonesia — ditenagai OpenClaw AI.
              </p>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@dokumenproyek.com</p>
                <p className="text-xs text-slate-500 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +62 812-0000-0000</p>
                <p className="text-xs text-slate-500 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Jakarta, Indonesia</p>
              </div>
              <div className="flex gap-3">
                {["WA", "IG", "LI"].map((s, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-slate-900 transition-colors cursor-pointer text-xs font-bold text-slate-400">{s}</div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-5">Layanan Utama</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ["Legalitas Usaha", "mod-legalitas"],
                  ["Perizinan Usaha", "mod-perizinan"],
                  ["Sertifikasi SBU", "mod-sbu"],
                  ["Sertifikasi SKK", "mod-skk"],
                  ["ISO & SMK3", "ekosistem"],
                ].map(([label, target], i) => (
                  <li key={i}>
                    <ScrollLink to={target} smooth={true} offset={-100} className="hover:text-accent transition-colors cursor-pointer text-slate-400 hover:text-accent flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5" />{label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-5">Platform AI Kami</h4>
              {/* Gustafta prominent link */}
              <a href="https://gustafta.my.id" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-xl px-3 py-2.5 mb-4 hover:bg-violet-500/20 transition-colors group">
                <Zap className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-violet-300 text-xs font-bold leading-tight">gustafta.my.id</p>
                  <p className="text-slate-500 text-[10px] leading-tight">Platform AI lengkap untuk konstruksi</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <ul className="space-y-2.5 text-sm">
                {[
                  ["TenderaClaw AI", "https://gustafta.my.id/tendera-claw", true],
                  ["SBUClaw AI", "https://gustafta.my.id/sbu-claw", true],
                  ["LexCom Hukum", "https://gustafta.my.id/lexcom", true],
                  ["Workroom", "https://gustafta.my.id/ruang-proyek", true],
                  ["OpenClaw AI Hub", "/agent-hub", false],
                  ["Verifikasi Dokumen", "/verify", false],
                  ["Gaia Store", "/gaia-store", false],
                  ["LKUT Simulator", "/lkut-simulator", false],
                ].map(([label, href, ext], i) => (
                  <li key={i}>
                    {ext ? (
                      <a href={href as string} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors text-slate-400 flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5" />{label}
                      </a>
                    ) : (
                      <Link href={href as string} className="hover:text-accent transition-colors text-slate-400 flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5" />{label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-400 text-xs font-semibold mb-0.5">OpenClaw AI Engine</p>
                <p className="text-slate-500 text-[10px] leading-tight">GPT-4o • 12 Agen Spesialis • RAG Regulasi Konstruksi Indonesia</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-5">Regulasi & Info</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["UU No.2/2017 Jaskon", "Perpres 46/2025 Pengadaan", "Permen PU 6/2025 SBU", "PP 28/2025 OSS-RBA", "PP 50/2012 SMK3"].map((reg, i) => (
                  <li key={i} className="text-xs font-mono bg-slate-800/50 px-2 py-1 rounded">{reg}</li>
                ))}
              </ul>
              <div className="mt-5">
                <ScrollLink to="eligibility" smooth={true} offset={-80}>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-slate-900 font-bold text-xs" data-testid="button-footer-cta">
                    Cek Kelayakan Gratis →
                  </Button>
                </ScrollLink>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <p className="text-sm text-slate-600">© 2025 DokumenProyek.com. Hak cipta dilindungi undang-undang.</p>
              <div className="flex items-center gap-2 md:justify-end">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-slate-500">Powered by <span className="text-amber-400 font-semibold">Gustafta Framework</span> · OpenClaw AI (GPT-4o)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mt-10">
          <ContactForm />
        </div>
      </footer>
    </div>
  );
}
