import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, Menu, Shield, Cpu, ChevronDown,
  Award, GraduationCap, FileCheck, Landmark, ShieldCheck,
  Zap, Scale, BriefcaseIcon, BookOpen, Brain, Bot, Handshake, Package,
  Search, FolderOpen, FileText, DollarSign, Wrench, Users, Briefcase, ShoppingBag,
  Sun, Moon, MessageCircle, ExternalLink,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const WA_KONSULTASI = "https://wa.me/6282299417818?text=Halo%2C+saya+ingin+konsultasi+layanan+dokumen+di+DokumenProyek.com";

/* ── Menu data ────────────────────────────────── */
const layananLinks = [
  { icon: Building2,     label: "Semua Layanan SKI",   href: "/layanan-ski",       desc: "SBU, SKK, ISO, tender & keuangan — PT. Sarana Kompetensi Indonesia", ext: false },
  { icon: ShoppingBag,   label: "Toko Digital",         href: "/toko",              desc: "eBook, template, kursus & paket produk digital",                     ext: false },
  { icon: Award,         label: "SBU Konstruksi",       href: "/sbu",               desc: "Sertifikat Badan Usaha Jasa Konstruksi",                             ext: false },
  { icon: GraduationCap, label: "SKK & Kompetensi",     href: "/skk",               desc: "Sertifikat Kompetensi Kerja tenaga ahli",                            ext: false },
  { icon: FileCheck,     label: "ISO & SMK3",            href: "/iso-smk3",          desc: "Standar mutu, K3, dan sistem manajemen",                             ext: false },
  { icon: Award,         label: "Manajemen ISO",         href: "/iso-manajemen",     desc: "End-to-end ISO 9001/14001/45001 — gap analysis hingga sertifikasi",  ext: false },
  { icon: Landmark,      label: "Legalitas Usaha",       href: "/legalitas",         desc: "PT, CV, Yayasan, perubahan akta",                                    ext: false },
  { icon: ShieldCheck,   label: "OSS-RBA & Perizinan",   href: "/oss-rba",           desc: "NIB, izin operasional, OSS Risk-Based",                              ext: false },
  { icon: FileCheck,     label: "LKPM",                  href: "/lkpm",              desc: "Laporan Kegiatan Penanaman Modal — triwulan, semesteran, tahunan",   ext: false },
  { icon: BookOpen,      label: "LKUT",                  href: "/lkut",              desc: "Laporan Kegiatan Usaha Tahunan BUJK — deadline 30 April",            ext: false },
  { icon: ShieldCheck,   label: "SMAP & Pancek",         href: "/smap-pancek",       desc: "Sistem Manajemen Anti Penyuapan — ISO 37001 & Panduan KPK",         ext: false },
  { icon: Briefcase,     label: "Jasa Dokumen SKI",      href: "/jasa-dokumen",      desc: "Layanan PT. Sarana Kompetensi Indonesia",                            ext: false },
];

const gustaaftaGroups = [
  {
    title: "CLAW Tools",
    links: [
      { icon: Cpu,           label: "Agent Hub",       href: "/agent-hub",    desc: "Pusat semua agen AI Gustafta",           badge: "12 Agen", ext: false },
      { icon: Search,        label: "TenderaClaw",      href: "/tendera-claw", desc: "Pemindai peluang tender otomatis",                         ext: false },
      { icon: Award,         label: "SBUClaw",          href: "/sbu-claw",     desc: "Screening kelayakan SBU berbasis AI",                      ext: false },
    ],
  },
  {
    title: "AI Analitik & Hukum",
    links: [
      { icon: Scale,         label: "LexCom Hukum",    href: "/lexcom-hukum",    desc: "Analisis dokumen hukum & kontrak",      ext: false },
      { icon: FileText,      label: "AI Dokumen",       href: "/ai-dokumen",      desc: "Tanya jawab cerdas isi dokumen",        ext: false },
      { icon: BriefcaseIcon, label: "Klinik Konsultasi",href: "/konsultasi",      desc: "Konsultasi bisnis konstruksi dengan AI",ext: false },
      { icon: Brain,         label: "Business Memory",  href: "/business-memory", desc: "Memori bisnis & jejak keputusan AI",   ext: false },
    ],
  },
  {
    title: "Akademi & Kompetensi",
    links: [
      { icon: FolderOpen,    label: "Workroom",         href: "/workroom",        desc: "Ruang kerja freelance profesional",     ext: false },
      { icon: BookOpen,      label: "KompetensiHub",    href: "/kompetensi-hub",  desc: "Tracker SKK & roadmap kompetensi",      ext: false },
      { icon: Users,         label: "ASKOM Coach",      href: "/askom-coach",     desc: "Coaching asosiasi konstruksi",          ext: false },
      { icon: GraduationCap, label: "Bimtek SKK",       href: "/bimtek-skk",      desc: "Bimbingan teknis sertifikasi SKK",      ext: false },
    ],
  },
];

const gustaaftaLinks = gustaaftaGroups.flatMap((g) => g.links);

/* Produk AI — semua mengarah ke gustafta.my.id */
const produkAILinks = [
  { icon: Cpu,           label: "Agent Hub",          href: "https://gustafta.my.id/agent-hub",        desc: "Pusat 12 agen AI Gustafta — satu pintu semua fitur", badge: "12 Agen", ext: true },
  { icon: Search,        label: "TenderaClaw",         href: "https://gustafta.my.id/tendera-claw",     desc: "AI pemindai & strategi tender otomatis",                               ext: true },
  { icon: Award,         label: "SBUClaw",             href: "https://gustafta.my.id/sbu-claw",         desc: "Screening & pendampingan SBU berbasis AI",                              ext: true },
  { icon: Scale,         label: "LexCom Hukum",        href: "https://gustafta.my.id/lexcom",           desc: "Analisis dokumen hukum & kontrak konstruksi",                           ext: true },
  { icon: FileText,      label: "AI Dokumen",          href: "https://gustafta.my.id/ai-dokumen",       desc: "Tanya jawab cerdas isi dokumen & kontrak",                              ext: true },
  { icon: BriefcaseIcon, label: "Klinik Konsultasi",   href: "https://gustafta.my.id/klinik-konsultasi",desc: "Konsultasi bisnis konstruksi dengan AI",                                ext: true },
  { icon: Brain,         label: "Business Memory",     href: "https://gustafta.my.id/business-memory",  desc: "Memori bisnis & jejak keputusan strategis",                             ext: true },
];

const toolkitLinks = [
  { icon: FileText,      label: "Generator Dokumen",     href: "/doc-generator",     desc: "Buat dokumen penawaran & kontrak otomatis",          ext: false },
  { icon: Search,        label: "Peluang Tender",         href: "https://gustafta.my.id/tender", desc: "Temukan tender sesuai kualifikasi Anda",      ext: true  },
  { icon: BookOpen,      label: "Bimtek SKK",             href: "/bimtek-skk",        desc: "Bimbingan teknis & modul latihan sertifikasi SKK",   ext: false },
  { icon: GraduationCap, label: "Eksekutif Summary SKK",  href: "/eksekutif-summary", desc: "Susun SKPK, PKB, dan perpanjangan SKK Jenjang 7–9", ext: false },
  { icon: DollarSign,    label: "Keuangan & Perpajakan",  href: "/keuangan-pajak",    desc: "PPh konstruksi, PPN, SPT, dan rekonsiliasi kontrak", ext: false },
  { icon: Wrench,        label: "Sewa Alat",              href: "/equipment",         desc: "Marketplace sewa peralatan konstruksi",              ext: false },
  { icon: BookOpen,      label: "LKUT Simulator",         href: "/lkut-simulator",    desc: "Uji kesiapan BUJK dalam pemenuhan LKUT",             ext: false },
];

const mitraLinks = [
  { icon: ShoppingBag,   label: "Gaia Store",             href: "/gaia-store",           desc: "Produk digital konstruksi by Gustafta",              ext: false },
  { icon: FolderOpen,    label: "Gaia SIAP",              href: "/gaia-siap",            desc: "Workspace & klinik konsultasi by Gustafta",          ext: false },
  { icon: Users,         label: "Ekosistem Kompetensi",   href: "/ekosistem-kompetensi", desc: "Jaringan pelatihan & sertifikasi konstruksi",        ext: false },
  { icon: Zap,           label: "KonstruksiAI Portal",    href: "/konstruksi-ai",        desc: "Portal informasi & berita konstruksi berbasis AI",   ext: false },
  { icon: Briefcase,     label: "Layanan PT. SKI",        href: "/layanan-ski",          desc: "Semua layanan PT. Sarana Kompetensi Indonesia",      ext: false },
  { icon: Handshake,     label: "Platform Gustafta",      href: "https://gustafta.my.id",desc: "Platform AI lengkap untuk konstruksi Indonesia",     ext: true  },
];

/* ── Dropdown item ────────────────────────────── */
function DropItem({
  icon: Icon, label, desc, href, badge, ext,
}: {
  icon: React.ElementType; label: string; desc: string; href: string; badge?: string; ext?: boolean;
}) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (ext) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(href);
    }
  };

  return (
    <NavigationMenuLink asChild>
      <button
        onClick={handleClick}
        className="flex items-start gap-2.5 rounded-lg p-2.5 w-full text-left hover:bg-slate-50 transition-colors group"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 leading-tight">
            {label}
            {badge && <Badge className="bg-amber-400 text-slate-900 text-[9px] h-3.5 px-1">{badge}</Badge>}
            {ext && <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-auto shrink-0" />}
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
  const [, navigate] = useLocation();
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const base = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    isScrolled ? "bg-white shadow-md border-b border-slate-200" : "bg-slate-900"
  );

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
            {/* Gustafta platform link */}
            <a
              href="https://gustafta.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-7 rounded text-[11px] font-semibold border transition-colors",
                isScrolled
                  ? "border-violet-300 text-violet-600 bg-violet-50 hover:bg-violet-100"
                  : "border-violet-500/50 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20"
              )}
            >
              <Zap className="w-3 h-3" />
              gustafta.my.id
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>

            <button
              onClick={() => navigate("/verify")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-7 rounded text-[11px] font-semibold border transition-colors",
                isScrolled
                  ? "border-slate-300 text-slate-500 hover:bg-slate-50"
                  : "border-white/25 text-white/75 bg-white/5 hover:bg-white/10"
              )}
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
                <MobileDrawer navigate={navigate} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── ROW 2 : Nav menu + WA CTA ── */}
      <div className="hidden lg:block">
        <div className="container flex items-center h-10">

          <div className="flex-1" />

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
                    <div className="mt-2 mx-1 p-2.5 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-between">
                      <span className="text-xs text-violet-700 font-semibold">Akses penuh semua fitur di platform Gustafta</span>
                      <a href="https://gustafta.my.id" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800">
                        gustafta.my.id <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
                      Produk AI — Tersedia di gustafta.my.id
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
                      Alat & Utilitas
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

          {/* ── WA Konsultasi CTA (replaces login button) ── */}
          <div className="flex-1 flex justify-end">
            <a href={WA_KONSULTASI} target="_blank" rel="noopener noreferrer">
              <button className={cn(
                "inline-flex items-center gap-1.5 px-4 h-7 rounded text-[11px] font-bold shadow-sm transition-colors",
                isScrolled
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-500 text-white hover:bg-green-600"
              )}>
                <MessageCircle className="w-3 h-3" />
                Konsultasi Gratis
              </button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ── Mobile drawer ─────────────────────────────── */
function MobileDrawer({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="flex flex-col gap-1 mt-5">

      {/* WA CTA prominent */}
      <a href={WA_KONSULTASI} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-4 py-3 mb-3 transition-colors">
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Konsultasi Gratis via WhatsApp</span>
      </a>

      {/* Gustafta platform link */}
      <a href="https://gustafta.my.id" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 bg-violet-600/10 border border-violet-400/30 hover:bg-violet-600/20 text-violet-700 font-semibold rounded-xl px-4 py-2.5 mb-2 transition-colors">
        <Zap className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs">Platform AI kami: gustafta.my.id</span>
        <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-60" />
      </a>

      <MobileSection title="Layanan Sertifikasi & Legalitas">
        {layananLinks.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} ext={l.ext} />)}
      </MobileSection>

      {gustaaftaGroups.map((group) => (
        <MobileSection key={group.title} title={`Gustafta · ${group.title}`} accent>
          {group.links.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} badge={l.badge} ext={l.ext} />)}
        </MobileSection>
      ))}

      <MobileSection title="Produk AI (gustafta.my.id)" accent>
        {produkAILinks.slice(0, 4).map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} badge={l.badge} ext={l.ext} />)}
      </MobileSection>

      <MobileSection title="Toolkit">
        {toolkitLinks.map((l) => <MobileLink key={l.href} icon={l.icon} label={l.label} href={l.href} navigate={navigate} ext={l.ext} />)}
      </MobileSection>

      <div className="flex flex-col gap-2 mt-3 pt-3 border-t">
        <Button variant="outline" className="w-full justify-start gap-2 text-xs h-8"
          onClick={() => navigate("/verify")}>
          <Shield className="w-3.5 h-3.5" /> Verifikasi Dokumen
        </Button>
        <ThemeToggleMobile />
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

function MobileLink({ icon: Icon, label, href, navigate, badge, ext }: {
  icon: React.ElementType; label: string; href: string;
  navigate: (p: string) => void; badge?: string; ext?: boolean;
}) {
  const handleClick = () => {
    if (ext) window.open(href, "_blank", "noopener,noreferrer");
    else navigate(href);
  };

  return (
    <button onClick={handleClick}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 w-full text-left transition-colors">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <span className="font-medium">{label}</span>
      {badge && <Badge className="ml-auto bg-amber-400 text-slate-900 text-[8px] h-3.5 px-1">{badge}</Badge>}
      {ext && !badge && <ExternalLink className="ml-auto h-2.5 w-2.5 text-slate-300 shrink-0" />}
    </button>
  );
}

function ThemeToggleMobile() {
  const { isDark, toggle } = useTheme();
  return (
    <Button variant="outline" className="w-full justify-start gap-2 text-xs h-8" onClick={toggle}>
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {isDark ? "Mode Terang" : "Mode Gelap"}
    </Button>
  );
}
