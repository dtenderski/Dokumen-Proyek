import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateContact } from "@/hooks/use-contact";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send, CheckSquare, Square, Phone, Building2, MapPin, Sparkles, HardHat, BrainCircuit } from "lucide-react";

/* ─────────────────────────────── service data ──────────────────────────────── */
const SERVICES = [
  {
    id: "sertifikasi",
    icon: HardHat,
    color: "amber",
    label: "Pengurusan Sertifikasi & Perizinan",
    desc: "Dokumen badan usaha & tenaga ahli konstruksi",
    chips: ["SBU Konstruksi", "SKK / SKA", "NIB / OSS", "ISO 9001 / 14001 / 45001", "SMK3", "KTA Asosiasi", "KBLI 2025", "SIUJK / IUJK"],
  },
  {
    id: "mitra",
    icon: Building2,
    color: "blue",
    label: "Layanan Mitra Kerja",
    desc: "Kemitraan proyek dan sumber daya konstruksi",
    chips: ["Subkontraktor", "KSO (Kerja Sama Operasi)", "Supplier Material", "Sewa / Jual Peralatan", "Freelance Tenaga Ahli", "Rekrutmen Tenaga Konstruksi"],
  },
  {
    id: "ai",
    icon: BrainCircuit,
    color: "violet",
    label: "Pembuatan AI & Workroom Digital",
    desc: "Solusi AI khusus untuk bisnis konstruksi Anda",
    chips: ["AI Aissten Custom", "Workroom Digital", "SBUClaw / TenderaClaw", "Analisis Dokumen AI", "Dashboard Monitoring", "Integrasi Sistem"],
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; chip: string; chipActive: string; iconBg: string }> = {
  amber: {
    border:     "border-amber-400",
    bg:         "bg-amber-50",
    text:       "text-amber-700",
    chip:       "border-amber-200 bg-amber-50 text-amber-700",
    chipActive: "bg-amber-400 border-amber-400 text-white",
    iconBg:     "bg-amber-100 text-amber-600",
  },
  blue: {
    border:     "border-blue-400",
    bg:         "bg-blue-50",
    text:       "text-blue-700",
    chip:       "border-blue-200 bg-blue-50 text-blue-700",
    chipActive: "bg-blue-500 border-blue-500 text-white",
    iconBg:     "bg-blue-100 text-blue-600",
  },
  violet: {
    border:     "border-violet-400",
    bg:         "bg-violet-50",
    text:       "text-violet-700",
    chip:       "border-violet-200 bg-violet-50 text-violet-700",
    chipActive: "bg-violet-500 border-violet-500 text-white",
    iconBg:     "bg-violet-100 text-violet-600",
  },
};

/* ──────────────────────────────── component ──────────────────────────────── */
export function ContactForm() {
  const mutation = useCreateContact();

  // which service categories are selected
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  // which specific chips are selected per service
  const [selectedChips, setSelectedChips] = useState<Record<string, string[]>>({});

  // extra fields (not in schema — will be prepended to message)
  const [phone, setPhone]     = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity]       = useState("");

  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const toggleService = (id: string) =>
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleChip = (serviceId: string, chip: string) => {
    setSelectedChips(prev => {
      const current = prev[serviceId] ?? [];
      return {
        ...prev,
        [serviceId]: current.includes(chip)
          ? current.filter(c => c !== chip)
          : [...current, chip],
      };
    });
    // auto-select parent service when chip clicked
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  const onSubmit = (data: InsertContactMessage) => {
    const lines: string[] = [];

    if (company) lines.push(`Perusahaan    : ${company}`);
    if (phone)   lines.push(`No. WhatsApp  : ${phone}`);
    if (city)    lines.push(`Kota / Provinsi: ${city}`);

    if (selectedServices.length > 0) {
      lines.push("", "[Layanan yang Dibutuhkan]");
      selectedServices.forEach(sid => {
        const svc = SERVICES.find(s => s.id === sid)!;
        const chips = selectedChips[sid] ?? [];
        lines.push(
          chips.length > 0
            ? `• ${svc.label}: ${chips.join(", ")}`
            : `• ${svc.label}`
        );
      });
    }

    if (data.message.trim()) {
      lines.push("", "[Catatan / Pertanyaan]", data.message.trim());
    }

    mutation.mutate(
      { ...data, message: lines.join("\n") || data.message },
      { onSuccess: () => { form.reset(); setSelectedServices([]); setSelectedChips({}); setPhone(""); setCompany(""); setCity(""); } }
    );
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
      <h3 className="text-2xl font-bold mb-1">Hubungi Kami</h3>
      <p className="text-muted-foreground mb-7">
        Sampaikan kebutuhan Anda — tim kami akan merespons dalam{" "}
        <span className="font-semibold text-slate-700">1×24 jam</span> kerja.
      </p>

      {/* ── Step 1: pilih layanan ── */}
      <div className="mb-7">
        <p className="text-sm font-bold text-slate-800 mb-0.5">
          1. Pilih Layanan yang Dibutuhkan
        </p>
        <p className="text-xs text-slate-400 mb-3">Klik kartu untuk memilih, lalu pilih detail di bawahnya</p>
        <div className="flex flex-col gap-3">
          {SERVICES.map(svc => {
            const active = selectedServices.includes(svc.id);
            const c = colorMap[svc.color];
            const Icon = svc.icon;
            return (
              <div key={svc.id} className={`rounded-xl border-2 transition-all duration-200 overflow-hidden
                ${active ? `${c.border} ${c.bg}` : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggleService(svc.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <span className={`flex-shrink-0 p-2 rounded-lg ${active ? c.iconBg : "bg-slate-200 text-slate-500"}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm font-bold leading-tight ${active ? c.text : "text-slate-700"}`}>
                      {svc.label}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">{svc.desc}</span>
                  </span>
                  <span className={`flex-shrink-0 ${active ? c.text : "text-slate-300"}`}>
                    {active
                      ? <CheckSquare className="w-5 h-5" />
                      : <Square className="w-5 h-5" />
                    }
                  </span>
                </button>

                {/* Chip detail (visible when active or always) */}
                <div className={`px-4 pb-3 flex flex-wrap gap-1.5 transition-all ${active ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  {svc.chips.map(chip => {
                    const chipActive = (selectedChips[svc.id] ?? []).includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(svc.id, chip)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                          ${chipActive ? c.chipActive : `${c.chip} hover:opacity-80`}`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: data diri ── */}
      <div className="mb-5">
        <p className="text-sm font-bold text-slate-800 mb-3">2. Data Pengirim</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Nama */}
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>Nama Lengkap <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Budi Santoso" {...field} className="bg-slate-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          {/* Email */}
          <Form {...form}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>Email <span className="text-red-400">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@perusahaan.com" {...field} className="bg-slate-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          {/* WhatsApp */}
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              No. WhatsApp
            </label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {/* Perusahaan */}
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              Nama Perusahaan
            </label>
            <Input
              placeholder="PT / CV / Perorangan"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {/* Kota */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Kota / Provinsi
            </label>
            <Input
              placeholder="Jakarta Selatan, DKI Jakarta"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* ── Step 3: pesan ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-slate-800">
                  3. Catatan / Pertanyaan
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contoh: Kami PT. ABC ingin mengurus SBU kualifikasi Menengah untuk subklasifikasi BG009. Mohon info estimasi waktu dan biaya."
                    className="min-h-[110px] bg-slate-50 resize-none text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 h-11 font-semibold"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Permintaan
              </>
            )}
          </Button>

          {mutation.isSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">
                Permintaan terkirim! Tim kami akan menghubungi Anda segera.
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
