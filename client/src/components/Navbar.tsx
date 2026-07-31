import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, Menu, Shield, Cpu, LayoutDashboard, LogOut,
  ChevronDown, Award, GraduationCap, FileCheck, Landmark, ShieldCheck,
  Zap, Scale, BriefcaseIcon, BookOpen, Brain, Network, Bot, Handshake, Package,
  Search, FolderOpen, FileText, DollarSign, Wrench, Users, Briefcase, ShoppingBag, Star, MapPin,
  Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/use-auth";

/* ── Menu data ────────────────────────────────── */
const layananLinks = [
  { icon: Building2,     label: "Semua Layanan SKI",   href: "/layanan-ski",       desc: "SBU, SKK, ISO, tender & keuangan — PT. Sarana Kompetensi Indonesia" },
  { icon: ShoppingBag,   label: "Toko Digital",         href: "/toko",              desc: "eBook, template, kursus & paket produk digital" },
  { icon: Award,         label: "SBU Konstruksi",       href: "/sbu",               desc: "Sertifikat Badan Usaha Jasa Konstruksi" },
  { icon: GraduationCap, label: "SKK & Kompetensi",     href: "/skk",               desc: "Sertifikat Kompetensi Kerja tenaga ahli" },
  { icon: FileCheck,     label: "ISO & SMK3",            href: "/iso-smk3",          desc: "Standar mutu, K3, dan sistem manajemen" },
  { icon: Award,         label: "Manajemen ISO",         href: "/iso-manajemen",     desc: "End-to-end ISO 9001/14001/45001 — gap analysis hingga sertifikasi" },
  { icon: Landmark,      label: "Legalitas Usaha",       href: "/legalitas",         desc: "PT, CV, Yayasan, perubahan akta" },
  { icon: ShieldCheck,   label: "OSS-RBA & Perizinan",   href: "/oss-rba",           desc: "NIB, izin operasional, OSS Risk-Based" },
  { icon: FileCheck,     label: "LKPM",                  href: "/lkpm",              desc: "Laporan Kegiatan Penanaman Modal — triwulan, semesteran, tahunan" },
  { icon: BookOpen,      label: "LKUT",                  href: "/lkut",              desc: "Laporan Kegiatan Usaha Tahunan BUJK — deadline 30 April" },
  { icon: ShieldCheck,   label: "SMAP & Pancek",         href: "/smap-pancek",       desc: "Sistem Manajemen Anti Penyuapan — ISO 37001 & Panduan KPK" },
  { icon: Briefcase,     label: "Jasa Dokumen SKI",      href: "/jasa-dokumen",      desc: "Layanan PT. Sarana Kompetensi Indonesia" },
];

const gustaaftaGroups = [
  {
    title: "CLAW Tools",
    links: [
      { icon: Cpu,           label: "Agent Hub",          href: "/agent-hub",      desc: "Pusat semua agen AI Gustafta", badge: "12 Agen" },
      { icon: Search,        label: "TenderaClaw",         href: "/tendera-claw",   desc: "Pemindai peluang tender otomatis" },
      { icon: Award,         label: "SBUClaw",             href: "/sbu-claw",       desc: "Screening kelayakan SBU berbasis AI" },
    ],
  },
  {
    title: "AI Analitik & Hukum",
    links: [
      { icon: Scale,         label: "LexCom Hukum",        href: "/lexcom-hukum",   desc: "Analisis dokumen hukum & kontrak" },
      { icon: FileText,      label: "AI Dokumen",          href: "/ai-dokumen",     desc: "Tanya jawab cerdas isi dokumen" },
      { icon: BriefcaseIcon, label: "Klinik Konsultasi",   href: "/konsultasi",     desc: "Konsultasi bisnis konstruksi dengan AI" },
      { icon: Brain,         label: "Business Memory",     href: "/business-memory",desc: "Memori bisnis & jejak keputusan AI" },
    ],
  },
  {
    title: "Akademi & Kompetensi",
    links: [
      { icon: FolderOpen,    label: "Workroom",            href: "/workroom",       desc: "Ruang kerja freelance profesional" },
      { icon: BookOpen,      label: "KompetensiHub",       href: "/kompetensi-hub", desc: "Tracker SKK & roadmap kompetensi" },
      { icon: Users,         label: "ASKOM Coach",         href: "/askom-coach",    desc: "Coaching asosiasi konstruksi" },
      { icon: GraduationCap, label: "Bimtek SKK",          href: "/bimtek-skk",     desc: "Bimbingan teknis sertifikasi SKK" },
    ],
  },
];

// Flat list derived from groups (used by mobile drawer)
const gustaaftaLinks = gustaaftaGroups.flatMap((g) => g.links);

const proyekLinks = [
  { icon: Search,    label: "Peluang Tender",    href: "/opportunities", desc: "Temukan tender sesuai kualifikasi Anda" },
  { icon: FileText,  label: "Generator Dokumen", href: "/doc-generator", desc: "Buat dokumen penawaran otomatis" },
  { icon: FolderOpen,label: "Dashboard Proyek",  href: "/projects",      desc: "Kelola progres & tim proyek aktif" },
  { icon: DollarSign,label: "Keuangan Proyek",   href: "/financial",     desc: "Arus kas, RAB, dan laporan keuangan" },
  { icon: Wrench,    label: "Sewa Alat",         href: "/equipment",     desc: "Marketplace sewa peralatan konstruksi" },
];

const produkAILinks = [
  { icon: Cpu,           label: "Agent Hub",          href: "/agent-hub",       desc: "Pusat 12 agen AI Gustafta — satu pintu semua fitur", badge: "12 Agen" },
  { icon: Search,        label: "TenderaClaw",         href: "/tendera-claw",    desc: "AI pemindai & strategi tender otomatis" },
  { icon: Award,         label: "SBUClaw",             href: "/sbu-claw",        desc: "Screening & pendampingan SBU berbasis AI" },
  { icon: Scale,         label: "LexCom Hukum",        href: "/lexcom-hukum",    desc: "Analisis dokumen hukum & kontrak konstruksi" },
  { icon: FileText,      label: "AI Dokumen",          href: "/ai-dokumen",      desc: "Tanya jawab cerdas isi dokumen & kontrak" },
  { icon: BriefcaseIcon, label: "Klinik Konsultasi",   href: "/konsultasi",      desc: "Konsultasi bisnis konstruksi dengan AI" },
  { icon: Brain,         label: "Business Memory",     href: "/business-memory", desc: "Memori bisnis & jejak keputusan strategis" },
];

const toolkitLinks = [
  { icon: FileText,      label: "Generator Dokumen",     href: "/doc-generator",      desc: "Buat dokumen penawaran & kontrak otomatis" },
  { icon: Search,        label: "Peluang Tender",         href: "/opportunities",      desc: "Temukan tender sesuai kualifikasi Anda" },
  { icon: BookOpen,      label: "Bimtek SKK",             href: "/bimtek-skk",         desc: "Bimbingan teknis & modul latihan sertifikasi SKK" },
  { icon: GraduationCap, label: "Eksekutif Summary SKK",  href: "/eksekutif-summary",  desc: "Susun SKPK, PKB, dan perpanjangan SKK Jenjang 7–9" },
  { icon: DollarSign,    label: "Keuangan Proyek",        href: "/financial",          desc: "Arus kas, RAB, dan laporan keuangan proyek" },
  { icon: DollarSign,    label: "Keuangan & Perpajakan",  href: "/keuangan-pajak",     desc: "PPh konstruksi, PPN, SPT, dan rekonsiliasi kontrak" },
  { icon: Wrench,        label: "Sewa Alat",              href: "/equipment",          desc: "Marketplace sewa peralatan konstruksi" },
  { icon: FolderOpen,    label: "Dashboard Proyek",       href: "/projects",           desc: "Kelola progres, tim, dan dokumen proyek aktif" },
];

const mitraLinks = [
  { icon: Users,         label: "Freelance Board",       href: "/workroom",             desc: "Marketplace talenta & proyek freelance konstruksi" },
  { icon: ShoppingBag,   label: "Toko Digital",           href: "/toko",                 desc: "eBook, template, kursus & paket produk digital" },
  { icon: GraduationCap, label: "Ekosistem Kompetensi",   href: "/ekosistem-kompetensi", desc: "Jaringan pelatihan & sertifikasi konstruksi" },
  { icon: Zap,           label: "KonstruksiAI Portal",    href: "/konstruksi-ai",        desc: "Portal informasi & berita konstruksi Indonesia berbasis AI" },
  { icon: Briefcase,     label: "Layanan PT. SKI",        href: "/layanan-ski",          desc: "Semua layanan PT. Sarana Kompetensi Indonesia" },
  { icon: Handshake,     label: "Program Mitra",          href: "/layanan-ski",          desc: "Bergabung sebagai mitra resmi DokumenProyek.com" },
];

/* ── Dropdown item ────────────────────────────── */
function DropItem({
  icon: Icon, label, desc, href, badge,
}: {
  icon: React.ElementType; label: string; desc: string; href: string; badge?: string;
}) {
  const [, navigate] = useLocation();
  return (
    <NavigationMenuLink asChild>
      <button
        onClick={() => navigate(href)}
        className="flex items-start gap-2.5 rounded-lg p-2.5 w-full text-left hover:bg-slate-50 transition-colors group"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 leading-tight">
            {label}
            {badge && <Badge className="bg-amber-400 text-slate-900 text-[9px] h-3.5 px-1">{badge}</Badge>}
          </span>
          <span className="text-[11px] text-slate-500 leading-snug">{desc}</span>
        </span>
      </button>
    </NavigationMenuLink>
  );
}

/* ── Navbar ───────────────────────────────────── */
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Pengguna";
  const initials    = displayName.substring(0, 2).toUpperCase();

  const base = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    isScrolled ? "bg-white shadow-md border-b border-slate-200" : "bg-slate-900"
  );

  /* Shared trigger style for NavigationMenuTrigger */
  const triggerCls = cn(
    "h-10 px-4 text-sm font-semibold rounded-md bg-transparent transition-colors",
    isScrolled
      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100"
      : "text-white/90 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10"
  );

  const divider = isScrolled ? "border-slate-200" : "border-white/10";

  return (
    <nav className={base}>
      {/* ── ROW 1 : Logo + utility buttons ── */}
      <div className={cn("border-b", divider)}>
        <div className="container flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            <img
              src="/logo-full.png"
              alt="DokumenProyek.com"
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className={cn(
              "hidden sm:block text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border",
              isScrolled
                ? "text-amber-600 border-amber-300 bg-amber-50"
                : "text-amber-300 border-amber-500/40 bg-amber-500/10"
            )}>BY GUSTAFTA</span>
          </Link>

          {/* Desktop: utility buttons row 1 */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => navigate("/agent-hub")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-7 rounded text-[11px] font-semibold border transition-colors",
                isScrolled
                  ? "border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100"
                  : "border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
              )}
              data-testid="button-agent-hub-navbar"
            >
              <Cpu className="w-3 h-3" />
              OpenClaw AI
              <Badge className="bg-amber-400 text-slate-900 text-[8px] h-3 px-1 ml-0.5">NEW</Badge>
            </button>

            <button
              onClick={() => navigate("/verify")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-7 rounded text-[11px] font-semibold border transition-colors",
                isScrolled
                  ? "border-slate-300 text-slate-500 hover:bg-slate-50"
                  : "border-white/25 text-white/75 bg-white/5 hover:bg-white/10"
              )}
              data-testid="button-verify-navbar"
            >
              <Shield className="w-3 h-3" />
              Verifikasi
            </button>

            {/* Dark / light toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Mode Terang" : "Mode Gelap"}
              className={cn(
                "inline-flex items-center justify-center h-7 w-7 rounded border transition-colors",
                isScrolled
                  ? "border-slate-300 text-slate-500 hover:bg-slate-100"
                  : "border-white/25 text-white/75 bg-white/5 hover:bg-white/10"
              )}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"
                  className={cn("h-8 w-8", isScrolled ? "text-slate-700" : "text-white")}>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[290px] overflow-y-auto">
                <MobileDrawer
                  user={user} isLoading={isLoading} displayName={displayName}
                  initials={initials} logout={logout} navigate={navigate}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── ROW 2 : Nav menu + auth ── */}
      <div className="hidden lg:block">
        <div className="container flex items-center h-10">

          <div className="flex-1" />
          {/* Navigation dropdowns — centered */}
          <NavigationMenu>
            <NavigationMenuList className="gap-0">

              <NavigationMenuItem>
                <NavigationMenuTrigger className={triggerCls}>Layanan</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 gap-0.5 p-2.5 w-[500px]">
                    <p className="col-span-2 px-2.5 pb-1 pt-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Layanan Sertifikasi & Legalitas
                    </p>
                    {layananLinks.map((l) => <DropItem key={l.href} {...l} />)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(triggerCls,
                  isScrolled ? "text-amber-600" : "text-amber-300"
                )}>
                  <Zap className="h-3 w-3 mr-1" />
                  Gustafta AI
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-2.5 w-[640px] max-w-[calc(100vw-2rem)] overflow-hidden">
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0 min-w-0">
                      {gustaaftaGroups.map((group) => (
                        <div key={group.title} className="min-w-0">
                          <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest truncate">
                            {group.title}
                          </p>
                          {group.links.map((l) => <DropItem key={l.href} {...l} />)}
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={triggerCls}>Proyek & Tender</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-1 gap-0.5 p-2.5 w-[280px]">
                    <p className="px-2.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Manajemen Proyek
                    </p>
                    {proyekLinks.map((l) => <DropItem key={l.href} {...l} />)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(triggerCls,
                  isScrolled ? "text-blue-600" : "text-blue-300"
                )}>
                  <Bot className="h-3.5 w-3.5 mr-1.5" />
                  Produk AI
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 gap-0.5 p-2.5 w-[500px]">
                    <p className="col-span-2 px-2.5 pb-1 pt-0.5 text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                      Produk AI — Gustafta Platform
                    </p>
                    {produkAILinks.map((l) => <DropItem key={l.href} {...l} />)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={triggerCls}>
                  <Wrench className="h-3.5 w-3.5 mr-1.5" />
                  Toolkit
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-1 gap-0.5 p-2.5 w-[280px]">
                    <p className="px-2.5 pb-1 pt-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Alat & Utilitas Platform
                    </p>
                    {toolkitLinks.map((l) => <DropItem key={l.href} {...l} />)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(triggerCls,
                  isScrolled ? "text-emerald-600" : "text-emerald-300"
                )}>
                  <Handshake className="h-3.5 w-3.5 mr-1.5" />
                  Mitra
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-1 gap-0.5 p-2.5 w-[320px]">
                    <p className="px-2.5 pb-1 pt-0.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                      Ekosistem & Kemitraan
                    </p>
                    {mitraLinks.map((l) => <DropItem key={l.href} {...l} />)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex-1 flex justify-end">
          {/* Auth */}
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate("/")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 h-7 rounded text-[11px] font-semibold transition-colors",
                    isScrolled ? "bg-primary text-white hover:bg-primary/90" : "bg-white text-slate-900 hover:bg-white/90"
                  )}
                  data-testid="button-dashboard-navbar"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  Dashboard
                </button>
                <Avatar className="h-6 w-6 cursor-pointer" data-testid="avatar-user-navbar">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className={cn(
                    "text-[9px] font-bold",
                    isScrolled ? "bg-primary text-white" : "bg-white/20 text-white"
                  )}>{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => logout()}
                  className={cn(
                    "flex items-center justify-center h-6 w-6 rounded transition-colors",
                    isScrolled ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                  data-testid="button-logout-navbar"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => (window.location.href = "/api/login")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 h-7 rounded text-[11px] font-bold shadow-sm transition-colors",
                  isScrolled ? "bg-primary text-white hover:bg-primary/90" : "bg-white text-slate-900 hover:bg-white/90"
                )}
                data-testid="button-login-navbar"
              >
                Masuk / Daftar
              </button>
            )
          )}
          </div>{/* /auth flex-1 */}
        </div>
      </div>
    </nav>
  );
}

/* ── Mobile drawer ─────────────────────────────── */
function MobileDrawer({
  user, isLoading, displayName, initials, logout, navigate,
}: {
  user: any; isLoading: boolean; displayName: string; initials: string;
  logout: () => void; navigate: (p: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 mt-5">
      {user && (
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      )}

      <MobileSection title="Layanan Sertifikasi & Legalitas">
        {layananLinks.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} />)}
      </MobileSection>

      {gustaaftaGroups.map((group) => (
        <MobileSection key={group.title} title={`Gustafta · ${group.title}`} accent>
          {group.links.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} badge={l.badge} />)}
        </MobileSection>
      ))}

      <MobileSection title="Proyek & Tender">
        {proyekLinks.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} />)}
      </MobileSection>

      <div className="flex flex-col gap-2 mt-3 pt-3 border-t">
        <Button variant="outline" className="w-full justify-start gap-2 text-xs h-8"
          onClick={() => navigate("/verify")} data-testid="button-verify-mobile">
          <Shield className="w-3.5 h-3.5" /> Verifikasi Dokumen
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 text-xs h-8 border-amber-300 text-amber-600"
          onClick={() => navigate("/agent-hub")} data-testid="button-agenthub-mobile">
          <Cpu className="w-3.5 h-3.5" /> OpenClaw AI Hub
        </Button>
        <ThemeToggleMobile />
        {!isLoading && (user ? (
          <>
            <Button className="w-full justify-start gap-2 text-xs h-8"
              onClick={() => navigate("/")} data-testid="button-dashboard-mobile">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard Saya
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs h-8 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => logout()} data-testid="button-logout-mobile">
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </Button>
          </>
        ) : (
          <Button className="w-full gap-2 text-xs font-bold h-8"
            onClick={() => (window.location.href = "/api/login")} data-testid="button-login-mobile">
            Masuk / Daftar
          </Button>
        ))}
      </div>
    </div>
  );
}

function MobileSection({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className={cn("px-3 py-1 text-[9px] font-bold uppercase tracking-widest",
        accent ? "text-amber-500" : "text-slate-400")}>{title}</p>
      <div className="flex flex-col gap-0">{children}</div>
    </div>
  );
}

function MobileLink({ icon: Icon, label, href, navigate, badge }: {
  icon: React.ElementType; label: string; href: string;
  navigate: (p: string) => void; badge?: string;
}) {
  return (
    <button onClick={() => navigate(href)}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition-colors">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <span className="font-medium">{label}</span>
      {badge && <Badge className="ml-auto bg-amber-400 text-slate-900 text-[8px] h-3.5 px-1">{badge}</Badge>}
    </button>
  );
}

function ThemeToggleMobile() {
  const { isDark, toggle } = useTheme();
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2 text-xs h-8"
      onClick={toggle}
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {isDark ? "Mode Terang" : "Mode Gelap"}
    </Button>
  );
}
