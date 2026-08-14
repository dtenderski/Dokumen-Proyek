import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/LandingPage";
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
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
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
import GaiaStorePage from "@/pages/GaiaStorePage";
import GaiaSIAPPage from "@/pages/GaiaSIAPPage";
import PUBLKUTPage from "@/pages/PUBLKUTPage";
import LKUTSimulatorPage from "@/pages/LKUTSimulatorPage";
import DocumentVerification from "@/pages/DocumentVerification";
import EquipmentRental from "@/pages/EquipmentRental";
import AgentHub from "@/pages/AgentHub";

/**
 * dokumenproyek.com — pure marketing showcase.
 * No login, no customer database, no auth gating.
 * All AI/digital products link out to gustafta.my.id.
 * Only human-delivered document services are sold here (WhatsApp CTA).
 */
function AppRouter() {
  return (
    <Switch>
      {/* ── Landing ── */}
      <Route path="/" component={LandingPage} />

      {/* ── Human-delivered services (core product) ── */}
      <Route path="/sbu" component={SBUPage} />
      <Route path="/skk" component={SKKPage} />
      <Route path="/iso-smk3" component={ISOSMKPage} />
      <Route path="/iso-manajemen" component={ISOManajemenPage} />
      <Route path="/legalitas" component={LegalitasPage} />
      <Route path="/oss-rba" component={OSSRBAPage} />
      <Route path="/lkpm" component={LKPMPage} />
      <Route path="/lkut" component={LKUTPage} />
      <Route path="/smap-pancek" component={SMAPPancekPage} />
      <Route path="/jasa-dokumen" component={JasaDokumenSKI} />
      <Route path="/layanan-ski" component={LayananSKI} />

      {/* ── Toko digital (links out to gustafta.my.id) ── */}
      <Route path="/toko" component={Toko} />
      <Route path="/gaia-store" component={GaiaStorePage} />
      <Route path="/gaia-siap" component={GaiaSIAPPage} />
      <Route path="/pub-lkut" component={PUBLKUTPage} />
      <Route path="/lkut-simulator" component={LKUTSimulatorPage} />

      {/* ── Gustafta AI product showcase (marketing pages) ── */}
      <Route path="/agent-hub" component={AgentHub} />
      <Route path="/tendera-claw" component={TenderaClaw} />
      <Route path="/sbu-claw" component={SBUClaw} />
      <Route path="/lexcom-hukum" component={LexComHukum} />
      <Route path="/ai-dokumen" component={AIDokumen} />
      <Route path="/konsultasi" component={KlinikKonsultasi} />
      <Route path="/workroom" component={Workroom} />
      <Route path="/kompetensi-hub" component={KompetensiHub} />
      <Route path="/askom-coach" component={ASKOMCoach} />
      <Route path="/bimtek-skk" component={BimtekSKK} />
      <Route path="/multiclaw" component={MultiClaw} />
      <Route path="/business-memory" component={BusinessMemory} />
      <Route path="/brain-project" component={BrainProject} />
      <Route path="/ekosistem-kompetensi" component={EkosistemKompetensi} />

      {/* ── Toolkit & utilities ── */}
      <Route path="/doc-generator" component={DocGeneratorPage} />
      <Route path="/mini-apps" component={MiniAppsPage} />
      <Route path="/verify" component={DocumentVerification} />
      <Route path="/eksekutif-summary" component={EksekutifSummaryPage} />
      <Route path="/konstruksi-ai" component={KonstruksiAIPage} />
      <Route path="/keuangan-pajak" component={KeuanganPajakPage} />
      <Route path="/proyek" component={ProyekPage} />
      <Route path="/equipment" component={EquipmentRental} />

      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  return (
    <>
      <Toaster />
      <AppRouter />
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
