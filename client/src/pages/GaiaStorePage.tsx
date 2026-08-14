import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, BookOpen, FileSpreadsheet, PlayCircle,
  Package, ArrowUpRight, ExternalLink, Tag, Star, Sparkles,
} from "lucide-react";

const PRODUCTS = [
  { icon: BookOpen,       title: "eBook Regulasi",    desc: "Panduan praktis UUJK, Perpres, dan Permen PUPR dalam format digital siap pakai." },
  { icon: FileSpreadsheet,title: "Template Dokumen",  desc: "Template RAB, SPK, Berita Acara, dan dokumen tender yang sudah tervalidasi." },
  { icon: PlayCircle,     title: "Kursus Online",     desc: "Video pembelajaran SBU, SKK, LKUT, dan manajemen proyek konstruksi." },
  { icon: Package,        title: "Paket Bundling",    desc: "Paket hemat template + ebook + konsultasi untuk BUJK dan tenaga ahli." },
  { icon: Tag,            title: "Harga Terjangkau",  desc: "Produk digital mulai dari Rp 50.000 — investasi kecil, manfaat besar." },
  { icon: Star,           title: "Sudah Dipakai",     desc: "Ribuan BUJK dan tenaga ahli konstruksi telah menggunakan produk Gaia Store." },
];

export default function GaiaStorePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 to-slate-950 py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="container relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-violet-500/20 text-violet-300 border-violet-500/30">
                <Sparkles className="w-3 h-3" /> Powered by Gustafta
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium">
                <ShoppingBag className="w-3 h-3 text-amber-400" /> Toko Produk Digital Konstruksi
              </span>
            </div>

            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-600 bg-opacity-20 border border-white/10 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Gaia <span className="text-amber-400">Store</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Toko produk digital konstruksi — template dokumen, ebook regulasi, kursus online, dan paket bundling
              untuk BUJK, kontraktor, dan tenaga ahli. Semua tersedia di Gaia Store by Gustafta.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a href="https://gustafta.my.id/store/katalog" target="_blank" rel="noopener noreferrer">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-12 px-8 gap-2 text-base shadow-lg shadow-violet-900/30">
                  <ShoppingBag className="w-4 h-4" />
                  Lihat Katalog Produk
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://gustafta.my.id/store/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 gap-2 text-base">
                  <ExternalLink className="w-4 h-4" />
                  Buka Gaia Store
                </Button>
              </a>
            </div>

            <p className="text-slate-500 text-xs">
              Anda akan diarahkan ke <span className="text-violet-400">gustafta.my.id</span> — platform produk digital Gustafta AI OS
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-white/10 bg-slate-900/60 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "100+",   label: "Produk Digital" },
              { value: "Rp 50rb",label: "Harga Mulai" },
              { value: "⭐ 4.9", label: "Rating Rata-rata" },
              { value: "Instan", label: "Akses Setelah Bayar" },
            ].map((h, i) => (
              <div key={i}>
                <div className="text-2xl font-extrabold text-amber-400">{h.value}</div>
                <div className="text-slate-400 text-xs mt-1">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Apa yang Tersedia di Gaia Store</h2>
            <p className="text-slate-400">Produk digital berkualitas tinggi untuk industri konstruksi Indonesia</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }} viewport={{ once: true }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-violet-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-600 bg-opacity-20 border border-white/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="rounded-2xl border border-white/10 p-10 bg-gradient-to-br from-slate-900 to-violet-950/30">
            <ShoppingBag className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">Siap Belanja di Gaia Store?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Kunjungi Gaia Store di Gustafta untuk melihat semua produk digital konstruksi terlengkap.
            </p>
            <a href="https://gustafta.my.id/store/katalog" target="_blank" rel="noopener noreferrer">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-8 gap-2">
                Buka Katalog Gaia Store <ArrowUpRight className="w-4 h-4" />
              </Button>
            </a>
            <p className="text-slate-600 text-xs mt-6">
              Produk dikelola oleh Gustafta AI OS · gustafta.my.id
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
