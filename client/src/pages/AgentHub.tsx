import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Bot, Sparkles, Send, FileText, Shield, BarChart3, DollarSign,
  ChevronRight, Zap, CheckCircle, Clock, AlertCircle, Loader2, Network,
  Cpu, Activity, Building2, Award, GraduationCap, FolderOpen, Search,
  BookMarked, Users, ShieldCheck, Leaf, HardHat, ClipboardList, Scan, FileCheck,
  Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type AgentStatus = "idle" | "thinking" | "working" | "done" | "error";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  capabilities: string[];
  status: AgentStatus;
  pageLink?: string;
}

interface Message {
  id: string;
  role: "user" | "orchestrator" | "agent";
  agentId?: string;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

const AGENTS: Agent[] = [
  {
    id: "legalitas",
    name: "Agen Legalitas",
    role: "Perizinan, NIB, OSS, AHU",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Pendirian PT/CV, NIB OSS, KBLI, NPWP Badan Usaha, AHU, perubahan data usaha.",
    capabilities: ["Pendirian PT, CV & Firma", "NIB via OSS", "NPWP & KBLI Badan Usaha", "Perubahan Akta & AHU"],
    status: "idle",
    pageLink: "/legalitas",
  },
  {
    id: "perizinan",
    name: "Agen Perizinan",
    role: "SIUJK, Izin Sektoral, AMDAL",
    icon: ShieldCheck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "Izin operasional sektoral, SIUJK/IUJK konstruksi, izin lingkungan, perizinan OSS.",
    capabilities: ["SIUJK & IUJK Konstruksi", "Izin lingkungan & AMDAL", "Perizinan OSS sektoral", "Perpanjangan izin usaha"],
    status: "idle",
    pageLink: "/oss-rba",
  },
  {
    id: "sbu",
    name: "Agen Sertifikasi SBU",
    role: "SBU Kontraktor & Konsultan",
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "SBU LPJK untuk kontraktor dan konsultan — klasifikasi, kualifikasi, renewal, upgrade.",
    capabilities: ["SBU Kontraktor (Sipil, ME, Arsitektur)", "SBU Konsultan Perencana & Pengawas", "Upgrade & perpanjangan SBU", "Integrasi data SIKI LPJK"],
    status: "idle",
    pageLink: "/sbu",
  },
  {
    id: "skk",
    name: "Agen Sertifikasi SKK",
    role: "SKK Tenaga Ahli & Terampil",
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "SKK untuk tenaga ahli dan terampil sesuai SK Dirjen BK No. 114/2024 — uji kompetensi, resertifikasi, BNSP.",
    capabilities: ["SKK Tenaga Ahli (jenjang 6–9)", "SKK Tenaga Terampil (jenjang 1–5)", "Uji kompetensi LSP/BNSP", "Perpanjangan & upgrade SKK"],
    status: "idle",
    pageLink: "/skk",
  },
  {
    id: "iso",
    name: "Agen ISO & SMK3",
    role: "Sistem Manajemen & Sertifikasi",
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "ISO 9001, 14001, 45001, 37001, SMK3, gap analysis, implementasi, dan audit readiness.",
    capabilities: ["Gap Analysis ISO & SMK3", "Penyusunan dokumen sistem", "Pendampingan audit sertifikasi", "Surveillance & resertifikasi"],
    status: "idle",
    pageLink: "/iso-smk3",
  },
  {
    id: "tender",
    name: "Agen Tender",
    role: "Go/No-Go, Compliance, Submit",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Tender eligibility, compliance matrix, review administrasi/teknis/harga, pendampingan submit.",
    capabilities: ["Go / No-Go Scoring", "Compliance Matrix Builder", "Review Adm, Teknis, Harga", "Final Submission Checklist"],
    status: "idle",
    pageLink: "/tender-generator",
  },
  {
    id: "proyek",
    name: "Agen Proyek",
    role: "Kontrak, Laporan, Close-Out",
    icon: FolderOpen,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "Administrasi proyek dari kontrak, pelaksanaan, submittal, perubahan, hingga serah terima.",
    capabilities: ["Kontrak kerja & addendum", "Berita acara & laporan progress", "Submittal & RFI register", "Close-out & arsip proyek"],
    status: "idle",
    pageLink: "/proyek",
  },
  {
    id: "knowledge",
    name: "Agen Knowledge",
    role: "Regulasi, FAQ, Drafting",
    icon: BookMarked,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    description: "Tanya jawab regulasi, FAQ layanan, drafting surat/checklist/email, penjelasan persyaratan.",
    capabilities: ["Tanya jawab regulasi konstruksi", "Draft surat & email bisnis", "FAQ & panduan persyaratan", "Penjelasan istilah teknis"],
    status: "idle",
    pageLink: "/ai-chat",
  },
  {
    id: "docreview",
    name: "Agen Document Review",
    role: "OCR, Validasi, Gap Analysis",
    icon: Scan,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    description: "OCR & ekstraksi dokumen, identifikasi mismatch data, expiry tracking, versi & validasi format.",
    capabilities: ["OCR & ekstraksi isi dokumen", "Deteksi mismatch & data tidak sinkron", "Expiry tracking & alert perpanjangan", "Validasi format & kelengkapan file"],
    status: "idle",
    pageLink: "/doc-generator",
  },
  {
    id: "intake",
    name: "Agen Sales & Intake",
    role: "Lead, Konsultasi Awal, Estimasi",
    icon: HardHat,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "Lead qualification, konsultasi awal, rekomendasi layanan, estimasi biaya & waktu pengurusan.",
    capabilities: ["Chatbot konsultasi awal & FAQ layanan", "Lead qualification & scoring", "Rekomendasi paket layanan", "Estimasi biaya & timeline proses"],
    status: "idle",
    pageLink: "/ai-chat",
  },
  {
    id: "docgen",
    name: "Agen Document Generator",
    role: "Draft Legalitas, Tender, Proyek",
    icon: FileCheck,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    description: "Drafting dokumen legalitas, perizinan, sertifikasi, tender, dan proyek — template-based, siap review pusat.",
    capabilities: ["Draft dokumen tender & penawaran", "Draft kontrak & dokumen proyek", "Generator checklist & matriks kepatuhan", "Sinkronisasi ke alur review pusat"],
    status: "idle",
    pageLink: "/doc-generator",
  },
];

const QUICK_PROMPTS = [
  { icon: Award, text: "Persyaratan SBU Kontraktor Kualifikasi Menengah terbaru?", agent: "sbu" },
  { icon: FileText, text: "Bantu analisis Go/No-Go untuk tender yang mau saya ikuti", agent: "tender" },
  { icon: GraduationCap, text: "Cara mengurus SKK Tenaga Ahli Sipil Madya — step by step", agent: "skk" },
  { icon: ShieldCheck, text: "Gap analysis ISO 9001:2015 untuk kontraktor konstruksi", agent: "iso" },
  { icon: Building2, text: "Panduan pendirian PT BUJK baru — dari notaris sampai NIB OSS", agent: "legalitas" },
  { icon: FileCheck, text: "Tolong buatkan draft dokumen penawaran tender untuk proyek Rp 2M", agent: "docgen" },
];

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === "idle") return null;
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] px-1.5 py-0 h-4", {
        "border-blue-400 text-blue-600 bg-blue-50": status === "thinking",
        "border-amber-400 text-amber-600 bg-amber-50": status === "working",
        "border-green-400 text-green-600 bg-green-50": status === "done",
        "border-red-400 text-red-600 bg-red-50": status === "error",
      })}
    >
      {status === "thinking" && "Berpikir..."}
      {status === "working" && "Mengerjakan"}
      {status === "done" && "Selesai ✓"}
      {status === "error" && "Error"}
    </Badge>
  );
}

function AgentCard({ agent, isActive }: { agent: Agent; isActive: boolean }) {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-xl p-3 transition-all duration-300",
        agent.bgColor,
        agent.borderColor,
        isActive && "ring-2 ring-offset-1 ring-current shadow-md scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn("p-1.5 rounded-lg bg-white shadow-sm flex-shrink-0", agent.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-xs text-slate-800 leading-tight">{agent.name}</h4>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">{agent.role}</p>
        </div>
      </div>
      {agent.pageLink && (
        <div className="mt-2 pt-2 border-t border-current/10">
          <Link href={agent.pageLink}>
            <div className={cn("flex items-center gap-1 text-[10px] font-semibold cursor-pointer hover:underline", agent.color)} data-testid={`link-agent-page-${agent.id}`}>
              <ChevronRight className="w-3 h-3" /> Buka Halaman Layanan
            </div>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function ChatMessage({ msg, agents }: { msg: Message; agents: Agent[] }) {
  const agent = agents.find((a) => a.id === msg.agentId);

  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
        <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed break-words overflow-x-auto">
          {msg.content}
        </div>
      </motion.div>
    );
  }

  if (msg.role === "orchestrator") {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Network className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-1">Orchestrator OpenClaw</p>
          <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm text-slate-700 leading-relaxed break-words overflow-x-auto">
            {msg.isThinking ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis & mendelegasikan ke agen spesialis...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-headings:my-1">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (msg.role === "agent" && agent) {
    const Icon = agent.icon;
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 ml-6">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm bg-white border", agent.color)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 mb-1">{agent.name}</p>
          <div className={cn("border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm text-slate-700 leading-relaxed break-words overflow-x-auto", agent.bgColor, agent.borderColor)}>
            {msg.isThinking ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sedang mengerjakan tugas...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-headings:my-1 break-words overflow-x-auto">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
}

const DEMO_FLOWS: Record<string, Array<{ role: "orchestrator" | "agent"; agentId?: string; content: string; delay: number }>> = {
  legalitas: [
    { role: "orchestrator", content: "Intent terdeteksi: pendirian BUJK baru. Mendelegasikan ke Agen Legalitas untuk panduan end-to-end berbasis regulasi OSS-RBA 2024.", delay: 800 },
    {
      role: "agent", agentId: "legalitas",
      content: `Saya bantu panduan pendirian PT untuk BUJK (Badan Usaha Jasa Konstruksi) baru, sesuai regulasi terkini.

**TAHAP 1 — Pendirian PT (Notaris & AHU)**
Dasar hukum: UU No. 40/2007 tentang PT + PP No. 8/2021 (PTPerseorangan)
• Akta Pendirian PT (dibuat oleh Notaris)
• Pengesahan SK Kemenkumham via sistem AHU Online
• Anggaran Dasar, Daftar Pemegang Saham, Susunan Direksi/Komisaris
• Modal dasar minimum PT reguler: Rp 1,- (sejak PP 8/2021 dihapus minimum)
⏱️ Estimasi: 5–10 hari kerja | Biaya notaris: Rp 3–8 juta

**TAHAP 2 — NIB & Perizinan Dasar via OSS-RBA**
Sistem: oss.go.id (berbasis Risk Based Approach — PP No. 28/2025)
• NIB (Nomor Induk Berusaha) — berlaku seumur hidup
• KBLI yang tepat untuk konstruksi (pilihan KBLI 41, 42, 43)
• NPWP Badan Usaha — via DJP Online atau KPP terdekat
• Persetujuan Teknis & izin sektoral jika diperlukan
⏱️ Estimasi: 3–7 hari kerja

**TAHAP 3 — Rekening & Dokumen Operasional**
• Rekening bank atas nama PT (bukan rekening pribadi)
• SKDP / domisili perusahaan (dari RT/RW/Kelurahan)
• Stempel perusahaan, kop surat, email resmi domain

**TAHAP 4 — Selanjutnya (setelah legalitas selesai)**
Setelah PT & NIB aktif → proses SBU LPJK dan SIUJK bisa dimulai secara paralel.

⚠️ Catatan penting: Pasca OSS-RBA, izin tidak lagi berbentuk SIUP terpisah — semua terintegrasi dalam NIB + Persetujuan Kegiatan Usaha.

Saya siapkan checklist dokumen lengkap sesuai bidang usaha Anda?`,
      delay: 2500,
    },
  ],
  perizinan: [
    { role: "orchestrator", content: "Kebutuhan perizinan terdeteksi. Mendelegasikan ke Agen Perizinan — analisis kelayakan SIUJK dimulai.", delay: 800 },
    {
      role: "agent", agentId: "perizinan",
      content: `Saya bantu pengurusan SIUJK (Surat Izin Usaha Jasa Konstruksi) sesuai regulasi terbaru.

**DASAR HUKUM SIUJK**
• UU No. 2/2017 tentang Jasa Konstruksi
• Permen PU No. 6/2025 tentang Tata Cara Sertifikasi SBU
• OSS-RBA (PP No. 28/2025 — terbaru)

**PERSYARATAN SIUJK — Checklist Lengkap:**
□ NIB aktif dengan KBLI konstruksi (41xxx / 42xxx / 43xxx)
□ SBU yang sudah terbit dari LPJK (WAJIB — tidak bisa SIUJK tanpa SBU)
□ Akta pendirian PT + SK Kemenkumham terbaru
□ NPWP Perusahaan (aktif & tidak dalam pembekuan)
□ KTP + NPWP semua Pengurus (Direksi & Komisaris)
□ SKK Penanggung Jawab Teknis (PJT) sesuai bidang
□ Bukti pembayaran PKB (Pajak Kendaraan Bermotor) jika ada aset

**PROSES PENGAJUAN:**
1. Submit via OSS-RBA → pilih izin SIUJK sektoral
2. Sistem meneruskan ke Dinas PUPR/PU Kabupaten/Kota
3. Verifikasi lapangan (opsional untuk gred tertentu)
4. Penerbitan SIUJK digital via portal OSS
⏱️ Waktu: 7–21 hari kerja
📅 Masa berlaku: 3 tahun → perpanjang sebelum kedaluwarsa

**⚠️ RED FLAG PALING SERING:**
→ SBU belum terbit → SIUJK tidak bisa diproses
→ KBLI di NIB tidak sesuai bidang konstruksi → ditolak sistem
→ SKK PJT tidak sesuai klasifikasi SBU → revisi wajib

Apakah SBU Anda sudah terbit? Kalau belum, Agen SBU saya koordinasikan agar diproses paralel dengan persiapan SIUJK.`,
      delay: 2500,
    },
  ],
  sbu: [
    { role: "orchestrator", content: "Permintaan SBU diterima. Memuat regulasi terbaru PP No. 28/2025 & Permen PU No. 6/2025. Mendelegasikan ke Agen SBU untuk analisis persyaratan.", delay: 800 },
    {
      role: "agent", agentId: "sbu",
      content: `Saya bantu pengurusan SBU (Sertifikat Badan Usaha) Konstruksi dari LPJK, sesuai regulasi terbaru **PP No. 28 Tahun 2025** dan **Permen PU No. 6 Tahun 2025**.

**🆕 PERUBAHAN UTAMA PP 28/2025 & PERMEN PU 6/2025:**
→ Seluruh proses SBU kini 100% digital via portal LPJK (tidak ada pengajuan manual)
→ Verifikasi LPJK dipercepat: maks. 14 hari kerja (sebelumnya 30 hari)
→ Laporan keuangan sederhana cukup untuk gred K1 dan K2 (tidak wajib audit KAP)
→ Subklasifikasi baru: bidang EBT (Energi Baru Terbarukan) & infrastruktur digital
→ Integrasi SIKI ↔ OSS-RBA ↔ SIPD otomatis & real-time
→ Sanksi lebih tegas: beroperasi tanpa SBU = sanksi administratif + pidana

**STRUKTUR KUALIFIKASI SBU KONSTRUKSI (PP 28/2025 & Permen PU 6/2025):**
├─ Kecil 1 (K1) : s/d Rp 2 miliar
├─ Kecil 2 (K2) : > Rp 2M s/d Rp 7,5 miliar
├─ Kecil 3 (K3) : > Rp 7,5M s/d Rp 15 miliar
├─ Menengah (M)  : > Rp 15M s/d Rp 50 miliar
└─ Besar (B)     : di atas Rp 50 miliar

**PERSYARATAN SBU KONTRAKTOR KUALIFIKASI MENENGAH (M) — 2025:**

📋 Dokumen Badan Usaha:
□ Akta PT + SK Kemenkumham + AD terbaru
□ NIB aktif dengan KBLI konstruksi yang sesuai (terintegrasi OSS-RBA)
□ NPWP Badan Usaha aktif (taat pajak)
□ Laporan keuangan 2 tahun terakhir
□ Modal disetor terverifikasi min. Rp 500 juta (M1, PP 28/2025)

👷 Persyaratan SDM Bersertifikat SKK:
□ Min. 1 Penanggung Jawab Teknis (PJT) — SKK jenjang 7 (Ahli Madya)
□ Min. 1 Penanggung Jawab Bidang (PJB) — SKK jenjang 6
□ Min. 2 Tenaga Teknis bersertifikat SKK sesuai bidang
□ SKK harus MASIH BERLAKU & tidak boleh diklaim 2 perusahaan

📊 Persyaratan Pengalaman & Peralatan:
□ Referensi proyek selesai + Berita Acara Serah Terima (BAST)
□ Daftar peralatan konstruksi (milik/sewa) + bukti kepemilikan

**ALUR PROSES PORTAL LPJK (Permen PU 6/2025):**
1. Registrasi akun portal LPJK (portal.lpjk.go.id)
2. Pilih subklasifikasi & gred yang ditargetkan
3. Daftar dan rekomendasi dari Asosiasi BUJK terakreditasi (max 7 hari)
4. Upload semua dokumen persyaratan via portal
5. Verifikasi LPJK — max 14 hari kerja
6. Bayar PNBP via Simponi/bank persepsi
7. SBU digital terbit & terintegrasi ke SIKI + OSS otomatis

⏱️ Total estimasi: 14–21 hari kerja | Biaya PNBP: Rp 2–3,5 juta (M1)

📌 Lihat detail lengkap, checklist interaktif per gred, dan subklasifikasi di halaman SBU Platform (/sbu)

SKK PJT sudah ada? Saya koordinasikan dengan Agen SKK untuk proses paralel agar lebih efisien.`,
      delay: 2500,
    },
  ],
  skk: [
    { role: "orchestrator", content: "Kebutuhan SKK terdeteksi. Mengakses knowledge base SK Dirjen Bina Konstruksi No. 114/2024 & regulasi BNSP terbaru. Mendelegasikan ke Agen Sertifikasi SKK.", delay: 800 },
    {
      role: "agent", agentId: "skk",
      content: `Saya bantu proses SKK (Sertifikat Kompetensi Kerja) sesuai UUJK No.2/2017 & PerBNSP terbaru.

**MENGAPA SKK KRUSIAL SEKARANG?**
Per Pasal 70 UUJK 2017: setiap tenaga kerja konstruksi WAJIB memiliki SKK.
BNSP 2024: ada 4 juta+ tenaga kerja konstruksi yang belum bersertifikat.
Tanpa SKK PJT → SBU tidak bisa diterbitkan → tidak bisa ikut tender.

**SKK KONSTRUKSI — SK Dirjen Bina Konstruksi No. 114 Tahun 2024:**
Tidak ada lagi istilah SKA atau SKT. Semua menggunakan nomenklatur SKK dengan jabatan kerja dan jenjang KKNI.

**SKK Tenaga Ahli (Jenjang 6–9) — Minimal D4/S1:**
Jabatan Kerja & Jenjang (contoh Teknik Sipil):
• Ahli Muda (Jenjang 6): S1 + min. 2 thn pengalaman
• Ahli Madya (Jenjang 7): S1 + 5 thn / S2 + 2 thn
• Ahli Utama (Jenjang 8): S1 + 10 thn / S2 + 7 thn / S3

Bidang lain: Arsitektur, ME, Geoteknik, Hidrologi, Manajemen Proyek, K3 Konstruksi, dll.

**SKK Tenaga Terampil (Jenjang 1–5) — SMK/SMA/D3:**
• Pelaksana Lapangan Pekerjaan Gedung
• Surveyor Pemetaan, Estimator Biaya, Operator Alat Berat
• Mandor Konstruksi & Supervisor Lapangan

**ALUR PROSES SKK (via LSP Konstruksi):**
1. Pilih LSP yang terakreditasi BNSP sesuai bidang
2. Daftar asesmen — submit CV, ijazah, KTP, portofolio proyek
3. Verifikasi dokumen oleh asesor (3–7 hari)
4. Asesmen kompetensi — online atau tatap muka (1–2 hari)
5. Penerbitan SKK via portal BNSP (3–5 hari)
6. SKK terbit → data otomatis terhubung ke SIKI LPJK

⏱️ Total: 2–4 minggu
📅 Masa berlaku: 3 tahun (wajib diperpanjang berbasis portofolio & CPD)
💰 Biaya: Rp 500.000–2.500.000 per jabatan kerja

**JABATAN KERJA POPULER UNTUK SBU (sebagai PJT):**
✓ Ahli Teknik Sipil Madya/Utama
✓ Ahli Teknik Mekanikal Madya  
✓ Ahli Manajemen Proyek Muda/Madya
✓ Ahli K3 Konstruksi (wajib untuk ISO 45001 & SMK3)

Saya bantu identifikasi jabatan kerja & jenjang yang tepat berdasarkan latar belakang pendidikan dan pengalaman kerja Anda?`,
      delay: 2500,
    },
  ],
  iso: [
    { role: "orchestrator", content: "Permintaan ISO/SMK3 diterima. Mengakses knowledge base ISO 9001:2015 dan PP 50/2012 SMK3. Mendelegasikan ke Agen ISO & SMK3.", delay: 800 },
    {
      role: "agent", agentId: "iso",
      content: `Saya siap lakukan gap analysis ISO 9001:2015 untuk perusahaan konstruksi Anda.

**MENGAPA ISO MAKIN PENTING DI INDONESIA 2024:**
• 73% BUMN/BHMN besar mensyaratkan ISO 9001 di evaluasi teknis
• Proyek nilai > Rp 100M dari swasta asing mensyaratkan ISO 9001 + 14001
• ISO menambah 10–15 poin dalam penilaian kualifikasi tender
• SMK3 PP 50/2012 WAJIB untuk perusahaan risiko tinggi atau > 100 karyawan

**GAP ANALYSIS ISO 9001:2015 — 10 Klausul Utama:**

**Kl.4 — Konteks Organisasi**
☐ Identifikasi faktor eksternal & internal yang mempengaruhi mutu
☐ Pemahaman kebutuhan & harapan pihak berkepentingan (klien, subkon, regulator)
☐ Definisi ruang lingkup SMM (batas & penerapan)

**Kl.5 — Kepemimpinan**
☐ Komitmen Direktur terhadap kebijakan mutu
☐ Kebijakan mutu tertulis, dikomunikasikan & dipahami seluruh staf
☐ Penugasan peran & tanggung jawab secara eksplisit

**Kl.6 — Perencanaan**
☐ Penilaian risiko & peluang proyek terdokumentasi
☐ Sasaran mutu terukur (KPI proyek: biaya, waktu, kualitas, K3)

**Kl.7 — Dukungan**
☐ Kompetensi SDM — matriks kompetensi & pelatihan
☐ Infrastruktur proyek memenuhi standar
☐ Komunikasi internal & eksternal terstruktur

**Kl.8 — Operasi (PALING KRITIS untuk konstruksi)**
☐ Perencanaan & pengendalian operasional proyek
☐ Persyaratan produk/jasa dikomunikasikan ke klien
☐ Pengendalian proses eksternal (subkontraktor & vendor)
☐ Pengendalian output tidak sesuai (NCR)

**Kl.9 — Evaluasi Kinerja**
☐ Audit internal terjadwal (min. 1x/tahun)
☐ Kepuasan pelanggan diukur secara sistematis
☐ Tinjauan manajemen terdokumentasi

**Kl.10 — Peningkatan**
☐ Corrective action terhadap ketidaksesuaian
☐ Perbaikan berkelanjutan (kaizen mindset)

**ROADMAP SERTIFIKASI (4–6 Bulan):**
Bulan 1–1.5: Gap analysis & perencanaan dokumen
Bulan 2–3: Penyusunan manual mutu, prosedur, formulir
Bulan 3–4: Implementasi & pelatihan seluruh tim
Bulan 4–5: Audit internal + corrective action
Bulan 5–6: Audit sertifikasi oleh Lembaga Sertifikasi (BSN/SGS/TÜV/Bureau Veritas)
Bulan 6+: Surveillance audit tahunan

💰 Investasi total: Rp 35–120 juta (tergantung skala perusahaan & CB)
📊 Tingkat kelulusan audit pertama klien kami: 94%

Mau saya kirimkan template Kebijakan Mutu dan matriks risiko proyek konstruksi sebagai titik awal implementasi?`,
      delay: 2500,
    },
  ],
  tender: [
    { role: "orchestrator", content: "Analisis tender diminta. Memuat regulasi Perpres 12/2021 dan LKPP terbaru. Mendelegasikan ke Agen Tender.", delay: 800 },
    {
      role: "agent", agentId: "tender",
      content: `Saya bantu evaluasi kelayakan tender dan persiapan dokumen penawaran berbasis Perpres 12/2021.

**FAKTA PENTING SEBELUM MEMUTUSKAN IKUT TENDER:**
Data LKPP 2023: 68% penolakan tender disebabkan kekurangan/ketidaksesuaian dokumen administrasi — bukan harga atau teknis.
Kerugian rata-rata per gagal tender: Rp 15–45 juta (biaya persiapan, waktu tim, opportunity cost).

**TAHAP 1 — GO / NO-GO SCORING (7 Dimensi):**

① SBU & Klasifikasi (Critical — 30 poin)
→ Apakah SBU sesuai subklasifikasi pekerjaan yang dilelang?
→ Apakah gred SBU sesuai nilai pekerjaan?

② Tenaga Ahli / SKK (Critical — 25 poin)
→ Apakah tersedia tenaga ahli ber-SKK yang valid & tidak dipakai di tender lain?
→ Jabatan kerja sesuai syarat dokumen pemilihan?

③ Pengalaman Perusahaan (Penting — 20 poin)
→ Apakah ada pengalaman sejenis dengan nilai memadai?
→ Referensi proyek sesuai persyaratan?

④ Kemampuan Keuangan (Penting — 15 poin)
→ KD (Kemampuan Dasar) = 2× nilai tertinggi proyek sejenis dalam 10 tahun
→ Rekening koran menunjukkan likuiditas yang memadai?

⑤ Kapasitas Teknis & Peralatan (Sedang — 5 poin)
→ Peralatan utama tersedia / dapat disewa?

⑥ Risiko & Timeline (Pertimbangan — 3 poin)
→ Deadline penawaran realistis?
→ Risiko keterlambatan teridentifikasi?

⑦ Kompetisi & Strategi Harga (Pertimbangan — 2 poin)
→ Estimasi jumlah peserta & posisi harga?

**Skor ≥ 75: GO | 50–74: Pertimbangkan | < 50: NO-GO (dengan alasan)**

**TAHAP 2 — COMPLIANCE MATRIX (berdasarkan Dok. Pemilihan):**
Upload Dokumen Pengadaan → AI saya ekstrak seluruh persyaratan → buat matriks status pemenuhan otomatis → identifikasi red flag kritis.

**TAHAP 3 — DOKUMEN WAJIB (sesuai Perpres 12/2021):**
✅ Surat Penawaran + meterai digital Rp 10.000
✅ Jaminan Penawaran (untuk kontrak > Rp 2,5M)
✅ Pakta Integritas (wajib semua lelang)
✅ Formulir Isian Kualifikasi (FIK)
✅ Bukti pengalaman + BAST proyek sejenis
✅ Daftar personel + SKK valid
✅ Daftar peralatan + bukti kepemilikan/sewa
✅ Metode pelaksanaan & jadwal pelaksanaan
✅ BOQ + Analisa Harga Satuan
✅ NPWP + SPT tahunan terakhir

**POST-MORTEM (jika pernah kalah sebelumnya):**
Upload surat pengumuman hasil tender sebelumnya → saya analisis faktor kegagalan dan buat strategi perbaikan untuk tender berikutnya.

Apakah ada dokumen pemilihan yang bisa Anda upload sekarang? Saya buat compliance matrix spesifik untuk paket tender tersebut.`,
      delay: 2500,
    },
  ],
  proyek: [
    { role: "orchestrator", content: "Kebutuhan dokumen proyek terdeteksi. Mengidentifikasi fase proyek dan memuat template kontrak konstruksi. Mendelegasikan ke Agen Proyek.", delay: 800 },
    {
      role: "agent", agentId: "proyek",
      content: `Saya bantu persiapan dokumentasi proyek dari kontrak hingga close-out — rapi, terstruktur, dan siap audit.

**MENGAPA DOKUMENTASI PROYEK PENTING?**
Proyek tanpa dokumen yang rapi = risiko klaim ditolak, dispute tidak terselesaikan, dan audit gagal. Data lapangan: 65% sengketa konstruksi bisa dicegah dengan dokumentasi yang benar sejak awal.

**A. DOKUMEN PRA-KONSTRUKSI:**
□ Kontrak kerja konstruksi (KKK) sesuai UU No. 2/2017
□ Surat Perintah Mulai Kerja (SPMK)
□ Kick-off meeting minutes (semua pihak hadir & tanda tangan)
□ Project Execution Plan (PEP)
□ Schedule mobilisasi personel, alat, dan material
□ Rencana K3 Konstruksi (wajib untuk proyek berisiko)
□ Rencana Mutu Kontrak (RMK) — sesuai BPKP & internal audit

**B. DOKUMEN PELAKSANAAN (Ongoing):**
□ Laporan harian proyek (form standar PUPR)
□ Laporan mingguan progres (kurva S vs. rencana)
□ Laporan bulanan ke owner (format sesuai kontrak)
□ Request for Information (RFI) register — terlacak nomor & tanggal
□ Submittal register — material, gambar kerja, shop drawing
□ Non-Conformance Report (NCR) — setiap ketidaksesuaian
□ Berita Acara Kemajuan Pekerjaan (per termin pembayaran)
□ Foto dokumentasi progres (tanggal & lokasi)

**C. DOKUMEN PERUBAHAN:**
□ Berita Acara Tambah Kurang (BATK) — setiap variasi pekerjaan
□ Change Order Request (COR) dari kontraktor
□ Addendum kontrak (perubahan signifikan nilai/lingkup/waktu)
□ Perpanjangan waktu (Time Extension Request) + justifikasi

**D. DOKUMEN KLAIM:**
□ Notice of Claim (NOC) — WAJIB disampaikan dalam 28 hari (FIDIC)
□ Substantiasi klaim — delay analysis, cost record
□ Korespondensi site instruction, variation order
□ Dokumentasi force majeure (jika ada)

**E. DOKUMEN PENUTUPAN (Close-Out):**
□ Berita Acara Serah Terima I (BAST-I) — fisik pekerjaan selesai
□ Punch list & defect list (masa pemeliharaan)
□ Berita Acara Serah Terima II (BAST-II) — setelah DLP
□ As-built drawing — gambar akhir kondisi terpasang
□ Operation & Maintenance Manual (untuk bangunan)
□ Final Account & rekapitulasi keuangan proyek
□ Arsip proyek digital (min. 10 tahun per regulasi)

Proyek Anda sekarang di fase mana? Saya siapkan template dokumen yang sesuai dan checklist spesifik per fase.`,
      delay: 2500,
    },
  ],
  docreview: [
    { role: "orchestrator", content: "Permintaan review dokumen terdeteksi. Mengaktifkan Agen Document Review untuk validasi, gap analysis, dan deteksi potensi masalah.", delay: 800 },
    {
      role: "agent", agentId: "docreview",
      content: `Saya bantu Anda melakukan review dan validasi dokumen usaha secara menyeluruh — dari OCR, gap analysis, hingga deteksi expiry.

**LAYANAN DOCUMENT REVIEW YANG SAYA BERIKAN:**

🔍 **OCR & Ekstraksi Dokumen:**
• Baca isi dokumen PDF/scan secara otomatis
• Ekstrak data kunci: nama perusahaan, nomor dokumen, tanggal terbit, masa berlaku
• Identifikasi jenis dokumen dan kelengkapan halaman

⚠️ **Deteksi Mismatch & Inkonsistensi:**
• Nama perusahaan tidak konsisten antar dokumen
• Nomor NIB tidak sinkron di SIUJK vs SBU
• Alamat berbeda antara akta dan NIB
• KBLI di NIB tidak sesuai dengan subklasifikasi SBU

📅 **Expiry Tracking & Alert:**
• SBU — masa berlaku 3 tahun (perlu renewal sebelum habis)
• SKK Tenaga Ahli — berlaku 5 tahun
• ISO — siklus 3 tahun + surveillance tahunan
• SIUJK — perpanjangan periodik
• Status dokumen: ✅ Aktif | ⚠️ Akan habis < 90 hari | ❌ Sudah habis

📋 **Gap Analysis untuk Tender:**
Banyak perusahaan gagal tender karena dokumen tidak sinkron. Saya bisa deteksi:
• Dokumen wajib tender yang belum ada
• Dokumen yang sudah expired saat upload
• Data perusahaan yang tidak match dengan dokumen pemilihan
• Format dokumen tidak sesuai persyaratan teknis

🗂️ **Validasi Format & Kelengkapan:**
• Legalisasi & cap basah
• Tanda tangan pejabat berwenang
• Stempel instansi penerbit
• Kesesuaian format dengan standar LPJK / OSS / LKPP

Silakan ceritakan dokumen apa yang ingin Anda review, atau upload daftarnya — saya analisis dan berikan laporan gap analysis spesifik.`,
      delay: 2500,
    },
  ],
  intake: [
    { role: "orchestrator", content: "Permintaan konsultasi awal terdeteksi. Mengaktifkan Agen Sales & Intake untuk kualifikasi kebutuhan dan rekomendasi layanan.", delay: 800 },
    {
      role: "agent", agentId: "intake",
      content: `Halo! Saya bantu Anda menemukan layanan yang tepat dan memperkirakan proses, biaya, serta langkah selanjutnya.

**KONSULTASI AWAL — TIDAK PERLU BINGUNG MULAI DARI MANA**

Ceritakan situasi Anda. Saya akan langsung menilai:

📊 **Eligibility Check Cepat:**
Jawab 3 pertanyaan ini dan saya beri rekomendasi:
1. Perusahaan Anda sudah berdiri atau baru mau didirikan?
2. Anda bergerak di bidang apa? (konstruksi / konsultan / supplier / lainnya)
3. Ada kebutuhan mendesak? (mau ikut tender / sertifikat mau habis / proyek baru)

🎯 **Paket Layanan yang Sering Kami Rekomendasikan:**

**Paket Startup Contractor (BUJK Baru):**
→ Pendirian PT + NIB OSS + SBU K1 + 2 SKK Tenaga Ahli
→ Estimasi: 6–10 minggu | Rekomendasi untuk: BUJK baru yang mau masuk tender daerah

**Paket Tender Ready:**
→ SBU (upgrade/renewal) + Review dokumen tender + Compliance matrix
→ Estimasi: 2–4 minggu | Rekomendasi untuk: perusahaan yang sudah ada tapi mau mulai tender

**Paket ISO & Compliance:**
→ ISO 9001 + SMK3 + Audit readiness
→ Estimasi: 3–6 bulan | Rekomendasi untuk: perusahaan yang mau naik kualifikasi atau masuk proyek BUMN

**Paket Supply Chain Ready:**
→ Legalitas usaha + Vendor compliance + Sertifikasi pendukung
→ Estimasi: 4–8 minggu | Rekomendasi untuk: supplier/vendor yang mau masuk ekosistem proyek besar

💰 **Estimasi Biaya (Gambaran Umum):**
• SBU Kecil 1 (K1) s.d. Rp 2M: mulai Rp 3–7 juta
• SBU Kecil 2 (K2) s.d. Rp 7,5M: mulai Rp 5–10 juta
• SBU Kecil 3 (K3) s.d. Rp 15M: mulai Rp 8–15 juta
• SBU Menengah (M) s.d. Rp 50M: mulai Rp 12–20 juta
• SKK Tenaga Ahli (per orang): Rp 2–4 juta
• ISO 9001 (implementasi + sertifikasi): Rp 25–60 juta
• SMK3: Rp 20–50 juta
• Paket Startup Contractor lengkap: mulai Rp 15 juta

Ceritakan kebutuhan Anda lebih spesifik — saya buat estimasi yang akurat dan langkah-langkah yang perlu segera diambil.`,
      delay: 2500,
    },
  ],
  docgen: [
    { role: "orchestrator", content: "Permintaan pembuatan draft dokumen terdeteksi. Mengaktifkan Agen Document Generator — memilih template dan menyiapkan struktur dokumen sesuai kebutuhan.", delay: 800 },
    {
      role: "agent", agentId: "docgen",
      content: `Saya bantu draft dokumen perusahaan Anda — berbasis template terstruktur, siap direview tim pusat sebelum digunakan resmi.

**DOKUMEN YANG BISA SAYA DRAFTKAN:**

📋 **Dokumen Tender & Penawaran:**
□ Surat Penawaran Harga (format Perpres 12/2021)
□ Dokumen administrasi kualifikasi — daftar isian
□ Metode Pelaksanaan Pekerjaan (MPP)
□ Jadwal Pelaksanaan (Kurva S)
□ Compliance Matrix berdasarkan Dokumen Pemilihan
□ Surat Pernyataan (tidak masuk daftar hitam, tidak sedang kontrak eksklusif, dll.)
□ Checklist kelengkapan penawaran final

📁 **Dokumen Legalitas & Perizinan:**
□ Draft surat permohonan izin usaha
□ Surat kuasa pengurus dokumen
□ Pernyataan domisili usaha
□ Surat keterangan susunan pengurus
□ Dokumen perubahan anggaran dasar

🏅 **Dokumen Sertifikasi:**
□ Surat permohonan SBU / SKK ke asosiasi
□ Profil badan usaha untuk keperluan sertifikasi LPJK
□ CV tenaga ahli (format SIKI LPJK)
□ Rekaman pengalaman perusahaan & proyek

📦 **Dokumen Proyek:**
□ Draft kontrak kerja konstruksi (KKK) — sesuai UU 2/2017
□ Berita Acara Kemajuan Pekerjaan
□ Surat Perintah Mulai Kerja (SPMK)
□ Request for Information (RFI)
□ Laporan Harian / Mingguan / Bulanan (template PUPR)

⚙️ **Dokumen Sistem Manajemen:**
□ Kebijakan mutu & K3 perusahaan
□ Prosedur & instruksi kerja (ISO 9001/SMK3)
□ Form rekaman mutu & K3
□ Manual Mutu perusahaan

**ALUR DRAFT → REVIEW → FINAL:**
1. Saya generate draft berdasarkan input Anda
2. Draft masuk ke antrian review tim pusat
3. Tim review & validasi sesuai regulasi
4. Dokumen final siap digunakan

Untuk draft yang lebih presisi, ceritakan: dokumen apa, untuk proyek / layanan apa, dan profil perusahaan Anda. Saya buat draft yang siap langsung dipakai.`,
      delay: 2500,
    },
  ],
  knowledge: [
    { role: "orchestrator", content: "Pertanyaan umum diterima. Mengakses knowledge base regulasi konstruksi Indonesia. Mendelegasikan ke Agen Knowledge.", delay: 800 },
    {
      role: "agent", agentId: "knowledge",
      content: `Saya adalah knowledge agent dengan akses ke regulasi konstruksi Indonesia terkini. Berikut panduan lengkapnya.

**REGULASI UTAMA KONSTRUKSI INDONESIA 2024:**

📋 Legalitas & Perizinan:
• UU No. 40/2007 — Perseroan Terbatas
• PP No. 28/2025 — OSS berbasis Risiko (OSS-RBA) — menggantikan PP 5/2021
• PP No. 8/2021 — Modal Dasar PT

🏗️ Jasa Konstruksi:
• UU No. 2/2017 — Jasa Konstruksi (UUJK)
• PP No. 22/2020 — Pelaksanaan UUJK
• PP No. 28/2025 — Peraturan Pelaksanaan Jasa Konstruksi (terbaru)
• Permen PU No. 6/2025 — Tata Cara Sertifikasi SBU (menggantikan Permen PUPR 8/2022)
• SE LPJK tentang Teknis Pengajuan SBU 2025

🎓 Kompetensi & SKK:
• PerBNSP No. 2/2017 — Pedoman Pengembangan SKKNI
• SE Dirjen Bina Konstruksi 2024 — Wajib SKK per jabatan
• SKKNI Konstruksi (per bidang & sub-bidang)

📦 Pengadaan:
• Perpres No. 12/2021 — Pengadaan Barang/Jasa Pemerintah
• Perlem LKPP No. 12/2021 — Pengadaan Secara Elektronik
• Perlem LKPP No. 3/2021 — Tender Pascakualifikasi

⚙️ K3 & Lingkungan:
• PP No. 50/2012 — SMK3 (Wajib untuk > 100 karyawan / risiko tinggi)
• UU No. 32/2009 — Perlindungan Lingkungan Hidup
• PerMen LHK tentang AMDAL (terbaru 2021)

**FAQ PALING SERING DITANYAKAN:**

Q: Berapa lama proses SBU sekarang?
A: Dengan sistem SIKI LPJK terbaru (post Permen PUPR 8/2022), rata-rata 3–4 minggu jika dokumen lengkap. Bisa lebih lama jika SKK tenaga ahli belum ada.

Q: Apakah SKK bisa diurus paralel dengan SBU?
A: Ya, sangat disarankan. Proses paralel bisa memotong total waktu 2–3 minggu.

Q: ISO wajib untuk tender pemerintah?
A: Tidak wajib untuk semua, tetapi makin banyak proyek BUMN, BHMN, dan Kementerian PUPR yang mensyaratkan ISO 9001 di evaluasi teknis (penilaian kualifikasi).

Q: SMK3 wajib atau tidak?
A: PP 50/2012: wajib untuk perusahaan dengan > 100 karyawan ATAU pekerjaan dengan risiko bahaya tinggi. Tidak wajib = bisa terkena sanksi audit Kemenaker.

Q: Berapa biaya SBU Kualifikasi Kecil 1 (K1)?
A: Estimasi Rp 1,5–3 juta untuk asosiasi + administrasi LPJK. Di luar biaya SKK tenaga ahli.

Apa yang ingin Anda tanyakan lebih lanjut? Saya juga bisa bantu draft surat resmi, checklist kepatuhan, atau memberikan penjelasan pasal-pasal regulasi tertentu.`,
      delay: 2500,
    },
  ],
};

export default function AgentHub() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "orchestrator",
      content: `Selamat datang di OpenClaw Agent Hub — sistem multi-agent AI untuk kebutuhan dokumen dan compliance usaha konstruksi Indonesia.

Saya adalah **Orchestrator** yang menganalisis intent Anda, memecah tugas, dan mendelegasikan ke 11 agen spesialis secara real-time menggunakan OpenAI Agents SDK (GPT-4o) + RAG knowledge base regulasi Indonesia.

**11 Agen Spesialis — Siap Bekerja Sekarang:**
• 🏢 **Agen Legalitas** — Pendirian PT/CV, NIB OSS-RBA, KBLI, AHU, NPWP
• 🛡️ **Agen Perizinan** — SIUJK, IUJK, izin lingkungan, AMDAL, OSS sektoral
• 🏅 **Agen Sertifikasi SBU** — SBU LPJK (K1/K2/K3/Menengah/Besar/SP), Permen PU No. 6/2025
• 🎓 **Agen Sertifikasi SKK** — Tenaga Ahli & Terampil, LSP/BNSP, semua jabatan kerja & jenjang (SK Dirjen BK 114/2024)
• 🔒 **Agen ISO & SMK3** — ISO 9001/14001/45001/37001, PP 50/2012, gap analysis
• 📄 **Agen Tender** — Go/No-Go scoring, compliance matrix, Perpres 12/2021
• 📁 **Agen Proyek** — Kontrak KKK, laporan, BAST, klaim, close-out
• 📚 **Agen Knowledge** — Regulasi terkini, FAQ, draft surat & checklist
• 🔍 **Agen Document Review** — OCR, validasi, mismatch detection, expiry tracking
• 🎯 **Agen Sales & Intake** — Lead qualification, konsultasi awal, estimasi biaya & waktu
• ✍️ **Agen Document Generator** — Draft dokumen legalitas, tender, sertifikasi & proyek

**Cara menggunakannya:** Ketik pertanyaan Anda secara natural — saya deteksi intent dan routing ke agen yang tepat secara otomatis.

Contoh: *"Buatkan draft surat penawaran tender Rp 2M"*, *"Cek dokumen SBU saya apakah masih valid"*, atau *"Apa yang saya perlu siapkan untuk ikut tender pertama kali?"*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = { ...msg, id: Date.now().toString() + Math.random(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg.id;
  };

  const updateMessage = (id: string, update: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...update } : m)));
  };

  const updateAgentStatus = (agentId: string, status: AgentStatus) => {
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, status } : a)));
  };

  const detectAgent = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("draft") || lower.includes("buatkan") || lower.includes("generate dokumen") || lower.includes("template dokumen") || lower.includes("metode pelaksanaan") || lower.includes("surat penawaran")) return "docgen";
    if (lower.includes("review dokumen") || lower.includes("cek dokumen") || lower.includes("validasi dokumen") || lower.includes("ocr") || lower.includes("mismatch") || lower.includes("expired") || lower.includes("expiry")) return "docreview";
    if (lower.includes("konsultasi awal") || lower.includes("estimasi biaya") || lower.includes("paket layanan") || lower.includes("mau mulai") || lower.includes("baru mulai") || lower.includes("berapa biaya") || lower.includes("harga layanan")) return "intake";
    if (lower.includes("sbu") || lower.includes("lpjk") || lower.includes("subklasifikasi") || lower.includes("klasifikasi badan usaha")) return "sbu";
    if (lower.includes("skk") || lower.includes("ska") || lower.includes("skt") || lower.includes("tenaga ahli") || lower.includes("kompetensi kerja") || lower.includes("bnsp") || lower.includes("lsp")) return "skk";
    if (lower.includes("iso") || lower.includes("smk3") || lower.includes("sistem manajemen") || lower.includes("gap analysis") || lower.includes("audit")) return "iso";
    if (lower.includes("tender") || lower.includes("pengadaan") || lower.includes("penawaran") || lower.includes("go no go") || lower.includes("compliance matrix")) return "tender";
    if (lower.includes("proyek") || lower.includes("kontrak") || lower.includes("laporan") || lower.includes("bast") || lower.includes("berita acara") || lower.includes("klaim")) return "proyek";
    if (lower.includes("siujk") || lower.includes("iujk") || lower.includes("amdal") || lower.includes("izin lingkungan") || lower.includes("izin operasional")) return "perizinan";
    if (lower.includes("nib") || lower.includes("oss") || lower.includes("npwp") || lower.includes("kbli") || lower.includes("pendirian") || lower.includes("pt") || lower.includes("cv") || lower.includes("bujk baru") || lower.includes("legalitas")) return "legalitas";
    return "knowledge";
  };

  // Persist message to backend (only if logged in + sessionId exists)
  const persistMessage = async (currentSessionId: number, role: string, agentId: string | null, content: string) => {
    try {
      await fetch(`/api/agent-sessions/${currentSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, agentId, content }),
      });
    } catch { /* silent — persistence is best-effort */ }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isProcessing) return;
    setInput("");
    setIsProcessing(true);

    addMessage({ role: "user", content: messageText });

    const detectedAgentId = detectAgent(messageText);
    const flow = DEMO_FLOWS[detectedAgentId] || DEMO_FLOWS.knowledge;

    // Create or reuse session for logged-in users
    let currentSessionId = sessionId;
    if (user && !currentSessionId) {
      try {
        const res = await fetch("/api/agent-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: messageText.slice(0, 60), activeAgents: [detectedAgentId] }),
        });
        if (res.ok) {
          const session = await res.json();
          currentSessionId = session.id;
          setSessionId(session.id);
        }
      } catch { /* silent */ }
    }

    // Save user message to backend
    if (currentSessionId) {
      await persistMessage(currentSessionId, "user", null, messageText);
    }

    const orcThinkId = addMessage({ role: "orchestrator", content: "", isThinking: true });
    await new Promise((r) => setTimeout(r, 600));

    for (const step of flow) {
      await new Promise((r) => setTimeout(r, step.delay));
      if (step.role === "orchestrator") {
        updateMessage(orcThinkId, { content: step.content, isThinking: false });
        if (currentSessionId) {
          await persistMessage(currentSessionId, "orchestrator", null, step.content);
        }
      } else if (step.role === "agent" && step.agentId) {
        setActiveAgent(step.agentId);
        updateAgentStatus(step.agentId, "thinking");
        const agentThinkId = addMessage({ role: "agent", agentId: step.agentId, content: "", isThinking: true });
        await new Promise((r) => setTimeout(r, 800));
        updateAgentStatus(step.agentId, "working");
        await new Promise((r) => setTimeout(r, 600));
        updateMessage(agentThinkId, { content: step.content, isThinking: false });
        if (currentSessionId) {
          await persistMessage(currentSessionId, "agent", step.agentId, step.content);
        }
        updateAgentStatus(step.agentId, "done");
        setTimeout(() => {
          updateAgentStatus(step.agentId!, "idle");
          setActiveAgent(null);
        }, 3000);
      }
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/30">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">OpenClaw</span>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] h-4 px-1.5">BETA</Badge>
                </div>
                <p className="text-xs text-slate-500">by DokumenProyek.com</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">{agents.length} Agen Aktif</span>
            </div>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <Link href="/tender-generator">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-7 text-xs hidden sm:flex" data-testid="button-tender-generator">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Tender Generator
              </Button>
            </Link>
            {/* Mobile: hamburger to open sidebar drawer */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400 hover:text-white h-8 w-8"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer panel */}
          <motion.aside
            className="relative flex w-72 max-w-[85vw] flex-col bg-slate-900 shadow-2xl overflow-hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Panel Agen</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white h-8 w-8"
                onClick={() => setSidebarOpen(false)}
                data-testid="button-close-sidebar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Orchestrator */}
            <div className="p-4 border-b border-slate-800">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Orchestrator</p>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center border border-slate-600">
                    <Network className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">OpenClaw Core</p>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Online & Ready</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Menganalisis intent, memecah tugas, dan mendelegasikan ke agen spesialis yang tepat.
                </p>
              </div>
            </div>
            {/* Specialist Agents */}
            <div className="p-3 flex-1 overflow-y-auto">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{agents.length} Agen Spesialis</p>
              <div className="space-y-1.5">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} isActive={activeAgent === agent.id} />
                ))}
              </div>
            </div>
            {/* Gustafta AI Tools */}
            <div className="p-3 border-t border-slate-800">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Gustafta AI Tools</p>
              <div className="space-y-0.5">
                {[
                  { label: "MultiClaw", href: "/multiclaw", color: "text-rose-400" },
                  { label: "TenderaClaw", href: "/tendera-claw", color: "text-orange-400" },
                  { label: "SBUClaw", href: "/sbu-claw", color: "text-amber-400" },
                  { label: "LexCom Hukum", href: "/lexcom-hukum", color: "text-blue-400" },
                  { label: "Workroom", href: "/workroom", color: "text-purple-400" },
                  { label: "KompetensiHub", href: "/kompetensi-hub", color: "text-teal-400" },
                  { label: "ASKOM Coach", href: "/askom-coach", color: "text-green-400" },
                  { label: "Bimtek SKK", href: "/bimtek-skk", color: "text-indigo-400" },
                  { label: "Business Memory", href: "/business-memory", color: "text-pink-400" },
                  { label: "Exec. Summary", href: "/proyek", color: "text-sky-400" },
                ].map((tool) => (
                  <Link key={tool.href} href={tool.href}>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                      <ChevronRight className={`w-3 h-3 ${tool.color} flex-shrink-0`} />
                      <span className={`text-[11px] font-medium ${tool.color}`}>{tool.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div className="p-3 border-t border-slate-800">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-xs font-bold text-white">{messages.filter(m => m.role === "user").length}</p>
                  <p className="text-[9px] text-slate-500">Pesan</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-xs font-bold text-white">{agents.length}</p>
                  <p className="text-[9px] text-slate-500">Agen</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-emerald-400">ON</p>
                  <p className="text-[9px] text-slate-500">Status</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Left Sidebar — desktop only */}
        <aside className="hidden md:flex w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col overflow-hidden">
          {/* Orchestrator */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Orchestrator</p>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center border border-slate-600">
                  <Network className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">OpenClaw Core</p>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Online & Ready</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                Menganalisis intent, memecah tugas, dan mendelegasikan ke agen spesialis yang tepat.
              </p>
            </div>
          </div>

          {/* Specialist Agents */}
          <div className="p-3 flex-1 overflow-y-auto">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{agents.length} Agen Spesialis</p>
            <div className="space-y-1.5">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isActive={activeAgent === agent.id} />
              ))}
            </div>
          </div>

          {/* Gustafta AI Tools */}
          <div className="p-3 border-t border-slate-800">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Gustafta AI Tools</p>
            <div className="space-y-0.5">
              {[
                { label: "MultiClaw", href: "/multiclaw", color: "text-rose-400" },
                { label: "TenderaClaw", href: "/tendera-claw", color: "text-orange-400" },
                { label: "SBUClaw", href: "/sbu-claw", color: "text-amber-400" },
                { label: "LexCom Hukum", href: "/lexcom-hukum", color: "text-blue-400" },
                { label: "Workroom", href: "/workroom", color: "text-purple-400" },
                { label: "KompetensiHub", href: "/kompetensi-hub", color: "text-teal-400" },
                { label: "ASKOM Coach", href: "/askom-coach", color: "text-green-400" },
                { label: "Bimtek SKK", href: "/bimtek-skk", color: "text-indigo-400" },
                { label: "Business Memory", href: "/business-memory", color: "text-pink-400" },
                { label: "Exec. Summary", href: "/proyek", color: "text-sky-400" },
              ].map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                    <ChevronRight className={`w-3 h-3 ${tool.color} flex-shrink-0`} />
                    <span className={`text-[11px] font-medium ${tool.color}`}>{tool.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 border-t border-slate-800">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800 rounded-lg p-2">
                <p className="text-xs font-bold text-white">{messages.filter(m => m.role === "user").length}</p>
                <p className="text-[9px] text-slate-500">Pesan</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2">
                <p className="text-xs font-bold text-white">{agents.length}</p>
                <p className="text-[9px] text-slate-500">Agen</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-2">
                <p className="text-[10px] font-bold text-emerald-400">ON</p>
                <p className="text-[9px] text-slate-500">Status</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} agents={agents} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 sm:px-6 pb-4">
              <p className="text-xs text-slate-400 mb-3 font-medium">Pertanyaan yang sering ditanyakan:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt.text)}
                      className="flex items-center gap-2 text-left px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                      data-testid={`button-quick-prompt-${idx}`}
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary flex-shrink-0" />
                      <span className="leading-snug text-xs">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya tentang SBU, SKK, ISO, tender, proyek, legalitas, atau perizinan..."
                  className="pr-4 py-3 h-auto bg-white border-slate-300 focus:border-primary rounded-xl text-sm"
                  disabled={isProcessing}
                  data-testid="input-chat-message"
                />
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isProcessing}
                className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
                data-testid="button-send-message"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              OpenClaw • {agents.length} Agen Spesialis • Gustafta AI Framework • DokumenProyek.com
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
