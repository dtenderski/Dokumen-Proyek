import { Zap, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function FloatingChatButton() {
  const [showTooltip, setShowTooltip] = useState(true);
  const [location] = useLocation();

  if (location === "/ai-chat") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {showTooltip && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border p-3.5 max-w-[220px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
            data-testid="button-close-tooltip"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Gustafta AI</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            TenderaClaw · SBUClaw · MultiClaw · LexCom · Workroom · KompetensiHub · ASKOM Coach
          </p>
        </div>
      )}
      <Link href="/agent-hub">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 p-0"
          data-testid="button-floating-chat"
        >
          <Zap className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
