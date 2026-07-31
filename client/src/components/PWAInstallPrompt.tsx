import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Star, Zap, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (in standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the banner
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    // Android/Chrome: capture beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: check if Safari and not already installed
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari && !isStandalone) {
      // Show iOS guide after a small delay
      setTimeout(() => setShowBanner(true), 3000);
      setShowIOSGuide(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isInstalled || dismissed || !showBanner) return null;

  return (
    <>
      {/* Bottom Install Banner */}
      <div
        className={cn(
          "fixed bottom-16 xl:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto",
          "bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20",
          "animate-in slide-in-from-bottom-4 duration-500"
        )}
        data-testid="pwa-install-banner"
      >
        {/* App header */}
        <div className="flex items-start gap-3 p-4 pb-0">
          <img
            src="/icon-72.png"
            alt="DokumenProyek"
            className="w-14 h-14 rounded-2xl shadow-md flex-shrink-0 border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-slate-900 text-sm leading-tight">DokumenProyek.com</h3>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-snug">
              Platform Dokumen Konstruksi & AI #1
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0 -mt-1 -mr-1"
            data-testid="button-dismiss-pwa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="px-4 pt-3 pb-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Wifi, label: "Bisa Offline", color: "text-green-600" },
              { icon: Zap, label: "Lebih Cepat", color: "text-blue-600" },
              { icon: Smartphone, label: "Seperti Aplikasi", color: "text-purple-600" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg bg-slate-50">
                  <Icon className={cn("w-4 h-4", item.color)} />
                  <span className="text-[10px] font-medium text-slate-600 leading-tight">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* iOS Guide */}
        {showIOSGuide ? (
          <div className="px-4 pt-3 pb-4">
            <p className="text-xs text-slate-600 leading-relaxed mb-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
              <strong>Cara Install di iPhone/iPad:</strong><br />
              1. Tap tombol <span className="font-mono bg-white border px-1 rounded">⬆️ Share</span> di bawah Safari<br />
              2. Pilih <strong>"Add to Home Screen"</strong><br />
              3. Tap <strong>"Add"</strong> di pojok kanan atas
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDismiss}
              data-testid="button-ios-got-it"
            >
              Mengerti
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 p-4 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-slate-500"
              onClick={handleDismiss}
              data-testid="button-pwa-later"
            >
              Nanti Saja
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
              onClick={handleInstall}
              data-testid="button-pwa-install"
            >
              <Download className="w-3.5 h-3.5" />
              Install Sekarang
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

// Hook to check PWA install state — usable anywhere in the app
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setCanInstall(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    return result.outcome === "accepted";
  };

  return { isInstalled, canInstall, install };
}
