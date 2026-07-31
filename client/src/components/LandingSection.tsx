import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface LandingSectionProps {
  title: string;
  subtitle?: string;
  theme?: "light" | "dark" | "blue";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function LandingSection({
  title,
  subtitle,
  theme = "light",
  defaultOpen = false,
  children,
}: LandingSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const triggerCls =
    theme === "dark"
      ? "bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
      : theme === "blue"
      ? "bg-indigo-950 border-indigo-800 text-white hover:bg-indigo-900"
      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <div>
      {/* Sticky accordion trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-6 py-3.5 border-y transition-colors ${triggerCls}`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
              open ? "bg-primary" : "bg-slate-400"
            }`}
          />
          <span className="font-semibold text-sm tracking-wide">{title}</span>
          {subtitle && (
            <span className="text-xs opacity-50 hidden md:inline">
              — {subtitle}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
