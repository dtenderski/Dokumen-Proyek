import { useState, type ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, FileSpreadsheet, PlayCircle, Briefcase, Package,
  Star, Download, Search, MessageCircle, Tag, ShoppingBag,
  ChevronRight, Sparkles, Filter, ArrowUpRight,
} from "lucide-react";

const WA_NUMBER = "6282299417818";

const CATEGORIES = [
  { key: "semua",    label: "Semua",    icon: ShoppingBag },
  { key: "ebook",    label: "eBook",    icon: BookOpen },
  { key: "template", label: "Template", icon: FileSpreadsheet },
  { key: "kursus",   label: "Kursus",   icon: PlayCircle },
  { key: "jasa",     label: "Jasa",     icon: Briefcase },
  { key: "paket",    label: "Paket",    icon: Package },
];

const CAT_STYLE: Record<string, { bg: string; text: string; light: string }> = {
  ebook:    { bg: "bg-blue-500",   text: "text-blue-600",   light: "bg-blue-50" },
  template: { bg: "bg-emerald-500",text: "text-emerald-600",light: "bg-emerald-50" },
  kursus:   { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
  jasa:     { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
  paket:    { bg: "bg-rose-500",   text: "text-rose-600",   light: "bg-rose-50" },
};

interface StoreProduct {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  tags: string[];
  isFeatured: boolean;
  downloadCount: number;
  rating: number; // out of 50 (4.8 stored as 48)
}

function formatPrice(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function ratingStars(r: number) {
  // r is 0–50 (e.g. 48 = 4.8)
  const val = r / 10;
  return val.toFixed(1);
}

function waLink(product: StoreProduct) {
  const msg = encodeURIComponent(
    `Halo, saya tertarik dengan produk *${product.title}* (${formatPrice(product.price)}). Mohon informasi lebih lanjut dan cara pembeliannya.`
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

function CategoryIcon({ cat, className = "w-5 h-5" }: { cat: string; className?: string }) {
  const icons: Record<string, ElementType> = {
    ebook: BookOpen, template: FileSpreadsheet,
    kursus: PlayCircle, jasa: Briefcase, paket: Package,
  };
  const Icon = icons[cat] ?? ShoppingBag;
  return <Icon className={className} />;
}

function ProductCard({ product }: { product: StoreProduct }) {
  const style = CAT_STYLE[product.category] ?? CAT_STYLE.ebook;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Thumbnail */}
      <div className={`relative h-40 ${style.light} flex items-center justify-center`}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <CategoryIcon cat={product.category} className={`w-16 h-16 ${style.text} opacity-30`} />
        )}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${style.bg}`}>
            <CategoryIcon cat={product.category} className="w-2.5 h-2.5" />
            {CATEGORIES.find(c => c.key === product.category)?.label ?? product.category}
          </span>
          {discount && discount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold text-white bg-red-500">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold text-white bg-amber-500">
              <Sparkles className="w-2.5 h-2.5" /> Unggulan
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-bold text-slate-800 leading-snug text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
            {product.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(t => (
              <span key={t} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {ratingStars(product.rating)}
          </span>
          <span className="flex items-center gap-0.5">
            <Download className="w-3 h-3" />
            {product.downloadCount.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
          <div>
            <p className="font-extrabold text-slate-800 text-base leading-none">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-xs text-slate-400 line-through mt-0.5">{formatPrice(product.originalPrice)}</p>
            )}
          </div>
          <a href={waLink(product)} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs font-bold rounded-lg">
              <MessageCircle className="w-3.5 h-3.5" />
              Pesan
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Toko() {
  const [activeCategory, setActiveCategory] = useState("semua");
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery<StoreProduct[]>({
    queryKey: ["/api/store/products"],
  });

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "semua" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featured = products.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-28 pb-16 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-sm mb-5">
            <ShoppingBag className="w-4 h-4" />
            Toko Digital DokumenProyek.com
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Produk Digital untuk<br />
            <span className="text-accent">Konstruksi & Pengadaan</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            eBook, template dokumen, kursus, dan paket jasa pengurusan SBU, SKK, ISO, dan tender —
            dibuat oleh tim Gustafta.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk, topik, atau kategori…"
              className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/15"
            />
          </div>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 py-10">

        {/* Featured row (only if not searching/filtering) */}
        {featured.length > 0 && activeCategory === "semua" && !search && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-800">Produk Unggulan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Category tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-7">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-slate-800 text-white border-slate-800 shadow"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                {cat.key !== "semua" && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {products.filter(p => p.category === cat.key).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 h-72 animate-pulse">
                <div className="h-40 bg-slate-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">Belum ada produk di kategori ini</p>
            <p className="text-sm mt-1">Segera hadir — hubungi kami via WhatsApp untuk info lebih lanjut</p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya ingin tanya tentang produk digital di DokumenProyek.com")}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Button className="mt-5 bg-green-600 hover:bg-green-700 text-white gap-2">
                <MessageCircle className="w-4 h-4" /> Tanya via WhatsApp
              </Button>
            </a>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </AnimatePresence>
        )}

        {/* Bottom CTA */}
        <section className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Tidak menemukan yang Anda cari?</h3>
            <p className="text-slate-400 text-sm">Konsultasikan kebutuhan dokumen & sertifikasi Anda langsung ke tim ahli Gustafta.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya butuh bantuan dokumen konstruksi yang tidak ada di toko.")}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold">
                <MessageCircle className="w-4 h-4" /> WhatsApp Konsultan
              </Button>
            </a>
            <a href="/layanan-ski">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-1.5">
                Lihat Semua Layanan <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
