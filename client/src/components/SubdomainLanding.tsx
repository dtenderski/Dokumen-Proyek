import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, MessageCircle, Clock, CheckCircle, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface SubdomainLandingProps {
  badge: string;
  statusLabel?: string;
  statusVariant?: "coming-soon" | "early-access" | "live";
  icon: LucideIcon;
  title: string;
  titleAccent?: string;          // coloured part inside title
  description: string;
  accentColor: string;           // tailwind bg colour e.g. "bg-blue-500"
  gradientFrom: string;          // e.g. "from-blue-950"
  gradientTo: string;            // e.g. "to-slate-950"
  features: Feature[];
  sources?: string[];            // Sumber regulasi / integrasi
  highlights?: { value: string; label: string }[];
  ctaPrimary?: { label: string; href: string; whatsapp?: boolean };
  ctaSecondary?: { label: string; href: string };
  footer?: string;               // small note at bottom
}

const STATUS_CONFIG = {
  "coming-soon":  { label: "Segera Hadir",   cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  "early-access": { label: "Akses Awal",      cls: "bg-green-500/20 text-green-300 border-green-500/30" },
  "live":         { label: "Live",            cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
};

export function SubdomainLanding({
  badge,
  statusVariant = "coming-soon",
  icon: HeroIcon,
  title,
  titleAccent,
  description,
  accentColor,
  gradientFrom,
  gradientTo,
  features,
  sources,
  highlights,
  ctaPrimary,
  ctaSecondary,
  footer,
}: SubdomainLandingProps) {
  const status = STATUS_CONFIG[statusVariant];
  const WA_DEFAULT = "https://wa.me/6281287941900?text=Halo%2C+saya+tertarik+dengan+layanan+DokumenProyek.com";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} py-20 md:py-28`}>
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="container relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="space-y-6">

            {/* Status + Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                <Clock className="w-3 h-3" />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium">
                <Zap className="w-3 h-3 text-amber-400" />
                {badge}
              </span>
            </div>

            {/* Icon */}
            <div className={`mx-auto w-16 h-16 rounded-2xl ${accentColor} bg-opacity-20 border border-white/10 flex items-center justify-center shadow-lg`}>
              <HeroIcon className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {titleAccent ? (
                <>
                  {title.split(titleAccent)[0]}
                  <span className="text-amber-400">{titleAccent}</span>
                  {title.split(titleAccent)[1]}
                </>
              ) : title}
            </h1>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">{description}</p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {ctaPrimary?.whatsapp ? (
                <a href={ctaPrimary.href || WA_DEFAULT} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-500 text-white font-bold h-12 px-8 gap-2 text-base shadow-lg shadow-green-900/30">
                    <MessageCircle className="w-4 h-4" />
                    {ctaPrimary.label}
                  </Button>
                </a>
              ) : ctaPrimary ? (
                <Link href={ctaPrimary.href}>
                  <Button className={`${accentColor} hover:opacity-90 text-white font-bold h-12 px-8 gap-2 text-base shadow-lg`}>
                    {ctaPrimary.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : null}
              {ctaSecondary && (
                <Link href={ctaSecondary.href}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 gap-2 text-base">
                    {ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Highlights ── */}
      {highlights && highlights.length > 0 && (
        <section className="border-y border-white/10 bg-slate-900/60 py-8">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {highlights.map((h, i) => (
                <div key={i}>
                  <div className="text-2xl font-extrabold text-amber-400">{h.value}</div>
                  <div className="text-slate-400 text-xs mt-1">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Apa yang Bisa Dilakukan</h2>
            <p className="text-slate-400">Dirancang khusus untuk kepatuhan regulasi Indonesia</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }} viewport={{ once: true }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${accentColor} bg-opacity-20 border border-white/10 flex items-center justify-center mb-3`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sources / Integrasi ── */}
      {sources && sources.length > 0 && (
        <section className="py-10 bg-slate-900/40 border-t border-white/5">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Sumber & Integrasi Regulasi</p>
            <div className="flex flex-wrap justify-center gap-2">
              {sources.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">{s}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Bottom ── */}
      <section className="py-16">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className={`rounded-2xl border border-white/10 p-10 bg-gradient-to-br from-slate-900 to-slate-900/50`}>
            <CheckCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">Tertarik? Hubungi Kami</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Tim DokumenProyek.com siap mendampingi proses kepatuhan regulasi Anda dari awal hingga selesai.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={WA_DEFAULT} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold h-11 px-7 gap-2">
                  <MessageCircle className="w-4 h-4" />Tanya via WhatsApp
                </Button>
              </a>
              <Link href="/layanan-ski">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-11 px-7 gap-2">
                  Lihat Semua Layanan <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {footer && <p className="text-slate-600 text-xs mt-6">{footer}</p>}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
