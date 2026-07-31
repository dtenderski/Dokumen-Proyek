import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SmartSearch } from "@/components/SmartSearch";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Shield, 
  LayoutDashboard, 
  HardHat, 
  DollarSign, 
  Recycle,
  Briefcase,
  ShoppingCart,
  Truck,
  Users,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  ExternalLink,
  BarChart3,
  Award,
  GraduationCap,
  FolderOpen,
  ShieldCheck,
  UserCheck,
  Cpu,
  ClipboardList,
  BadgeCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  BookMarked,
  Zap,
  Activity,
  Download,
  Smartphone,
  Stethoscope,
  Brain,
  Scale,
  ClipboardCheck,
  Target
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { usePWAInstall } from "@/components/PWAInstallPrompt";
import type { Opportunity, Product, UserProfile, Project, TenderDocument, Consultation } from "@shared/schema";

const moduleLinks: Record<string, string> = {
  "Legalitas": "/legalitas",
  "Legalitas Usaha": "/legalitas",
  "Perizinan": "/oss-rba",
  "Perizinan & OSS-RBA": "/oss-rba",
  "SBU": "/sbu",
  "SBU Konsultan": "/sbu",
  "Sertifikasi SBU": "/sbu",
  "Verifikasi SBU": "/verify",
  "SKK": "/skk",
  "Sertifikasi SKK": "/skk",
  "ISO": "/iso-smk3",
  "SMK3": "/iso-smk3",
  "ISO & SMK3": "/iso-smk3",
  "Tender": "/tender-generator",
  "Dok. Tender": "/tender-generator",
  "Dokumen Tender": "/tender-generator",
  "Proyek": "/proyek",
  "Dok. Proyek": "/proyek",
  "Dokumen Proyek": "/proyek",
  "Dok. Kontrak": "/proyek",
  "Dok. Penawaran": "/tender-generator",
  "Laporan": "/projects",
  "Mini Apps": "/mini-apps",
  "Kalkulator": "/mini-apps",
  "Generator Dokumen": "/doc-generator",
  "Doc Generator": "/doc-generator",
  "Surat Penawaran": "/doc-generator",
  "Template Dokumen": "/doc-generator",
  "AI Hub": "/agent-hub",
  "MultiClaw": "/multiclaw",
  "TKDN & LPSE": "/ai-chat",
  "Panduan TKDN": "/ai-chat",
  "Addendum & Force Majeure": "/ai-chat",
  "Izin Bangunan": "/oss-rba",
  "Cari Kontraktor": "/verify",
  "Riwayat Dokumen": "/doc-generator",
  "Riwayat": "/doc-generator",
};

const coreServices = [
  { icon: Building2, label: "Legalitas Usaha", description: "PT, CV, NIB, NPWP", color: "bg-slate-600", link: "/legalitas" },
  { icon: ShieldCheck, label: "Perizinan & OSS-RBA", description: "SIUJK, IUJK, NIB, OSS", color: "bg-blue-600", link: "/oss-rba" },
  { icon: Award, label: "Sertifikasi SBU", description: "SBU Kontraktor & Konsultan", color: "bg-amber-500", link: "/sbu" },
  { icon: GraduationCap, label: "Sertifikasi SKK", description: "Tenaga Ahli & Terampil", color: "bg-purple-600", link: "/skk" },
  { icon: FileText, label: "Dokumen Tender", description: "Penawaran, BOQ, RAB", color: "bg-green-600", link: "/tender-generator" },
  { icon: FolderOpen, label: "Dokumen Proyek", description: "Kontrak, BA, Laporan", color: "bg-orange-600", link: "/proyek" },
  { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools instan", color: "bg-teal-600", link: "/mini-apps" },
  { icon: BookMarked, label: "Generator Dokumen", description: "11 template siap pakai", color: "bg-rose-600", link: "/doc-generator" },
];

const modulesByStakeholder: Record<string, Array<{icon: any, label: string, description: string, color: string}>> = {
  kontraktor: [
    { icon: Building2, label: "Legalitas", description: "PT/CV & NIB usaha", color: "bg-slate-600" },
    { icon: ShieldCheck, label: "Perizinan", description: "SIUJK, OSS-RBA PP 28/2025", color: "bg-blue-600" },
    { icon: Award, label: "SBU", description: "Perpres 46/2025 compliant", color: "bg-amber-500" },
    { icon: FileText, label: "Tender", description: "TKDN, LPSE, Evaluasi Penawaran", color: "bg-green-600" },
    { icon: FolderOpen, label: "Proyek", description: "Kontrak, Addendum, Force Majeure", color: "bg-orange-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools instan", color: "bg-teal-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "11 template siap pakai", color: "bg-rose-600" },
    { icon: Cpu, label: "AI Hub", description: "OpenClaw multi-agent AI", color: "bg-indigo-600" },
  ],
  konsultan: [
    { icon: Building2, label: "Legalitas", description: "PT/CV & NIB usaha", color: "bg-slate-600" },
    { icon: Award, label: "SBU Konsultan", description: "SBU Perencana & Pengawas", color: "bg-amber-500" },
    { icon: GraduationCap, label: "SKK", description: "Sertifikat tenaga ahli", color: "bg-purple-600" },
    { icon: FileText, label: "Dok. Tender", description: "KAK & penawaran konsultan", color: "bg-green-600" },
    { icon: FolderOpen, label: "Dok. Proyek", description: "Laporan & berita acara", color: "bg-orange-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "9 template siap pakai", color: "bg-rose-600" },
    { icon: Cpu, label: "AI Hub", description: "OpenClaw multi-agent", color: "bg-indigo-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools instan", color: "bg-teal-600" },
  ],
  vendor: [
    { icon: Building2, label: "Legalitas", description: "Legalitas badan usaha", color: "bg-slate-600" },
    { icon: ShieldCheck, label: "Perizinan", description: "Izin usaha & operasional", color: "bg-blue-600" },
    { icon: FileText, label: "Dok. Penawaran", description: "Dokumen penawaran harga", color: "bg-green-600" },
    { icon: FolderOpen, label: "Dok. Kontrak", description: "Kontrak & perjanjian", color: "bg-orange-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "Buat dokumen instan", color: "bg-rose-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools", color: "bg-teal-600" },
    { icon: Cpu, label: "AI Hub", description: "Bantuan AI untuk dokumen", color: "bg-indigo-600" },
    { icon: ClipboardList, label: "Riwayat Dokumen", description: "Semua dokumen Anda", color: "bg-slate-500" },
  ],
  supplier: [
    { icon: Building2, label: "Legalitas", description: "Legalitas badan usaha", color: "bg-slate-600" },
    { icon: ShieldCheck, label: "Perizinan", description: "Izin usaha & distribusi", color: "bg-blue-600" },
    { icon: FileText, label: "Dok. Penawaran", description: "Penawaran supply material", color: "bg-green-600" },
    { icon: FolderOpen, label: "Dok. Kontrak", description: "Perjanjian supply & MoU", color: "bg-orange-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "Buat dokumen instan", color: "bg-rose-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools", color: "bg-teal-600" },
    { icon: Cpu, label: "AI Hub", description: "Bantuan AI untuk dokumen", color: "bg-indigo-600" },
    { icon: ClipboardList, label: "Riwayat Dokumen", description: "Semua dokumen Anda", color: "bg-slate-500" },
  ],
  tenaga_kerja: [
    { icon: GraduationCap, label: "Sertifikasi SKK", description: "Tenaga Ahli & Terampil", color: "bg-purple-600" },
    { icon: BadgeCheck, label: "Portofolio", description: "Sertifikat & pengalaman", color: "bg-blue-600" },
    { icon: FileText, label: "Dok. Kontrak", description: "Kontrak kerja & BAST", color: "bg-green-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "Buat dokumen instan", color: "bg-rose-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator & tools", color: "bg-teal-600" },
    { icon: Cpu, label: "AI Hub", description: "Bantuan AI & konsultasi", color: "bg-indigo-600" },
    { icon: ClipboardList, label: "Riwayat", description: "History proyek & dokumen", color: "bg-slate-500" },
    { icon: UserCheck, label: "Profil Ahli", description: "Update CV & keahlian", color: "bg-amber-500" },
  ],
  masyarakat: [
    { icon: Building2, label: "Cari Kontraktor", description: "BUJK terverifikasi", color: "bg-slate-600" },
    { icon: FileText, label: "Dok. Kontrak", description: "Kontrak konstruksi", color: "bg-green-600" },
    { icon: Award, label: "Verifikasi SBU", description: "Cek legalitas kontraktor", color: "bg-amber-500" },
    { icon: FolderOpen, label: "Dok. Proyek", description: "Pantau progress proyek", color: "bg-orange-600" },
    { icon: BookMarked, label: "Generator Dokumen", description: "Buat dokumen instan", color: "bg-rose-600" },
    { icon: Zap, label: "Mini Apps", description: "Kalkulator konstruksi", color: "bg-teal-600" },
    { icon: Cpu, label: "AI Hub", description: "Konsultasi via AI", color: "bg-indigo-600" },
    { icon: ShieldCheck, label: "Izin Bangunan", description: "Panduan perizinan", color: "bg-blue-600" },
  ],
};

const defaultModules = coreServices;

const welcomeMessages: Record<string, string> = {
  kontraktor: "Kelola dokumen legalitas, SBU, tender, dan proyek Anda dalam satu platform",
  konsultan: "Urus SBU konsultan, SKK tenaga ahli, dan dokumen pengawasan proyek Anda",
  vendor: "Kelola legalitas usaha dan dokumen penawaran Anda dengan mudah",
  supplier: "Siapkan dokumen legalitas dan kontrak supply material Anda",
  tenaga_kerja: "Urus SKK, portofolio, dan dokumen kerja profesional Anda",
  masyarakat: "Temukan kontraktor terverifikasi dan konsultasi dokumen proyek Anda",
};

const quickActionsByStakeholder: Record<string, Array<{icon: any, label: string, testId: string}>> = {
  kontraktor: [
    { icon: Award, label: "Urus SBU Baru", testId: "button-apply-sbu" },
    { icon: FileText, label: "Siapkan Dokumen Tender", testId: "button-create-tender-doc" },
    { icon: Search, label: "Cek TKDN & Panduan LPSE", testId: "button-check-tkdn" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
  konsultan: [
    { icon: Award, label: "Urus SBU Konsultan", testId: "button-apply-sbu-consultant" },
    { icon: GraduationCap, label: "Daftarkan SKK Ahli", testId: "button-apply-skk" },
    { icon: FileText, label: "Buat Dok. Penawaran", testId: "button-create-offer-doc" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
  vendor: [
    { icon: Building2, label: "Urus Legalitas Usaha", testId: "button-apply-legal" },
    { icon: FileText, label: "Buat Dok. Penawaran", testId: "button-create-offer-doc" },
    { icon: FolderOpen, label: "Siapkan Kontrak", testId: "button-create-contract" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
  supplier: [
    { icon: Building2, label: "Urus Legalitas Usaha", testId: "button-apply-legal" },
    { icon: FileText, label: "Buat Dok. Penawaran", testId: "button-create-offer-doc" },
    { icon: FolderOpen, label: "Siapkan MoU Supply", testId: "button-create-mou" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
  tenaga_kerja: [
    { icon: GraduationCap, label: "Daftar Uji SKK", testId: "button-apply-skk" },
    { icon: BadgeCheck, label: "Upload Sertifikat", testId: "button-upload-cert" },
    { icon: FileText, label: "Buat Dok. Kontrak", testId: "button-create-contract" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
  masyarakat: [
    { icon: Award, label: "Verifikasi Kontraktor", testId: "button-verify-contractor" },
    { icon: FileText, label: "Cek Dok. Tender", testId: "button-check-tender-doc" },
    { icon: ShieldCheck, label: "Info Perizinan", testId: "button-info-permit" },
    { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
  ],
};

const defaultQuickActions = [
  { icon: Award, label: "Urus SBU Konstruksi", testId: "button-apply-sbu" },
  { icon: FileText, label: "Generate Dok. Tender", testId: "button-create-tender-doc" },
  { icon: Building2, label: "Urus Legalitas Usaha", testId: "button-apply-legal" },
  { icon: Cpu, label: "Tanya OpenClaw AI", testId: "button-ask-ai" },
];

const stakeholderLabels: Record<string, string> = {
  kontraktor: "Kontraktor / BUJK",
  konsultan: "Konsultan & Perencana",
  vendor: "Vendor",
  supplier: "Supplier",
  tenaga_kerja: "Tenaga Ahli",
  masyarakat: "Pengguna Jasa",
};

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [ajukanOpen, setAjukanOpen] = useState(false);
  const [ajukanForm, setAjukanForm] = useState({
    layanan: "",
    name: "",
    description: "",
    location: "",
    budget: "",
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tenderDocs = [] } = useQuery<TenderDocument[]>({
    queryKey: ["/api/tender-documents"],
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations/mine"],
    enabled: !!user,
  });

  const { data: memoryEntries = [] } = useQuery<{ id: number; isActive: boolean }[]>({
    queryKey: ["/api/memory"],
    enabled: !!user,
  });

  const activeMemoryCount = (memoryEntries as { id: number; isActive: boolean }[]).filter(e => e.isActive).length;

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; location: string; budget: string; status: string }) => {
      return apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Berhasil!", description: "Layanan berhasil diajukan. Tim kami akan segera menghubungi Anda." });
      setAjukanOpen(false);
      setAjukanForm({ layanan: "", name: "", description: "", location: "", budget: "" });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
    },
  });

  const handleAjukanSubmit = () => {
    if (!ajukanForm.layanan || !ajukanForm.name) {
      toast({ title: "Mohon lengkapi form", description: "Jenis layanan dan nama wajib diisi.", variant: "destructive" });
      return;
    }
    createProjectMutation.mutate({
      name: `[${ajukanForm.layanan}] ${ajukanForm.name}`,
      description: ajukanForm.description || `Pengajuan layanan ${ajukanForm.layanan}`,
      location: ajukanForm.location || "",
      budget: ajukanForm.budget || "",
      status: "planning",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Pengguna";
  const initials = displayName.substring(0, 2).toUpperCase();
  const stakeholderType = profile?.stakeholderType || "";
  const quickAccessModules = modulesByStakeholder[stakeholderType] || defaultModules;
  const welcomeMessage = welcomeMessages[stakeholderType] || "Kelola bisnis konstruksi Anda dalam satu platform terintegrasi";
  const quickActions = quickActionsByStakeholder[stakeholderType] || defaultQuickActions;

  const ongoingProjects = projects.filter((p: Project) => p.status === "ongoing");
  const activeDeadlines = projects.filter((p: Project) => p.status === "planning" || p.status === "ongoing").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">DokumenProyek</span>
          </div>
          
          <div className="flex items-center gap-3">
            <SmartSearch />
            <div className="relative">
              <NotificationCenter />
            </div>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{displayName}</p>
                {profile?.stakeholderType && (
                  <p className="text-xs text-muted-foreground">
                    {stakeholderLabels[profile.stakeholderType] || profile.stakeholderType}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Selamat datang, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            {welcomeMessage}
          </p>
        </div>

        {!profile && (
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Lengkapi Profil Anda</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Isi profil untuk mendapatkan akses penuh ke semua layanan dan fitur platform
                  </p>
                </div>
                <Link href="/setup">
                  <Button className="bg-amber-600 hover:bg-amber-700" data-testid="button-complete-profile">
                    Lengkapi Profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OpenClaw Agent Hub Banner */}
        <Card className="mb-6 overflow-hidden border-0 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-900/30">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    OpenClaw Agent Hub
                    <Badge className="bg-amber-500 text-slate-900 border-0 text-xs">AI ENGINE</Badge>
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    13 Agen Spesialis: Legalitas, Perizinan, SBU, SKK, ISO/SMK3, Tender, Proyek, TKDN & LPSE, Evaluasi Penawaran, Addendum & Force Majeure, Knowledge, Document Review, Sales & Intake
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agent-hub">
                  <Button 
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 shadow-lg shadow-amber-900/20"
                    data-testid="button-open-agent-hub"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Buka Agent Hub
                  </Button>
                </Link>
                <Link href="/ai-chat">
                  <Button 
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    data-testid="button-open-chat"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Chat
                  </Button>
                </Link>
                <Link href="/ai-dokumen">
                  <Button 
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    data-testid="button-open-ai-dokumen"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    AI Dokumen
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Agen Legalitas & Perizinan", "Agen SBU & SKK", "Agen ISO & SMK3", "Agen Tender", "Agen TKDN & LPSE", "Agen Evaluasi Penawaran", "Agen Proyek & Addendum", "Agen Doc Review", "Agen Knowledge", "Agen Sales"].map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/5 text-slate-400 border-slate-700/50 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Banner */}
        {canInstall && !isInstalled && (
          <Card className="mb-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Install Aplikasi DokumenProyek</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Akses lebih cepat, bisa offline, tampilan seperti aplikasi mobile</p>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 flex-shrink-0"
                  onClick={install}
                  data-testid="button-dashboard-install-pwa"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/analytics">
            <Card className="hover-elevate cursor-pointer border-0 bg-gradient-to-r from-violet-500 to-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold">Dashboard Analytics</h3>
                    <p className="text-white/80 text-sm">Visualisasi data bisnis real-time dengan chart dan statistik</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/verify">
            <Card className="hover-elevate cursor-pointer border-0 bg-gradient-to-r from-cyan-500 to-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold">Verifikasi Dokumen</h3>
                    <p className="text-white/80 text-sm">QR Code untuk verifikasi keaslian dokumen tender</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/business-memory">
            <Card className="hover-elevate cursor-pointer border-0 bg-gradient-to-r from-emerald-500 to-teal-600" data-testid="card-business-memory">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      Business Memory
                      {activeMemoryCount > 0 && (
                        <Badge className="bg-white/25 text-white border-0 text-xs">
                          {activeMemoryCount} aktif
                        </Badge>
                      )}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {activeMemoryCount > 0
                        ? `${activeMemoryCount} memory bisnis tersimpan — AI siap memperingatkan`
                        : "Catat riwayat kegagalan & risiko bisnis untuk peringatan AI"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {quickAccessModules.map((mod) => {
            const link = moduleLinks[mod.label];
            const cardContent = (
              <Card 
                key={mod.label} 
                className="hover-elevate cursor-pointer group"
                data-testid={`card-module-${mod.label.toLowerCase()}`}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <mod.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{mod.label}</h3>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                </CardContent>
              </Card>
            );
            return link ? (
              <Link key={mod.label} href={link}>{cardContent}</Link>
            ) : (
              <div key={mod.label}>{cardContent}</div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Case Tracker */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Case Tracker — Status Pengurusan
                  {projects.length > 0 && (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs ml-1">{projects.length} Aktif</Badge>
                  )}
                </CardTitle>
                <Link href="/agent-hub">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-opportunities">
                    Konsultasi AI <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projects.length === 0 && tenderDocs.length === 0 ? (
                  <div className="py-8 text-center">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground font-medium">Belum ada layanan aktif</p>
                    <p className="text-xs text-muted-foreground mt-1">Ajukan layanan pertama Anda untuk mulai tracking</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((proj: Project) => {
                      const statusMap: Record<string, { label: string; color: string }> = {
                        planning: { label: "Perencanaan", color: "bg-amber-100 text-amber-700" },
                        ongoing: { label: "Berjalan", color: "bg-blue-100 text-blue-700" },
                        completed: { label: "Selesai", color: "bg-green-100 text-green-700" },
                        cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
                      };
                      const statusInfo = statusMap[proj.status] || { label: proj.status, color: "bg-slate-100 text-slate-700" };
                      const progress = proj.progress ?? (proj.status === "completed" ? 100 : proj.status === "ongoing" ? 50 : 10);
                      return (
                        <div key={proj.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow" data-testid={`card-case-${proj.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-50 flex-shrink-0 text-orange-600">
                              <FolderOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs text-slate-400 font-mono">PRJ-{String(proj.id).padStart(4, "0")}</span>
                                  <h4 className="font-semibold text-sm truncate">{proj.name}</h4>
                                </div>
                                <Badge className={`text-xs flex-shrink-0 ${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{proj.description || proj.location || "Proyek aktif"}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                  <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-slate-500 flex-shrink-0">{progress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {tenderDocs.slice(0, 2).map((doc: TenderDocument) => (
                      <div key={`td-${doc.id}`} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow" data-testid={`card-case-td-${doc.id}`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-slate-50 flex-shrink-0 text-green-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-slate-400 font-mono">TDR-{String(doc.id).padStart(4, "0")}</span>
                                <h4 className="font-semibold text-sm truncate">{doc.projectName}</h4>
                              </div>
                              <Badge className="text-xs flex-shrink-0 bg-green-100 text-green-700 border-0">
                                {doc.status === "generated" ? "Selesai" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">Dokumen Tender · {doc.projectLocation || doc.companyName || "Penawaran"}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                <div className="bg-green-500 rounded-full h-1.5 transition-all" style={{ width: doc.status === "generated" ? "100%" : "30%" }} />
                              </div>
                              <span className="text-xs text-slate-500 flex-shrink-0">{doc.status === "generated" ? "100%" : "30%"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t flex justify-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 text-xs" data-testid="button-add-opportunity" onClick={() => setAjukanOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> Ajukan Layanan Baru
                  </Button>
                  {projects.length > 0 && (
                    <Link href="/projects">
                      <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all-projects">
                        Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deadline & Renewal Radar */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const upcomingDeadlines: Array<{
                label: string; service: string; due: Date; daysLeft: number; type: "danger" | "warning" | "ok"; icon: any;
              }> = [];
              projects.forEach((p: Project) => {
                if (p.endDate && (p.status === "planning" || p.status === "ongoing")) {
                  const due = new Date(p.endDate);
                  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                  upcomingDeadlines.push({
                    label: p.name,
                    service: "Proyek",
                    due,
                    daysLeft,
                    type: daysLeft <= 14 ? "danger" : daysLeft <= 30 ? "warning" : "ok",
                    icon: FolderOpen,
                  });
                }
              });
              tenderDocs.forEach((doc: TenderDocument) => {
                if (doc.deadline) {
                  const due = new Date(doc.deadline);
                  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                  upcomingDeadlines.push({
                    label: doc.projectName,
                    service: "Dokumen Tender",
                    due,
                    daysLeft,
                    type: daysLeft <= 14 ? "danger" : daysLeft <= 30 ? "warning" : "ok",
                    icon: FileText,
                  });
                }
              });
              upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);
              const colorMap = {
                danger: { badge: "bg-red-100 text-red-700", icon: "text-red-500" },
                warning: { badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
                ok: { badge: "bg-green-100 text-green-700", icon: "text-green-500" },
              };
              return (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Deadline & Renewal Radar
                    </CardTitle>
                    {upcomingDeadlines.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{upcomingDeadlines.length} deadline</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {upcomingDeadlines.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground font-medium">Belum ada deadline tercatat</p>
                        <p className="text-xs text-muted-foreground mt-1">Deadline akan muncul setelah proyek dan dokumen ditambahkan</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingDeadlines.slice(0, 4).map((item, idx) => {
                          const Icon = item.icon;
                          const colors = colorMap[item.type];
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition-shadow" data-testid={`card-deadline-${idx}`}>
                              <div className={`p-2 rounded-lg bg-slate-50 flex-shrink-0 ${colors.icon}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.service} • Jatuh tempo: {item.due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <Badge className={`text-xs border-0 ${colors.badge}`}>
                                  {item.daysLeft <= 0 ? "Lewat" : `${item.daysLeft} hari`}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-end text-xs text-muted-foreground">
                        <Link href="/agent-hub">
                          <Button variant="ghost" size="sm" className="text-xs h-7" data-testid="button-add-product">
                            Tanya AI <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Statistik Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { 
                    label: "Case Aktif", 
                    value: String(projects.filter((p: Project) => p.status === "ongoing" || p.status === "planning").length), 
                    color: "bg-blue-50 text-blue-700", icon: ClipboardList 
                  },
                  { 
                    label: "Dok. Tender Dibuat", 
                    value: String(tenderDocs.length), 
                    color: "bg-green-50 text-green-700", icon: CheckCircle2 
                  },
                  { 
                    label: "Proyek Selesai", 
                    value: String(projects.filter((p: Project) => p.status === "completed").length), 
                    color: "bg-amber-50 text-amber-700", icon: AlertTriangle 
                  },
                  { 
                    label: "Status Profil", 
                    value: profile?.companyName ? "Lengkap" : "Belum", 
                    color: "bg-purple-50 text-purple-700", icon: UserCheck 
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${stat.color.split(' ')[0]}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${stat.color.split(' ')[1]}`} />
                        <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                      </div>
                      <span className={`text-lg font-extrabold ${stat.color.split(' ')[1]}`}>{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Insight Industri */}
            <Card className="bg-slate-900 border-0 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Insight Industri 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Penolakan dok. tender", value: "68%", sub: "karena adm. tidak lengkap (Perpres 46/2025)" },
                  { label: "SBU tidak diperbarui", value: "57%", sub: "melebihi batas tepat waktu (Permen PU 6/2025)" },
                  { label: "Anggaran infrastruktur", value: "Rp 400T", sub: "APBN 2025 — PSN & IKN tetap jalan" },
                  { label: "Regulasi baru 2025", value: "3+", sub: "Perpres 46, Permen PU 6, PP 28/2025" },
                ].map((ins, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800 last:border-0">
                    <div>
                      <p className="text-xs text-slate-400 leading-tight">{ins.label}</p>
                      <p className="text-[10px] text-slate-600">{ins.sub}</p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-400 flex-shrink-0">{ins.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="w-4 h-4 text-primary" />
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: ShieldCheck, label: "Perizinan & OSS-RBA (PP 28/2025)", href: "/oss-rba", testId: "button-action-oss" },
                  { icon: Award, label: "Sertifikasi SBU (Permen PU 6/2025)", href: "/sbu", testId: "button-action-sbu" },
                  { icon: GraduationCap, label: "Urus SKK Tenaga Ahli", href: "/skk", testId: "button-action-skk" },
                  { icon: FileText, label: "Siapkan Dokumen Tender (Perpres 46/2025)", href: "/tender-generator", testId: "button-action-tender" },
                  { icon: Search, label: "Panduan TKDN & Daftar LPSE", href: "/ai-chat", testId: "button-action-tkdn" },
                  { icon: BookMarked, label: "Generator Dokumen (11 Template)", href: "/doc-generator", testId: "button-action-docgen" },
                  { icon: Cpu, label: "Konsultasi OpenClaw AI", href: "/agent-hub", testId: "button-ask-ai" },
                  { icon: BookMarked, label: "Bimtek SKK — Materi, Portofolio & AI Tutor", href: "/bimtek-skk", testId: "button-action-bimtek" },
                  { icon: GraduationCap, label: "Ekosistem Kompetensi — Tracker SKK & SBU", href: "/ekosistem-kompetensi", testId: "button-action-kompetensi" },
                  { icon: Brain, label: "Brain Project — AI Intelligence Proyek Anda", href: "/brain-project", testId: "button-action-brain" },
                  { icon: Stethoscope, label: "Klinik Konsultasi — Buka Kasus & Analisis AI", href: "/konsultasi", testId: "button-action-klinik" },
                  { icon: FileText, label: "AI Dokumen Query — Tanya Isi Dokumen", href: "/ai-dokumen", testId: "button-action-ai-dokumen" },
                  { icon: ShieldCheck, label: "Mulai ISO / SMK3", href: "/iso-smk3", testId: "button-action-iso" },
                  { icon: Zap, label: "TenderaClaw — AI Pipeline Persiapan Tender", href: "/tendera-claw", testId: "button-action-tendera" },
                  { icon: Scale, label: "LexCom Hukum — AI Asisten Hukum Konstruksi", href: "/lexcom-hukum", testId: "button-action-lexcom" },
                  { icon: Building2, label: "Workroom — Ruang Kerja Bertahap + AI Assist", href: "/workroom", testId: "button-action-workroom" },
                  { icon: Shield, label: "SBUClaw — AI Pipeline Pengajuan SBU", href: "/sbu-claw", testId: "button-action-sbuclaw" },
                  { icon: Target, label: "Kompetensi Hub — Gap Analysis & Roadmap SKK", href: "/kompetensi-hub", testId: "button-action-kompetensihub" },
                  { icon: ClipboardCheck, label: "ASKOM Coach — Pendamping Asesor BNSP", href: "/askom-coach", testId: "button-action-askom" },
                  { icon: Zap, label: "MultiClaw — Intelligence Hub Multi-Sumber", href: "/multiclaw", testId: "button-action-multiclaw" },
                ].map((action) => (
                  <Link key={action.testId} href={action.href}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm h-9" 
                      data-testid={action.testId}
                    >
                      <action.icon className="w-4 h-4 mr-2 text-primary" /> {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Konsultasi Saya */}
        {consultations.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Konsultasi Saya
                  <Badge className="bg-primary/10 text-primary border-0 text-xs ml-1">{consultations.length}</Badge>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">Riwayat Pengajuan</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(consultations as Consultation[]).slice(0, 5).map((c: Consultation) => {
                    const serviceColorMap: Record<string, string> = {
                      legalitas: "bg-slate-100 text-slate-700",
                      perizinan: "bg-blue-100 text-blue-700",
                      sbu: "bg-amber-100 text-amber-700",
                      skk: "bg-purple-100 text-purple-700",
                      iso: "bg-indigo-100 text-indigo-700",
                      proyek: "bg-orange-100 text-orange-700",
                      tender: "bg-green-100 text-green-700",
                    };
                    const statusMap: Record<string, { label: string; color: string }> = {
                      pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700" },
                      in_progress: { label: "Diproses", color: "bg-blue-100 text-blue-700" },
                      completed: { label: "Selesai", color: "bg-green-100 text-green-700" },
                      cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
                    };
                    const statusInfo = statusMap[c.status] || { label: c.status, color: "bg-slate-100 text-slate-700" };
                    const svcColor = serviceColorMap[c.serviceType] || "bg-teal-100 text-teal-700";
                    return (
                      <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border bg-white hover:shadow-sm transition-shadow" data-testid={`card-consultation-${c.id}`}>
                        <div className="p-2 rounded-lg bg-teal-50 flex-shrink-0 text-teal-600">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge className={`text-[10px] border-0 ${svcColor} flex-shrink-0`}>{c.serviceType.toUpperCase()}</Badge>
                              <p className="text-sm font-semibold truncate">{c.name}</p>
                            </div>
                            <Badge className={`text-xs border-0 flex-shrink-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          </div>
                          {c.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.message}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6">
          <ActivityTimeline limit={5} />
        </div>
      </main>

      {/* Dialog Ajukan Layanan Baru */}
      <Dialog open={ajukanOpen} onOpenChange={setAjukanOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Ajukan Layanan Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ajukan-layanan">Jenis Layanan <span className="text-red-500">*</span></Label>
              <Select value={ajukanForm.layanan} onValueChange={(v) => setAjukanForm(f => ({ ...f, layanan: v }))}>
                <SelectTrigger id="ajukan-layanan" data-testid="select-layanan-type">
                  <SelectValue placeholder="Pilih jenis layanan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SBU">Sertifikasi SBU (Permen PU 6/2025)</SelectItem>
                  <SelectItem value="SKK">Sertifikasi SKK (Tenaga Ahli)</SelectItem>
                  <SelectItem value="ISO">Sertifikasi ISO / SMK3</SelectItem>
                  <SelectItem value="Tender">Persiapan Dokumen Tender (Perpres 46/2025)</SelectItem>
                  <SelectItem value="TKDN">Konsultasi TKDN & Panduan LPSE</SelectItem>
                  <SelectItem value="Legalitas">Legalitas (PT/CV/NIB/KBLI)</SelectItem>
                  <SelectItem value="Perizinan">Perizinan (SIUJK/OSS PP 28/2025)</SelectItem>
                  <SelectItem value="Proyek">Dokumen Proyek (Kontrak/BA)</SelectItem>
                  <SelectItem value="Addendum">Addendum Kontrak & Force Majeure</SelectItem>
                  <SelectItem value="Konsultasi">Konsultasi Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ajukan-name">Nama / Judul Pengajuan <span className="text-red-500">*</span></Label>
              <Input
                id="ajukan-name"
                placeholder="Contoh: SBU Gred B — PT Maju Jaya Konstruksi"
                value={ajukanForm.name}
                onChange={(e) => setAjukanForm(f => ({ ...f, name: e.target.value }))}
                data-testid="input-ajukan-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ajukan-location">Kota / Lokasi</Label>
              <Input
                id="ajukan-location"
                placeholder="Contoh: Jakarta, Surabaya, Medan..."
                value={ajukanForm.location}
                onChange={(e) => setAjukanForm(f => ({ ...f, location: e.target.value }))}
                data-testid="input-ajukan-location"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ajukan-desc">Keterangan Tambahan</Label>
              <Textarea
                id="ajukan-desc"
                placeholder="Jelaskan kebutuhan Anda secara singkat..."
                rows={3}
                value={ajukanForm.description}
                onChange={(e) => setAjukanForm(f => ({ ...f, description: e.target.value }))}
                data-testid="input-ajukan-desc"
              />
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 flex items-start gap-2">
                <Activity className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Tim DokumenProyek.com akan menghubungi Anda dalam 1×24 jam untuk konfirmasi dan estimasi biaya & waktu penyelesaian.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjukanOpen(false)} data-testid="button-cancel-ajukan">
              Batal
            </Button>
            <Button
              onClick={handleAjukanSubmit}
              disabled={createProjectMutation.isPending}
              data-testid="button-submit-ajukan"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" /> Ajukan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
