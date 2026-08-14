import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  FolderKanban, MessageSquare, Users, BarChart3,
  ArrowUpRight, ExternalLink, Sparkles, ClipboardList,
  CalendarCheck, FileText,
} from "lucide-react";

const FEATURES = [
  { icon: FolderKanban,   title: "Ruang Proyek",       desc: "Kelola semua proyek konstruksi dalam satu workspace — progress, dokumen, dan tim dalam tampilan terpadu." },
  { icon: MessageSquare,  title: "Klinik Konsultasi",  desc: "Konsultasi langsung dengan pakar SBU, SKK, LKUT, dan regulasi konstruksi kapan pun dibutuhkan." },
  { icon: Users,          title: "Kolaborasi Tim",     desc: "Undang anggota tim, delegasi tugas, dan pantau progress pekerjaan secara real-time." },
  { icon: BarChart3,      title: "Dashboard Proyek",   desc: "Ringkasan status semua proyek — jadwal, anggaran, dan milestones dalam satu pandangan." },
  { icon: ClipboardList,  title: "Manajemen Dokumen",  desc: "Upload, arsip, dan bagikan dokumen proyek dengan kontrol akses berbasis peran." },
  { icon: CalendarCheck,  title: "Jadwal & Milestone", desc: "Atur deadline, milestone, dan reminder otomatis agar tidak ada tahapan proyek yang terlewat." },
];

export default function GaiaSIAPPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-950 to-slate-950 py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="container relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                <Sparkles className="w-3 h-3" /> Powered by Gustafta
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium">
                <FolderKanban className="w-3 h-3 text-amber-400" /> Workspace & Konsultasi Proyek
              </span>
            </div>

            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-600 bg-opacity-20 border border-white/10 flex items-center justify-center shadow-lg">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Gaia <span className="text-amber-400">SIAP</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Sistem Informasi dan Akses Proyek — workspace kolaborasi proyek konstruksi dan klinik
              konsultasi regulasi langsung dengan para ahli. Tersedia di platform Gustafta.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a href="https://gustafta.my.id/ruang-proyek" target="_blank" rel="noopener noreferrer">
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 px-8 gap-2 text-base shadow-lg shadow-cyan-900/30">
                  <FolderKanban className="w-4 h-4" />
                  Buka Ruang Proyek
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://gustafta.my.id/klinik-konsultasi" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 gap-2 text-base">
                  <MessageSquare className="w-4 h-4" />
                  Klinik Konsultasi
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>

            <p className="text-slate-500 text-xs">
              Anda akan diarahkan ke <span className="text-cyan-400">gustafta.my.id</span> — platform Gustafta AI OS
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-white/10 bg-slate-900/60 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "Ruang Proyek",    label: "Workspace Kolaborasi" },
              { value: "Klinik",          label: "Konsultasi Langsung" },
              { value: "Real-time",       label: "Update Progress" },
              { value: "Multi-Tim",       label: "Akses Bersama" },
            ].map((h, i) => (
              <div key={i}>
                <div className="text-xl font-extrabold text-amber-400">{h.value}</div>
                <div className="text-slate-400 text-xs mt-1">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Apa yang Bisa Dilakukan di Gaia SIAP</h2>
            <p className="text-slate-400">Dua modul utama: Ruang Proyek dan Klinik Konsultasi</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }} viewport={{ once: true }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-cyan-600 bg-opacity-20 border border-white/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two-button CTA */}
      <section className="py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4">

            {/* Ruang Proyek card */}
            <a href="https://gustafta.my.id/ruang-proyek" target="_blank" rel="noopener noreferrer"
              className="block group rounded-2xl border border-cyan-800/40 p-8 bg-gradient-to-br from-cyan-950/60 to-slate-900 hover:border-cyan-600/60 transition-colors">
              <FolderKanban className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-extrabold text-white mb-2">Ruang Proyek</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Workspace kolaborasi untuk tim proyek konstruksi.
              </p>
              <span className="inline-flex items-center gap-1 text-cyan-400 text-sm font-semibold group-hover:gap-2 transition-all">
                Buka <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>

            {/* Klinik Konsultasi card */}
            <a href="https://gustafta.my.id/klinik-konsultasi" target="_blank" rel="noopener noreferrer"
              className="block group rounded-2xl border border-violet-800/40 p-8 bg-gradient-to-br from-violet-950/60 to-slate-900 hover:border-violet-600/60 transition-colors">
              <MessageSquare className="w-8 h-8 text-violet-400 mb-4" />
              <h3 className="text-lg font-extrabold text-white mb-2">Klinik Konsultasi</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Tanya jawab langsung dengan pakar regulasi konstruksi.
              </p>
              <span className="inline-flex items-center gap-1 text-violet-400 text-sm font-semibold group-hover:gap-2 transition-all">
                Buka <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
          </motion.div>
          <p className="text-center text-slate-600 text-xs mt-6">
            Produk dikelola oleh Gustafta AI OS · gustafta.my.id
          </p>
        </div>
      </section>
    </div>
  );
}
