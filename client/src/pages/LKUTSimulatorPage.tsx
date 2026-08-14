import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, AlertCircle, ChevronRight,
  RotateCcw, ClipboardCheck, BookOpen, ArrowRight,
} from "lucide-react";

interface Question {
  id: string;
  section: string;
  question: string;
  weight: number; // points if answered "ya"
}

const QUESTIONS: Question[] = [
  // Kelengkapan Data Perusahaan
  { id: "q1",  section: "Data Perusahaan",  question: "BUJK memiliki SBU aktif dan belum kadaluarsa?",                          weight: 15 },
  { id: "q2",  section: "Data Perusahaan",  question: "Data penanggung jawab badan usaha sudah diperbarui di SIJK?",             weight: 10 },
  { id: "q3",  section: "Data Perusahaan",  question: "NIB (Nomor Induk Berusaha) masih aktif?",                                 weight: 10 },
  // Tenaga Kerja SKK
  { id: "q4",  section: "Tenaga Kerja SKK", question: "Semua tenaga ahli memiliki SKK yang masih berlaku?",                      weight: 15 },
  { id: "q5",  section: "Tenaga Kerja SKK", question: "Data SKK personel sudah terintegrasi di SIJK LPJK?",                      weight: 10 },
  { id: "q6",  section: "Tenaga Kerja SKK", question: "Jumlah tenaga ahli memenuhi kualifikasi sesuai SBU?",                     weight: 10 },
  // Realisasi Proyek
  { id: "q7",  section: "Realisasi Proyek", question: "Data proyek yang dikerjakan tahun lalu sudah lengkap (nama, nilai, owner)?", weight: 15 },
  { id: "q8",  section: "Realisasi Proyek", question: "Nilai kontrak proyek sudah dilaporkan sesuai dokumen kontrak?",             weight: 10 },
  { id: "q9",  section: "Realisasi Proyek", question: "Progress realisasi setiap proyek sudah diisi?",                            weight: 10 },
  // Pengiriman
  { id: "q10", section: "Pengiriman LKUT",  question: "LKUT akan dikirim sebelum deadline 30 April?",                            weight: 5 },
];

type Answer = "ya" | "tidak" | "belum";

function getStatus(score: number) {
  if (score >= 80) return { label: "Siap LKUT ✅", color: "text-emerald-400", bg: "bg-emerald-900/30 border-emerald-700/50", icon: CheckCircle2, desc: "BUJK Anda siap mengisi dan mengirimkan LKUT. Segera submit ke SIJK sebelum 30 April." };
  if (score >= 50) return { label: "Perlu Persiapan ⚠️", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-700/50", icon: AlertCircle, desc: "Ada beberapa item yang perlu dilengkapi sebelum LKUT dapat dikirimkan." };
  return { label: "Belum Siap ❌", color: "text-red-400", bg: "bg-red-900/30 border-red-700/50", icon: XCircle, desc: "BUJK perlu melengkapi banyak data penting. Hubungi tim kami untuk bantuan." };
}

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];

export default function LKUTSimulatorPage() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const total = QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  const score = submitted
    ? QUESTIONS.reduce((sum, q) => sum + (answers[q.id] === "ya" ? q.weight : 0), 0)
    : 0;

  const status = getStatus(score);
  const StatusIcon = status.icon;

  function setAnswer(id: string, val: Answer) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  const allAnswered = answered === total;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 to-slate-950 py-14 md:py-20">
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container relative z-10 max-w-3xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
              <ClipboardCheck className="w-3 h-3 mr-1" /> Simulator Kepatuhan
            </Badge>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-600/20 border border-white/10 flex items-center justify-center">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              LKUT <span className="text-amber-400">Simulator</span>
            </h1>
            <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
              Uji kesiapan BUJK Anda dalam memenuhi kewajiban Laporan Kegiatan Usaha Tahunan (LKUT).
              Jawab {total} pertanyaan singkat dan ketahui skor kesiapan Anda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Simulator */}
      <section className="py-12">
        <div className="container max-w-2xl mx-auto px-4">

          {/* Progress bar */}
          {!submitted && (
            <div className="mb-8">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>{answered} dari {total} pertanyaan dijawab</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-teal-500 rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {submitted && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-8 text-center mb-8 ${status.bg}`}>
                <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${status.color}`} />
                <div className={`text-3xl font-extrabold mb-1 ${status.color}`}>{score}/100</div>
                <div className="text-xl font-bold text-white mb-2">{status.label}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{status.desc}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={reset} variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                    <RotateCcw className="w-4 h-4" /> Ulangi Simulasi
                  </Button>
                  <a href="https://wa.me/6282299417818?text=Halo%2C+saya+sudah+coba+LKUT+Simulator+dan+butuh+bantuan+persiapan+LKUT." target="_blank" rel="noopener noreferrer">
                    <Button className="bg-teal-600 hover:bg-teal-500 gap-2 w-full sm:w-auto">
                      Konsultasi Gratis <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Questions */}
          {!submitted && SECTIONS.map((section) => (
            <div key={section} className="mb-8">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3 px-1">{section}</h3>
              <div className="space-y-3">
                {QUESTIONS.filter(q => q.section === section).map((q, qi) => {
                  const ans = answers[q.id];
                  return (
                    <motion.div key={q.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: qi * 0.05 }}
                      className={`bg-slate-900 rounded-xl border p-4 transition-colors ${ans ? "border-slate-600" : "border-slate-800"}`}>
                      <p className="text-sm text-slate-200 mb-3 leading-relaxed">{q.question}</p>
                      <div className="flex gap-2">
                        {(["ya", "tidak", "belum"] as const).map(opt => (
                          <button key={opt}
                            onClick={() => setAnswer(q.id, opt)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              ans === opt
                                ? opt === "ya" ? "bg-emerald-600 border-emerald-500 text-white"
                                  : opt === "tidak" ? "bg-red-600 border-red-500 text-white"
                                  : "bg-amber-600 border-amber-500 text-white"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                            }`}>
                            {opt === "ya" ? "✓ Ya" : opt === "tidak" ? "✗ Tidak" : "~ Belum"}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit */}
          {!submitted && (
            <div className="text-center mt-4">
              <Button onClick={() => setSubmitted(true)} disabled={!allAnswered}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 h-12 px-10 gap-2 text-base font-bold">
                <ChevronRight className="w-5 h-5" />
                Lihat Hasil Simulasi
              </Button>
              {!allAnswered && (
                <p className="text-slate-500 text-xs mt-2">Jawab semua {total} pertanyaan untuk melihat hasil</p>
              )}
            </div>
          )}

          {/* Info box */}
          <div className="mt-10 rounded-xl bg-slate-900 border border-slate-800 p-5 flex gap-3">
            <BookOpen className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white mb-1">Tentang LKUT</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Setiap BUJK wajib menyampaikan LKUT ke SIJK LPJK setiap tahun dengan deadline 30 April.
                Gagal lapor dapat mengakibatkan SBU tidak dapat diperpanjang. Simulator ini membantu
                mengidentifikasi kekurangan sebelum pengisian resmi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
