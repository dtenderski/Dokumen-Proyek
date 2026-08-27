import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Bot, BrainCircuit, Building2, Check, ChevronDown,
  ClipboardCheck, Clock3, FileCheck2, FileSearch, HardHat, Layers3, LockKeyhole,
  MessageCircle, Network, ScanSearch, ShieldCheck, Sparkles, Target, UsersRound,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const wa = "https://wa.me/6281287941900";

const services = [
  ["SBU Jasa Konstruksi", "K1 · K2 · K3 · Menengah · Besar", HardHat],
  ["SKK Konstruksi", "PJTBU & PJSKBU", BadgeCheck],
  ["KTA Asosiasi", "Keanggotaan yang siap dipakai", UsersRound],
  ["SBU JPTL", "Jasa Penunjang Tenaga Listrik", Zap],
  ["ISO KAN & Non-KAN", "9001, 14001, 45001 dan lainnya", ShieldCheck],
  ["SMK3", "Sistem Manajemen Keselamatan Kerja", LockKeyhole],
  ["Serkom K3", "Kemnaker & BNSP", ClipboardCheck],
  ["Konversi KBLI 2025", "Kode usaha tepat, tender aman", Target],
];

const aiTools = [
  { name: "SBUClaw", label: "Screening kelayakan SBU", icon: ScanSearch, color: "text-amber-300" },
  { name: "TenderaClaw", label: "Scan kepatuhan tender", icon: FileSearch, color: "text-cyan-300" },
  { name: "KompetensiHub", label: "Tracker kompetensi SKK", icon: Network, color: "text-emerald-300" },
  { name: "AI Dokumen", label: "Analisis dokumen instan", icon: BrainCircuit, color: "text-violet-300" },
];

const reveal = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function JasaDokumenSKI() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <main className="min-h-[100dvh] bg-[#f4f6f8] text-[#12243b]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#071a31] pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "46px 46px" }} />
        <div className="absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full border border-[#d9aa42]/20" />
        <div className="absolute right-[-80px] top-[-10px] h-[400px] w-[400px] rounded-full border border-[#d9aa42]/10" />
        <div className="container relative grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: .1 } } }} className="max-w-3xl">
            <motion.div variants={reveal} className="mb-6 flex flex-wrap gap-2">
              <Badge className="border border-[#d9aa42]/40 bg-[#d9aa42]/10 px-3 py-1.5 text-[#f0c867]">by Gustafta</Badge>
              <Badge className="border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-cyan-200"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Powered by Gustafta AI</Badge>
            </motion.div>
            <motion.p variants={reveal} className="mb-5 font-mono text-xs uppercase tracking-[.26em] text-[#d9aa42]">JASA DOKUMEN KONSTRUKSI · INDONESIA</motion.p>
            <h1 className="max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Jangan biarkan{" "}
              <span className="text-[#e4b84f]">satu dokumen</span>{" "}
              menggugurkan tender Anda.
            </h1>
            <motion.p variants={reveal} className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300">
              Kami mengurus SBU, SKK, ISO, SMK3, hingga KBLI dengan disiplin dokumen tingkat tender. Tim berpengalaman bertemu AI yang memeriksa celah sebelum panitia menemukannya.
            </motion.p>
            <motion.div variants={reveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={wa} target="_blank" rel="noreferrer"><Button size="lg" className="h-13 w-full bg-[#d9aa42] px-7 font-bold text-[#071a31] hover:bg-[#f0c867] sm:w-auto">Cek Risiko Dokumen Gratis <ArrowRight className="ml-2 h-5 w-5" /></Button></a>
              <a href="#layanan"><Button size="lg" variant="outline" className="h-13 w-full border-white/25 bg-white/5 px-7 text-white hover:bg-white/10 sm:w-auto">Lihat layanan kami</Button></a>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35 }} className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#d9aa42]/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#102943]/90 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4"><div className="flex items-center gap-2 text-sm font-bold"><Bot className="h-4 w-4 text-[#e4b84f]" />Gustafta Intelligence</div><span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400" />aktif</span></div>
              <div className="space-y-4 p-6">
                <div className="rounded-xl border border-white/10 bg-[#071a31] p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Status kesiapan tender</p><div className="mt-3 flex items-end justify-between"><span className="text-4xl font-black text-white">82<span className="text-xl text-slate-500">/100</span></span><span className="rounded-full bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-300">Perlu tindakan</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-[#d9aa42]" /></div></div>
                {["SBU sesuai subklasifikasi", "SKK PJTBU masih berlaku", "KBLI 2025 perlu konversi"].map((item, i) => <div key={item} className="flex items-center gap-3 text-sm"><span className={`flex h-7 w-7 items-center justify-center rounded-lg ${i === 2 ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}>{i === 2 ? "!" : <Check className="h-4 w-4" />}</span><span className="text-slate-300">{item}</span><span className="ml-auto text-[10px] uppercase text-slate-500">{i === 2 ? "ditinjau" : "lulus"}</span></div>)}
                <div className="border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400"><span className="text-[#e4b84f]">Rekomendasi AI:</span> konversi KBLI sebelum submit dokumen tender agar tidak gugur administrasi.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#d9aa42]/25 bg-[#d9aa42] py-4 text-[#071a31]"><div className="container flex flex-col items-center justify-between gap-2 text-center text-sm font-bold sm:flex-row sm:text-left"><span>Deadline tender sudah dekat? Jangan menebak status dokumen Anda.</span><a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline underline-offset-4">Chat spesialis Gustafta sekarang <ArrowRight className="h-4 w-4" /></a></div></section>

      <section className="bg-[#f4f6f8] py-20 lg:py-28"><div className="container grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-red-600">Masalahnya bukan kompetensi Anda</p><h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">Yang menggagalkan tender sering kali adalah detail kecil.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[["01", "SBU habis masa berlaku", "Tidak ada radar yang mengingatkan sebelum tender datang."], ["02", "SKK tidak match", "Jabatan, jenjang, atau subklasifikasi tidak sesuai paket pekerjaan."], ["03", "KBLI kode lama", "Satu kode yang keliru membuat perusahaan terlihat tidak eligible."]].map(([n, t, d]) => <motion.div key={n} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} className="border-l-2 border-[#d9aa42] bg-white p-5 shadow-sm"><p className="font-mono text-xs text-[#d9aa42]">{n}</p><h3 className="mt-8 font-bold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p></motion.div>)}</div></div></section>

      <section id="layanan" className="bg-white py-20 lg:py-28"><div className="container"><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[.2em] text-[#b18425]">Layanan end-to-end</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Semua dokumen penting, satu partner yang bertanggung jawab.</h2><p className="mt-5 text-lg leading-relaxed text-slate-500">Anda tidak perlu lagi mengejar banyak vendor, menerjemahkan regulasi sendiri, atau menebak progres. Kami pegang alurnya dari eligibility sampai dokumen siap dipakai.</p></div><div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">{services.map(([title, desc, Icon], i) => { const ServiceIcon = Icon as typeof HardHat; return <motion.div key={title as string} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * .04 }} className="group bg-white p-6 transition-colors hover:bg-[#071a31]"><ServiceIcon className="h-6 w-6 text-[#b18425] transition-colors group-hover:text-[#e4b84f]" /><h3 className="mt-8 font-bold group-hover:text-white">{title as string}</h3><p className="mt-2 text-sm text-slate-500 group-hover:text-slate-300">{desc as string}</p><ArrowRight className="mt-6 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#e4b84f]" /></motion.div> })}</div></div></section>

      <section className="bg-[#071a31] py-20 text-white lg:py-28"><div className="container grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><Badge className="border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">Ditenagai Gustafta AI</Badge><h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">Kecepatan mesin. Ketelitian manusia.</h2><p className="mt-5 text-lg leading-relaxed text-slate-300">AI bekerja sebagai radar pertama: membaca, mencocokkan, dan menandai risiko. Tim Gustafta mengambil keputusan, berkoordinasi dengan lembaga, dan memastikan dokumen Anda benar-benar siap.</p><a href={wa} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 font-bold text-[#e4b84f]">Tanya Gustafta tentang dokumen Anda <ArrowRight className="h-4 w-4" /></a></div><div className="grid gap-3 sm:grid-cols-2">{aiTools.map(({ name, label, icon: Icon, color }, i) => <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} className="rounded-xl border border-white/10 bg-white/[.06] p-5"><Icon className={`h-7 w-7 ${color}`} /><div className="mt-8 flex items-end justify-between"><div><h3 className="font-bold">{name}</h3><p className="mt-1 text-sm text-slate-400">{label}</p></div><span className="font-mono text-xs text-emerald-300">READY</span></div></motion.div>)}</div></div></section>

      <section className="bg-[#eef1f3] py-20 lg:py-28"><div className="container"><div className="mx-auto max-w-2xl text-center"><p className="font-mono text-xs uppercase tracking-[.2em] text-[#b18425]">Alur kerja tanpa drama</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Dari panik menjadi terkendali.</h2></div><div className="relative mt-14 grid gap-8 md:grid-cols-4">{[["01", "Kirim kebutuhan", "Ceritakan tender, sertifikat, atau kendala Anda melalui WhatsApp."], ["02", "AI cek kelayakan", "Kami petakan dokumen yang ada, yang kurang, dan risiko penolakannya."], ["03", "Tim eksekusi", "Spesialis Gustafta menyiapkan, mengurus, dan mengawal prosesnya."], ["04", "Siap digunakan", "Dokumen selesai, progres terdokumentasi, renewal diingatkan."]].map(([n, t, d]) => <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#071a31] font-mono text-sm font-bold text-[#e4b84f]">{n}</div><h3 className="font-bold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p></motion.div>)}</div></div></section>

      <section className="bg-white py-20 lg:py-28"><div className="container grid gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-[#b18425]">Mengapa Gustafta</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Kami bicara bahasa lapangan, bukan bahasa brosur.</h2><div className="mt-8 space-y-5">{["Pendampingan dari orang yang memahami alur LPJK, asosiasi, Kemnaker, dan BNSP.", "Satu sumber kebenaran untuk status dokumen, deadline, dan tindakan berikutnya.", "AI membantu menemukan celah lebih cepat — keputusan tetap dikawal tenaga ahli Gustafta.", "Progress transparan. Tidak ada lagi “masih diproses” tanpa penjelasan."].map(t => <div key={t} className="flex gap-3"><div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d9aa42] text-[#071a31]"><Check className="h-3 w-3" /></div><p className="leading-relaxed text-slate-600">{t}</p></div>)}</div></div><div className="rounded-2xl bg-[#071a31] p-8 text-white shadow-xl sm:p-10"><FileCheck2 className="h-10 w-10 text-[#e4b84f]" /><p className="mt-8 text-3xl font-black leading-tight">“Kalau dokumen Anda menentukan menang atau gugur, jangan serahkan pada keberuntungan.”</p><p className="mt-6 text-sm text-slate-400">— Prinsip kerja Gustafta</p></div></div></section>

      <section className="bg-[#f4f6f8] py-20"><div className="container max-w-3xl"><div className="text-center"><p className="font-mono text-xs uppercase tracking-[.2em] text-[#b18425]">Pertanyaan yang sering muncul</p><h2 className="mt-4 text-4xl font-black tracking-tight">Sebelum Anda menghubungi kami</h2></div><div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">{[["Bisa konsultasi jika tender saya tinggal beberapa hari?", "Bisa. Justru semakin cepat Anda menghubungi kami, semakin jelas prioritas tindakan yang harus dilakukan. Kami mulai dari screening risiko dan memberikan opsi paling realistis."],["Apakah layanan ini hanya untuk perusahaan besar?", "Tidak. Kami mendampingi BUJK dari kualifikasi kecil hingga besar, termasuk perusahaan yang baru menyiapkan SBU, SKK, atau konversi KBLI."],["Apa yang harus saya siapkan untuk mulai?", "Kirimkan kebutuhan tender atau foto/scan dokumen yang tersedia. Tim kami akan membantu memetakan sisanya — Anda tidak perlu memahami seluruh regulasi terlebih dahulu."]].map(([q, a], i) => <div key={q} className="py-5"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between text-left font-bold">{q}<ChevronDown className={`h-5 w-5 shrink-0 text-[#b18425] transition-transform ${openFaq === i ? "rotate-180" : ""}`} /></button>{openFaq === i && <p className="mt-3 max-w-2xl pr-8 text-sm leading-relaxed text-slate-500">{a}</p>}</div>)}</div></div></section>

      <section className="relative overflow-hidden bg-[#d9aa42] py-20 text-[#071a31] lg:py-28"><div className="absolute right-0 top-0 h-full w-1/3 opacity-20" style={{ backgroundImage: "radial-gradient(#071a31 1px, transparent 1px)", backgroundSize: "14px 14px" }} /><div className="container relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="font-mono text-xs uppercase tracking-[.2em]">Jangan tunggu sampai gugur</p><h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Besok tender. Hari ini, pastikan dokumen Anda aman.</h2><p className="mt-5 max-w-xl text-lg leading-relaxed text-[#26364a]">Kirim kebutuhan Anda. Tim Gustafta akan membantu menentukan langkah pertama — tanpa biaya konsultasi awal.</p></div><a href={wa} target="_blank" rel="noreferrer"><Button size="lg" className="h-14 bg-[#071a31] px-8 text-base font-bold text-white hover:bg-[#102943]"><MessageCircle className="mr-2 h-5 w-5" />Mulai Konsultasi via WhatsApp</Button></a></div></section>

      <footer id="footer" className="bg-[#071a31] py-10 text-slate-400"><div className="container flex flex-col justify-between gap-6 text-sm md:flex-row md:items-center"><div><div className="flex items-center gap-2 text-white"><Building2 className="h-5 w-5 text-[#e4b84f]" /><span className="font-bold">by Gustafta</span></div><p className="mt-2 text-xs">Partner kepatuhan konstruksi Anda. Powered by DokumenProyek.com & Gustafta AI.</p></div><div className="flex items-center gap-5"><Link href="/" className="hover:text-white">DokumenProyek.com</Link><a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#e4b84f] hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp Gustafta</a></div></div></footer>
    </main>
  );
}