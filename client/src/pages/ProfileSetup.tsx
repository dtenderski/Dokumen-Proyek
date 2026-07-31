import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  Truck, 
  Package, 
  HardHat, 
  Home,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

const stakeholderOptions = [
  { 
    value: "kontraktor", 
    label: "Kontraktor", 
    icon: Building2, 
    description: "Badan usaha jasa konstruksi",
    features: ["Akses tender & proyek", "Marketplace material", "Kendali proyek", "Sertifikasi & legalitas"]
  },
  { 
    value: "konsultan", 
    label: "Konsultan", 
    icon: Users, 
    description: "Konsultan perencanaan & pengawasan",
    features: ["Review dokumen", "Konsultasi teknis", "Pengawasan proyek", "Sertifikasi profesional"]
  },
  { 
    value: "vendor", 
    label: "Vendor", 
    icon: Truck, 
    description: "Penyedia alat & jasa",
    features: ["Jual/sewa peralatan", "Jasa spesialis", "Dashboard pendapatan", "Manajemen order"]
  },
  { 
    value: "supplier", 
    label: "Supplier", 
    icon: Package, 
    description: "Pemasok material konstruksi",
    features: ["Marketplace pasok", "Kelola inventory", "Tracking pengiriman", "Escrow payment"]
  },
  { 
    value: "tenaga_kerja", 
    label: "Tenaga Kerja", 
    icon: HardHat, 
    description: "Tukang, mandor, operator",
    features: ["Cari lowongan kerja", "Profil keahlian", "Sertifikasi K3", "Riwayat proyek"]
  },
  { 
    value: "masyarakat", 
    label: "Pengguna Jasa", 
    icon: Home, 
    description: "Masyarakat yang membutuhkan jasa konstruksi",
    features: ["Cari kontraktor", "Request penawaran", "Pantau progres", "Rating & review"]
  },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    address: "",
    bio: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profil Berhasil Disimpan",
        description: "Selamat datang di DokumenProyek!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menyimpan profil. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      stakeholderType: selectedType,
      companyName: formData.companyName || null,
      phone: formData.phone || null,
      address: formData.address || null,
      bio: formData.bio || null,
    });
  };

  const selectedOption = stakeholderOptions.find(o => o.value === selectedType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Selamat Datang, {user?.firstName || "Pengguna"}!
          </h1>
          <p className="text-muted-foreground">
            Lengkapi profil Anda untuk mendapatkan pengalaman terbaik
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-slate-200 text-slate-500"
              }`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > s ? "bg-primary" : "bg-slate-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Pilih Jenis Akun Anda</h2>
              <p className="text-sm text-muted-foreground">
                Pilih kategori yang paling sesuai dengan aktivitas Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakeholderOptions.map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    selectedType === option.value 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "hover-elevate"
                  }`}
                  onClick={() => setSelectedType(option.value)}
                  data-testid={`card-stakeholder-${option.value}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedType === option.value 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        <option.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{option.label}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{option.description}</p>
                        <ul className="space-y-1">
                          {option.features.slice(0, 2).map((f, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <ChevronRight className="w-3 h-3 text-primary" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                size="lg"
                disabled={!selectedType}
                onClick={() => setStep(2)}
                className="px-8"
                data-testid="button-next-step"
              >
                Lanjutkan <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && selectedOption && (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <selectedOption.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedOption.label}</CardTitle>
                  <CardDescription>{selectedOption.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(selectedType === "kontraktor" || selectedType === "konsultan" || selectedType === "vendor" || selectedType === "supplier") && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nama Perusahaan</Label>
                  <Input
                    id="companyName"
                    placeholder="PT. Contoh Konstruksi"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    data-testid="input-company-name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  placeholder="Jakarta, Indonesia"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Deskripsi Singkat</Label>
                <Textarea
                  id="bio"
                  placeholder={
                    selectedType === "tenaga_kerja" 
                      ? "Ceritakan keahlian dan pengalaman kerja Anda..."
                      : "Ceritakan tentang bisnis atau layanan Anda..."
                  }
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  data-testid="input-bio"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={mutation.isPending}
                  data-testid="button-save-profile"
                >
                  {mutation.isPending ? "Menyimpan..." : "Simpan & Mulai"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
