import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Zap, FileText, Scale, BarChart3, DollarSign,
  Award, BookOpen, Flame, Leaf, MessageCircle, ArrowRight,
  CheckCircle2, Users, Building2, ChevronDown,
} from "lucide-react";

const WA = "6282299417818";

// ─── Service Catalog ─────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "sertifikasi",
    label: "Sertifikasi & Kompetensi",
    color: "amber",
    icon: Award,
    services: [
      {
        title: "SBU LPJK",
        desc: "Pengurusan Sertifikat Badan Usaha Jasa Konstruksi (LPJK) — baru, perpanjangan, & naik kualifikasi. Semua subklasifikasi BUJK.",
        tag: "Paling Dicari",
        aiTool: "SBUClaw",
      },
      {
        title: "SKK Konstruksi",
        desc: "Sertifikat Kompetensi Kerja jalur BNSP/LPJK untuk semua jenjang (KKNI L1–L9) — persiapan uji, pendampingan, hingga penerbitan sertifikat.",
        tag: "Populer",
        aiTool: "KompetensiHub",
      },
      {
        title: "SBU & SKK ESDM",
        desc: "Sertifikasi khusus sektor energi: ketenagalistrikan, pertambangan, minyak & gas (migas), serta Energi Baru dan Terbarukan (EBT).",
        tag: "ESDM",
        aiTool: null,
      },
      {
        title: "LPKM",
        desc: "Pendirian dan akreditasi Lembaga Pelatihan Kerja Mandiri — kelengkapan dokumen, perizinan, dan pendampingan proses akreditasi.",
        tag: null,
        aiTool: null,
      },
      {
        title: "Bimtek SKK",
        desc: "Bimbingan teknis intensif persiapan uji kompetensi SKK konstruksi — modul sesuai jabatan kerja, simulasi asesi, dan latihan soal.",
        tag: null,
        aiTool: "Bimtek SKK AI",
      },
    ],
  },
  {
    id: "tender",
    label: "Dokumen & Pengadaan",
    color: "orange",
    icon: FileText,
    services: [
      {
        title: "Analisis & Strategi Tender",
        desc: "Pipeline AI 4-tahap: analisis kelayakan (go/no-go), strategi penawaran optimal, hingga draft dokumen penawaran siap submit.",
        tag: "Unggulan",
        aiTool: "TenderaClaw",
      },
      {
        title: "Bedah Dokumen Tender",
        desc: "AI membaca seluruh RKS, RAB, dan persyaratan tender dalam 30 detik — ringkasan eksekutif, risiko tersembunyi, dan Q&A interaktif.",
        tag: "AI",
        aiTool: "AI Dokumen",
      },
      {
        title: "Konsultasi Hukum Kontrak",
        desc: "Review kontrak konstruksi, sengketa pengadaan, regulasi PERPRES & Permen PUPR — konsultasi dengan chatbot spesialis hukum konstruksi.",
        tag: null,
        aiTool: "LexCom",
      },
    ],
  },
  {
    id: "manajemen",
    label: "Sistem Manajemen & ISO",
    color: "blue",
    icon: Shield,
    services: [
      {
        title: "ISO 9001 — Mutu",
        desc: "Implementasi Sistem Manajemen Mutu ISO 9001 — gap analysis, penyusunan dokumen, pelatihan internal, hingga pendampingan sertifikasi.",
        tag: null,
        aiTool: null,
      },
      {
        title: "SMAP ISO 37001 (Pancek)",
        desc: "Sistem Manajemen Anti Penyuapan (SMAP) sesuai ISO 37001 — wajib bagi BUJK yang ikut tender pemerintah berskala besar.",
        tag: "Wajib BUJK",
        aiTool: null,
      },
      {
        title: "ISO 45001 — K3",
        desc: "Sistem Manajemen Keselamatan & Kesehatan Kerja (K3) ISO 45001 — untuk kontraktor yang membutuhkan compliance K3 proyek.",
        tag: null,
        aiTool: null,
      },
      {
        title: "ISO 14001 — Lingkungan",
        desc: "Sistem Manajemen Lingkungan ISO 14001 — pendampingan implementasi dan sertifikasi untuk proyek-proyek berdampak lingkungan.",
        tag: null,
        aiTool: null,
      },
    ],
  },
  {
    id: "keuangan",
    label: "Keuangan Proyek",
    color: "green",
    icon: DollarSign,
    services: [
      {
        title: "Laporan Keuangan Proyek",
        desc: "Penyusunan laporan keuangan proyek konstruksi — arus kas, realisasi RAB vs aktual, dan laporan kepada owner/pemberi kerja.",
        tag: null,
        aiTool: "Modul Keuangan",
      },
      {
        title: "Analisis Keuangan Tender",
        desc: "Analisis kelayakan finansial sebelum ikut tender — perhitungan margin, break-even, dan simulasi arus kas selama proyek berjalan.",
        tag: null,
        aiTool: "TenderaClaw",
      },
    ],
  },
];

const COLOR_MAP: Record<string, { pill: string; badge: string; card: string; icon: string }> = {
  amber: {
    pill:  "bg-amber-500/10 text-amber-300 border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    card:  "hover:border-amber-500/30",
    icon:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  orange: {
    pill:  "bg-orange-500/10 text-orange-300 border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    card:  "hover:border-orange-500/30",
    icon:  "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  blue: {
    pill:  "bg-blue-500/10 text-blue-300 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    card:  "hover:border-blue-500/30",
    icon:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  green: {
    pill:  "bg-green-500/10 text-green-300 border-green-500/20",
    badge: "bg-green-500/20 text-green-300 border border-green-500/30",
    card:  "hover:border-green-500/30",
    icon:  "text-green-400 bg-green-500/10 border-green-500/20",
  },
};

// ─── Inquiry Form ─────────────────────────────────────────────────────────────
function InquiryForm() {
  const [form, setForm] = useState({ nama: "", perusahaan: "", layanan: "", telepon: "", pesan: "" });
  const serviceRef = useRef<HTMLSelectElement>(null);

  const allServices = CATEGORIES.flatMap(c => c.services.map(s => s.title));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = encodeURIComponent(
      `Halo Gustafta, saya ingin menanyakan layanan Anda.\n\n` +
      `Nama: ${form.nama}\n` +
      `Perusahaan: ${form.perusahaan}\n` +
      `Layanan: ${form.layanan}\n` +
      `No. HP: ${form.telepon}\n` +
      (form.pesan ? `Keterangan: ${form.pesan}` : "")
    );
    window.open(`https://wa.me/${WA}?text=${txt}`, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nama Lengkap *</label>
          <Input
            required value={form.nama}
            onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
            placeholder="Budi Santoso"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Perusahaan</label>
          <Input
            value={form.perusahaan}
            onChange={e => setForm(p => ({ ...p, perusahaan: e.target.value }))}
            placeholder="PT. Maju Konstruksi"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Layanan yang Dibutuhkan *</label>
          <select
            ref={serviceRef}
            required
            value={form.layanan}
            onChange={e => setForm(p => ({ ...p, layanan: e.target.value }))}
            className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 text-white text-sm px-3 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">— Pilih layanan —</option>
            {allServices.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="Lainnya">Lainnya / Belum tahu</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">No. WhatsApp / Telepon *</label>
          <Input
            required value={form.telepon}
            onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))}
            placeholder="08xxxxxxxxxx"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Keterangan Singkat</label>
        <Textarea
          value={form.pesan}
          onChange={e => setForm(p => ({ ...p, pesan: e.target.value }))}
          placeholder="Ceritakan kebutuhan Anda secara singkat…"
          rows={3}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50 resize-none"
        />
      </div>
      <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-base gap-2">
        <MessageCircle className="w-4 h-4" />
        Kirim via WhatsApp
      </Button>
      <p className="text-slate-500 text-xs text-center">Pesan akan dikirim ke WhatsApp tim Gustafta. Respons dalam 1×24 jam kerja.</p>
    </form>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LayananSKI() {
  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent("Halo Gustafta, saya ingin menanyakan layanan Anda.")}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-950 to-blue-900/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2.5 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 mb-6">
            <img src="/ski-logo.png" alt="" className="w-5 h-5 rounded object-cover hidden" onError={e => (e.currentTarget.style.display = "none")} />
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 text-xs font-semibold">by Gustafta</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />AI by Gustafta
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold mb-5 leading-tight">
            Jasa Administrasi<br />
            <span className="text-amber-400">Konstruksi & Energi</span><br />
            <span className="text-2xl sm:text-3xl font-bold text-slate-400">Dipercepat Teknologi AI</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Dari SBU LPJK, SKK ESDM, hingga ISO dan analisis tender — Gustafta
            menyelesaikan urusan sertifikasi dan administrasi konstruksi Anda
            dengan tim ahli yang diperkuat AI Gustafta.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 h-12 px-8 w-full sm:w-auto">
                <MessageCircle className="w-4 h-4" />Konsultasi Gratis via WA
              </Button>
            </a>
            <a href="#layanan">
              <Button size="lg" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold gap-2 h-12 px-8 w-full sm:w-auto">
                Lihat Semua Layanan <ChevronDown className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="border-y border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "14+",  label: "Jenis Layanan" },
            { value: "LPJK · ESDM",   label: "Cakupan Sertifikasi" },
            { value: "ISO & SMAP",   label: "Sistem Manajemen" },
            { value: "AI-Powered",  label: "by Gustafta" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-lg font-extrabold text-amber-400">{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About ── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Tentang Gustafta</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-snug">
              Mitra Terpercaya BUJK<br />di Seluruh Indonesia
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Gustafta menghadirkan layanan konsultasi
              dan pengurusan administrasi di bidang konstruksi, energi, dan sistem manajemen.
              Kami membantu kontraktor, konsultan, dan BUJK menyelesaikan kebutuhan
              sertifikasi, dokumen tender, dan kepatuhan regulasi secara efisien.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Bermitra dengan platform AI <strong className="text-white">Gustafta</strong>,
              setiap layanan kini dipercepat dengan teknologi analisis dokumen,
              pipeline sertifikasi, dan chatbot spesialis industri konstruksi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Award,      label: "SBU & SKK LPJK",    sub: "Konstruksi" },
              { icon: Flame,      label: "SBU & SKK ESDM",    sub: "Energi & Pertambangan" },
              { icon: Shield,     label: "ISO & SMAP",         sub: "Sistem Manajemen" },
              { icon: BarChart3,  label: "Tender & Dokumen",   sub: "AI-Assisted" },
              { icon: BookOpen,   label: "LPKM & Bimtek",      sub: "Pelatihan" },
              { icon: DollarSign, label: "Keuangan Proyek",    sub: "Laporan & Analisis" },
            ].map(item => (
              <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{item.label}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services catalog ── */}
      <div id="layanan" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Layanan</div>
          <h2 className="text-3xl font-extrabold mb-3">Semua Layanan Gustafta</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Setiap layanan didukung tim ahli berpengalaman dan, di mana relevan,
            dipercepat dengan teknologi AI Gustafta.
          </p>
        </div>

        <div className="space-y-12">
          {CATEGORIES.map(cat => {
            const c = COLOR_MAP[cat.color];
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.icon}`}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">{cat.label}</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.services.map(svc => (
                    <div
                      key={svc.title}
                      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 transition-colors ${c.card}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-white leading-snug">{svc.title}</h4>
                        {svc.tag && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.badge}`}>
                            {svc.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-3">{svc.desc}</p>
                      {svc.aiTool && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400 text-[10px] font-semibold">{svc.aiTool}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="border-y border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Cara Kerja</div>
            <h2 className="text-2xl font-extrabold">Proses Layanan Gustafta</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "01", icon: MessageCircle, title: "Konsultasi",          desc: "Hubungi tim Gustafta via WhatsApp atau form — sampaikan kebutuhan Anda." },
              { step: "02", icon: FileText,      title: "Analisis Kebutuhan",  desc: "Tim Gustafta menganalisis situasi dan menyusun rencana layanan yang tepat." },
              { step: "03", icon: Zap,           title: "Eksekusi + AI",       desc: "Tim mengerjakan didukung tools AI Gustafta untuk hasil lebih cepat & akurat." },
              { step: "04", icon: CheckCircle2,  title: "Selesai & Serahkan",  desc: "Dokumen / sertifikat / laporan diterima klien beserta panduan tindak lanjut." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-amber-500/60 text-xs font-bold mb-1">{s.step}</div>
                <div className="text-sm font-bold text-white mb-1">{s.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Inquiry section ── */}
      <div id="hubungi" className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left — copy */}
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Mulai Sekarang</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-snug">
              Konsultasikan Kebutuhan<br />Anda dengan Tim Gustafta
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Isi form di sebelah kanan atau langsung hubungi kami via WhatsApp.
              Tim Gustafta akan merespons dalam 1×24 jam kerja.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "SBU, SKK, dan sertifikasi ESDM — semua sektor",
                "ISO 9001, 14001, 45001, dan SMAP 37001",
                "Analisis & strategi tender berbasis AI",
                "Laporan keuangan dan administrasi proyek",
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 h-11 px-7">
                <MessageCircle className="w-4 h-4" />
                Chat Langsung via WhatsApp
              </Button>
            </a>
            <p className="text-slate-600 text-xs mt-2">
              +62 822-9941-7818 · Senin–Sabtu 08.00–17.00 WIB
            </p>
          </div>

          {/* Right — form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Form Inquiry</h3>
            <p className="text-slate-500 text-xs mb-5">
              Pesan akan dikirim ke WhatsApp tim Gustafta secara otomatis.
            </p>
            <InquiryForm />
          </div>

        </div>
      </div>

      {/* ── Footer strip ── */}
      <div className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-sm font-semibold">by Gustafta</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Zap className="w-3 h-3 text-amber-400" />
            Teknologi AI by <span className="text-amber-400 font-semibold ml-1">Gustafta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
