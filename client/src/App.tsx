import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import ProfileSetup from "@/pages/ProfileSetup";
import Opportunities from "@/pages/Opportunities";
import Marketplace from "@/pages/Marketplace";
import TenderGenerator from "@/pages/TenderGenerator";
import ProjectDashboard from "@/pages/ProjectDashboard";
import FinancialModule from "@/pages/FinancialModule";
import EquipmentRental from "@/pages/EquipmentRental";
import AIChat from "@/pages/AIChat";
import Analytics from "@/pages/Analytics";
import DocumentVerification from "@/pages/DocumentVerification";
import AgentHub from "@/pages/AgentHub";
import OSSRBAPage from "@/pages/OSSRBAPage";
import SBUPage from "@/pages/SBUPage";
import SKKPage from "@/pages/SKKPage";
import ISOSMKPage from "@/pages/ISOSMKPage";
import LegalitasPage from "@/pages/LegalitasPage";
import ProyekPage from "@/pages/ProyekPage";
import MiniAppsPage from "@/pages/MiniAppsPage";
import DocGeneratorPage from "@/pages/DocGeneratorPage";
import AIDokumen from "@/pages/AIDokumen";
import KlinikKonsultasi from "@/pages/KlinikKonsultasi";
import BrainProject from "@/pages/BrainProject";
import EkosistemKompetensi from "@/pages/EkosistemKompetensi";
import BimtekSKK from "@/pages/BimtekSKK";
import TenderaClaw from "@/pages/TenderaClaw";
import LexComHukum from "@/pages/LexComHukum";
import Workroom from "@/pages/Workroom";
import SBUClaw from "@/pages/SBUClaw";
import KompetensiHub from "@/pages/KompetensiHub";
import ASKOMCoach from "@/pages/ASKOMCoach";
import MultiClaw from "@/pages/MultiClaw";
import BusinessMemory from "@/pages/BusinessMemory";
import NotFound from "@/pages/not-found";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { Chatbot } from "@/components/Chatbot";
import { ServiceNav } from "@/components/ServiceNav";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import type { UserProfile } from "@shared/schema";
import LoginPage from "@/pages/LoginPage";
import JasaDokumenSKI from "@/pages/JasaDokumenSKI";
import LayananSKI from "@/pages/LayananSKI";
import Toko from "@/pages/Toko";
import LKPMPage from "@/pages/LKPMPage";
import LKUTPage from "@/pages/LKUTPage";
import ISOManajemenPage from "@/pages/ISOManajemenPage";
import SMAPPancekPage from "@/pages/SMAPPancekPage";
import EksekutifSummaryPage from "@/pages/EksekutifSummaryPage";
import KonstruksiAIPage from "@/pages/KonstruksiAIPage";
import KeuanganPajakPage from "@/pages/KeuanganPajakPage";


function AuthenticatedRouter() {
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    if (!profile) {
      return (
        <Switch>
          <Route path="/" component={ProfileSetup} />
          <Route path="/setup" component={ProfileSetup} />
          <Route path="/ai-chat" component={AIChat} />
          <Route path="/ai-dokumen" component={AIDokumen} />
          <Route path="/konsultasi" component={KlinikKonsultasi} />
          <Route path="/brain-project" component={BrainProject} />
          <Route path="/ekosistem-kompetensi" component={EkosistemKompetensi} />
          <Route path="/bimtek-skk" component={BimtekSKK} />
          <Route path="/tendera-claw" component={TenderaClaw} />
          <Route path="/lexcom-hukum" component={LexComHukum} />
          <Route path="/workroom" component={Workroom} />
          <Route path="/sbu-claw" component={SBUClaw} />
          <Route path="/kompetensi-hub" component={KompetensiHub} />
          <Route path="/askom-coach" component={ASKOMCoach} />
          <Route path="/multiclaw" component={MultiClaw} />
          <Route path="/business-memory" component={BusinessMemory} />
          <Route path="/jasa-dokumen" component={JasaDokumenSKI} />
          <Route path="/layanan-ski" component={LayananSKI} />
          <Route path="/toko" component={Toko} />
          <Route component={ProfileSetup} />
        </Switch>
      );
    }
    
    return (
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/setup" component={ProfileSetup} />
        <Route path="/opportunities" component={Opportunities} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/tender-generator" component={TenderGenerator} />
        <Route path="/projects" component={ProjectDashboard} />
        <Route path="/financial" component={FinancialModule} />
        <Route path="/equipment" component={EquipmentRental} />
        <Route path="/ai-chat" component={AIChat} />
        <Route path="/agent-hub" component={AgentHub} />
        <Route path="/oss-rba" component={OSSRBAPage} />
        <Route path="/sbu" component={SBUPage} />
        <Route path="/skk" component={SKKPage} />
        <Route path="/iso-smk3" component={ISOSMKPage} />
        <Route path="/legalitas" component={LegalitasPage} />
        <Route path="/proyek" component={ProyekPage} />
        <Route path="/mini-apps" component={MiniAppsPage} />
        <Route path="/doc-generator" component={DocGeneratorPage} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/verify" component={DocumentVerification} />
        <Route path="/ai-dokumen" component={AIDokumen} />
        <Route path="/konsultasi" component={KlinikKonsultasi} />
        <Route path="/brain-project" component={BrainProject} />
        <Route path="/ekosistem-kompetensi" component={EkosistemKompetensi} />
        <Route path="/bimtek-skk" component={BimtekSKK} />
        <Route path="/tendera-claw" component={TenderaClaw} />
        <Route path="/lexcom-hukum" component={LexComHukum} />
        <Route path="/workroom" component={Workroom} />
        <Route path="/sbu-claw" component={SBUClaw} />
        <Route path="/kompetensi-hub" component={KompetensiHub} />
        <Route path="/askom-coach" component={ASKOMCoach} />
        <Route path="/multiclaw" component={MultiClaw} />
        <Route path="/business-memory" component={BusinessMemory} />
        <Route path="/jasa-dokumen" component={JasaDokumenSKI} />
        <Route path="/layanan-ski" component={LayananSKI} />
        <Route path="/toko" component={Toko} />
        <Route path="/lkpm" component={LKPMPage} />
        <Route path="/lkut" component={LKUTPage} />
        <Route path="/iso-manajemen" component={ISOManajemenPage} />
        <Route path="/smap-pancek" component={SMAPPancekPage} />
        <Route path="/eksekutif-summary" component={EksekutifSummaryPage} />
        <Route path="/konstruksi-ai" component={KonstruksiAIPage} />
        <Route path="/keuangan-pajak" component={KeuanganPajakPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/agent-hub" component={AgentHub} />
      <Route path="/oss-rba" component={OSSRBAPage} />
      <Route path="/sbu" component={SBUPage} />
      <Route path="/skk" component={SKKPage} />
      <Route path="/iso-smk3" component={ISOSMKPage} />
      <Route path="/legalitas" component={LegalitasPage} />
      <Route path="/proyek" component={ProyekPage} />
      <Route path="/mini-apps" component={MiniAppsPage} />
      <Route path="/doc-generator" component={DocGeneratorPage} />
      <Route path="/verify" component={DocumentVerification} />
      <Route path="/ai-dokumen" component={AIDokumen} />
      <Route path="/konsultasi" component={KlinikKonsultasi} />
      <Route path="/brain-project" component={BrainProject} />
      <Route path="/ekosistem-kompetensi" component={EkosistemKompetensi} />
      <Route path="/bimtek-skk" component={BimtekSKK} />
      <Route path="/tendera-claw" component={TenderaClaw} />
      <Route path="/lexcom-hukum" component={LexComHukum} />
      <Route path="/workroom" component={Workroom} />
      <Route path="/sbu-claw" component={SBUClaw} />
      <Route path="/kompetensi-hub" component={KompetensiHub} />
      <Route path="/askom-coach" component={ASKOMCoach} />
      <Route path="/multiclaw" component={MultiClaw} />
      <Route path="/business-memory" component={BusinessMemory} />
      <Route path="/jasa-dokumen" component={JasaDokumenSKI} />
      <Route path="/layanan-ski" component={LayananSKI} />
      <Route path="/toko" component={Toko} />
      <Route path="/lkpm" component={LKPMPage} />
      <Route path="/lkut" component={LKUTPage} />
      <Route path="/iso-manajemen" component={ISOManajemenPage} />
      <Route path="/smap-pancek" component={SMAPPancekPage} />
      <Route path="/eksekutif-summary" component={EksekutifSummaryPage} />
      <Route path="/konstruksi-ai" component={KonstruksiAIPage} />
      <Route path="/keuangan-pajak" component={KeuanganPajakPage} />
      {/* Routes only accessible after login — show page so it can display auth gate */}
      <Route path="/tender-generator" component={TenderGenerator} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/projects" component={ProjectDashboard} />
      <Route path="/financial" component={FinancialModule} />
      <Route path="/equipment" component={EquipmentRental} />
      <Route path="/analytics" component={Analytics} />
      {/* /login → custom login page */}
      <Route path="/login" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { user } = useAuth();
  return (
    <>
      <Toaster />
      <AuthenticatedRouter />
      {user && <ServiceNav />}
      <FloatingChatButton />
      <Chatbot />
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
