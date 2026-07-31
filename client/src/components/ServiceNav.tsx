import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Globe,
  Award,
  GraduationCap,
  ShieldCheck,
  FileText,
  FolderOpen,
  Zap,
  BookMarked,
  Cpu,
  ChevronUp,
  X,
  Stethoscope,
  FileSearch,
  Search,
  Scale,
  BookOpen,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", short: "Home", color: "text-slate-600" },
  { href: "/legalitas", icon: Building2, label: "Legalitas", short: "Legal", color: "text-slate-600" },
  { href: "/oss-rba", icon: Globe, label: "Perizinan", short: "Izin", color: "text-blue-600" },
  { href: "/sbu", icon: Award, label: "SBU", short: "SBU", color: "text-amber-600" },
  { href: "/skk", icon: GraduationCap, label: "SKK", short: "SKK", color: "text-purple-600" },
  { href: "/iso-smk3", icon: ShieldCheck, label: "ISO/SMK3", short: "ISO", color: "text-emerald-600" },
  { href: "/tender-generator", icon: FileText, label: "Tender", short: "Tender", color: "text-green-600" },
  { href: "/proyek", icon: FolderOpen, label: "Proyek", short: "Proyek", color: "text-orange-600" },
  { href: "/mini-apps", icon: Zap, label: "Mini Apps", short: "Apps", color: "text-teal-600" },
  { href: "/doc-generator", icon: BookMarked, label: "Generator", short: "Draft", color: "text-rose-600" },
  { href: "/agent-hub", icon: Cpu, label: "AI Hub", short: "AI", color: "text-indigo-600" },
  { href: "/konsultasi", icon: Stethoscope, label: "Konsultasi", short: "Klinik", color: "text-cyan-600" },
  { href: "/ai-dokumen", icon: FileSearch, label: "AI Dokumen", short: "AI Doc", color: "text-violet-600" },
  { href: "/tendera-claw", icon: Search, label: "TenderaClaw", short: "Claw", color: "text-green-600" },
  { href: "/sbu-claw", icon: Award, label: "SBUClaw", short: "SBUClaw", color: "text-amber-600" },
  { href: "/lexcom-hukum", icon: Scale, label: "LexCom", short: "Lex", color: "text-blue-600" },
  { href: "/workroom", icon: FolderOpen, label: "Workroom", short: "Work", color: "text-violet-600" },
  { href: "/kompetensi-hub", icon: BookOpen, label: "KompetensiHub", short: "Komp", color: "text-purple-600" },
  { href: "/askom-coach", icon: Users, label: "ASKOM Coach", short: "ASKOM", color: "text-rose-600" },
  { href: "/multiclaw", icon: Zap, label: "MultiClaw", short: "MClaw", color: "text-yellow-600" },
];

const mobileVisible = [
  { href: "/", icon: LayoutDashboard, label: "Home", color: "text-slate-600" },
  { href: "/tender-generator", icon: FileText, label: "Tender", color: "text-green-600" },
  { href: "/sbu", icon: Award, label: "SBU", color: "text-amber-600" },
  { href: "/agent-hub", icon: Cpu, label: "AI Hub", color: "text-indigo-600" },
];

export function ServiceNav() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowScrollHint(el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      {/* Desktop: Left sidebar — pinned top-to-bottom so it never overflows on short screens */}
      <div className="hidden xl:flex fixed left-0 top-2 bottom-2 z-40 flex-col bg-white/95 backdrop-blur border border-slate-200 rounded-r-2xl shadow-lg">
        <div
          ref={scrollRef}
          className="flex flex-col gap-1 p-2 overflow-y-auto overscroll-contain scrollbar-none flex-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center gap-2 px-2 py-2 rounded-xl transition-all cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                  title={item.label}
                  data-testid={`sidenav-${item.label.toLowerCase().replace(/\//g, "-").replace(/\s/g, "-")}`}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : item.color)} />
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap overflow-hidden transition-all",
                    active ? "max-w-20 opacity-100" : "max-w-0 group-hover:max-w-20 opacity-0 group-hover:opacity-100"
                  )}>
                    {item.label}
                  </span>
                  {active && <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />}
                </div>
              </Link>
            );
          })}
        </div>
        {/* Scroll fade indicator */}
        {showScrollHint && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-br-2xl bg-gradient-to-t from-white/90 to-transparent" />
        )}
      </div>

      {/* Mobile: Bottom navigation (4 main items + expand) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-md border-t border-slate-200 shadow-xl">
        {/* Expanded full nav — max-h so it never pushes the bottom bar off screen on short phones */}
        {expanded && (
          <div className="px-4 pt-4 pb-2 grid grid-cols-4 gap-2 border-b border-slate-100 max-h-[50vh] overflow-y-auto overscroll-contain">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setExpanded(false)}>
                  <div className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer",
                    active ? "bg-primary/10" : "hover:bg-slate-50"
                  )}>
                    <Icon className={cn("w-5 h-5", active ? "text-primary" : item.color)} />
                    <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{item.short}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Main bottom bar */}
        <div className="flex items-center justify-around px-2 h-14">
          {mobileVisible.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer",
                  active ? "text-primary" : "text-slate-400"
                )} data-testid={`bottomnav-${item.label.toLowerCase()}`}>
                  <Icon className={cn("w-5 h-5", active && "text-primary")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
              expanded ? "text-primary bg-primary/10" : "text-slate-400"
            )}
            data-testid="bottomnav-expand"
          >
            <div className={cn("w-5 h-5 flex items-center justify-center transition-transform", expanded && "rotate-180")}>
              <ChevronUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Semua</span>
          </button>
        </div>
      </div>
    </>
  );
}

// RelatedServices component used at bottom of each service page
interface RelatedService {
  href: string;
  icon: any;
  label: string;
  desc: string;
  color: string;
  badge?: string;
}

interface RelatedServicesProps {
  title?: string;
  subtitle?: string;
  services: RelatedService[];
  nextStep?: { href: string; label: string; icon: any };
}

export function RelatedServices({ title = "Layanan Terkait & Langkah Selanjutnya", subtitle, services, nextStep }: RelatedServicesProps) {
  return (
    <div className="border-t border-slate-100 mt-10 pt-8 pb-20 xl:pb-8">
      <div className="text-center mb-6">
        <h3 className="text-slate-800 font-bold text-lg mb-1">{title}</h3>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <Link key={svc.href} href={svc.href}>
              <div className="group flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${svc.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-sm text-slate-800">{svc.label}</h4>
                    {svc.badge && <Badge className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-0">{svc.badge}</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {nextStep && (
        <div className="text-center">
          <Link href={nextStep.href}>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 shadow-lg" data-testid="button-next-step">
              <nextStep.icon className="w-4 h-4" />
              {nextStep.label}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
