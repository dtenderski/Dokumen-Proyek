import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  featured?: boolean;
  featuredLabel?: string;
  type?: "default" | "safety" | "circular";
  className?: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  features, 
  featured = false,
  featuredLabel,
  type = "default",
  className
}: FeatureCardProps) {
  
  const getTypeStyles = () => {
    switch (type) {
      case "safety":
        return "border-t-4 border-t-red-500 bg-red-50/30";
      case "circular":
        return "border-t-4 border-t-emerald-500 bg-emerald-50/30";
      default:
        return featured ? "bg-amber-50/50 border-accent/20 border" : "bg-white border-border/40 border";
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case "safety":
        return "bg-red-100 text-red-600";
      case "circular":
        return "bg-emerald-100 text-emerald-600";
      default:
        return featured ? "bg-accent text-white" : "bg-primary/5 text-primary";
    }
  };

  return (
    <div className={cn(
      "relative rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full",
      getTypeStyles(),
      className
    )}>
      {featuredLabel && (
        <div className={cn(
          "absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wider",
          type === "safety" ? "bg-red-500" :
          type === "circular" ? "bg-emerald-500" :
          "bg-accent"
        )}>
          {featuredLabel}
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg transition-colors", getIconStyles())}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 leading-tight">
          {title}
        </h3>
      </div>
      
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed min-h-[40px]">
        {description}
      </p>

      <ul className="space-y-2 mt-auto">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
            <span className={cn(
              "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
              type === "safety" ? "bg-red-400" :
              type === "circular" ? "bg-emerald-400" :
              "bg-accent"
            )} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
