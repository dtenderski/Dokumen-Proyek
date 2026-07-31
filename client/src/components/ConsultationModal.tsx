import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle, CheckCircle2, Loader2, Phone, Mail, Building2 } from "lucide-react";

type ServiceType = "legalitas" | "perizinan" | "sbu" | "skk" | "iso-smk3" | "tender" | "proyek" | "umum";

interface ConsultationModalProps {
  serviceType: ServiceType;
  serviceLabel: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
  triggerClassName?: string;
  "data-testid"?: string;
}

const SERVICE_COLORS: Record<ServiceType, string> = {
  legalitas: "bg-blue-600",
  perizinan: "bg-indigo-600",
  sbu: "bg-emerald-600",
  skk: "bg-amber-600",
  "iso-smk3": "bg-teal-600",
  tender: "bg-violet-600",
  proyek: "bg-orange-600",
  umum: "bg-slate-600",
};

export function ConsultationModal({
  serviceType,
  serviceLabel,
  triggerLabel = "Konsultasi Gratis",
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName = "",
  "data-testid": testId,
}: ConsultationModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", companyName: "", message: "",
  });

  const mutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/consultations", { serviceType, ...form }),
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Permintaan konsultasi terkirim!", description: "Tim kami akan menghubungi Anda dalam 1x24 jam" });
    },
    onError: () => {
      toast({ title: "Gagal mengirim", description: "Coba lagi atau hubungi kami via WhatsApp", variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Isi nama, email, dan pesan terlebih dahulu", variant: "destructive" });
      return;
    }
    mutation.mutate();
  }

  function handleReset() {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", companyName: "", message: "" });
  }

  const colorClass = SERVICE_COLORS[serviceType] || "bg-slate-600";

  return (
    <Dialog open={open} onOpenChange={val => { setOpen(val); if (!val) handleReset(); }}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName} data-testid={testId || `button-konsultasi-${serviceType}`}>
          <MessageCircle className="w-4 h-4 mr-1.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base">Konsultasi {serviceLabel}</DialogTitle>
              <Badge className="text-[9px] mt-0.5 bg-green-100 text-green-700">Gratis & Tanpa Komitmen</Badge>
            </div>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <div className="font-bold text-lg mb-1">Permintaan Terkirim!</div>
            <p className="text-sm text-muted-foreground mb-4">
              Tim konsultan kami akan menghubungi Anda via email atau WhatsApp dalam <strong>1x24 jam kerja</strong>.
            </p>
            <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 mb-4">
              Layanan: <strong>{serviceLabel}</strong>
            </div>
            <Button variant="outline" size="sm" onClick={() => { handleReset(); setOpen(false); }}>
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nama Lengkap *</Label>
                <Input
                  placeholder="Ir. Budi Santoso"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="h-9 text-sm"
                  data-testid="consult-input-name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="email" placeholder="email@perusahaan.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="h-9 text-sm pl-8"
                    data-testid="consult-input-email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">No. WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="tel" placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="h-9 text-sm pl-8"
                    data-testid="consult-input-phone"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nama Perusahaan</Label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="PT. / CV. ..."
                    value={form.companyName}
                    onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                    className="h-9 text-sm pl-8"
                    data-testid="consult-input-company"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Apa yang ingin Anda tanyakan? *</Label>
              <Textarea
                placeholder={`Ceritakan kebutuhan ${serviceLabel} Anda — kondisi usaha saat ini, dokumen yang dimiliki, target yang ingin dicapai...`}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
                data-testid="consult-input-message"
                required
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] text-muted-foreground">
              Dengan mengirim formulir ini, Anda menyetujui tim kami menghubungi Anda untuk keperluan konsultasi layanan.
            </div>

            <Button type="submit" className={`w-full ${colorClass} hover:opacity-90 text-white`} disabled={mutation.isPending} data-testid="consult-button-submit">
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Mengirim...</>
              ) : (
                <><MessageCircle className="w-4 h-4 mr-1.5" /> Kirim Permintaan Konsultasi</>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
