import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  ArrowLeft, 
  Construction,
  Truck,
  Calendar,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Search
} from "lucide-react";
import type { Equipment, EquipmentRental as Rental, UserProfile } from "@shared/schema";

const equipmentCategories = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "truck", label: "Dump Truck" },
  { value: "mixer", label: "Concrete Mixer" },
  { value: "compactor", label: "Compactor/Roller" },
  { value: "scaffolding", label: "Scaffolding" },
  { value: "genset", label: "Generator Set" },
  { value: "pump", label: "Water Pump" },
  { value: "other", label: "Lainnya" },
];

const conditionOptions = [
  { value: "excellent", label: "Sangat Baik" },
  { value: "good", label: "Baik" },
  { value: "fair", label: "Cukup Baik" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function EquipmentRentalPage() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRentDialog, setShowRentDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    category: "excavator",
    brand: "",
    model: "",
    yearManufactured: new Date().getFullYear(),
    condition: "good",
    description: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    location: "",
    specifications: "",
  });

  const [rentalForm, setRentalForm] = useState({
    startDate: "",
    endDate: "",
    notes: "",
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: allEquipments = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipments"],
  });

  const { data: myEquipments = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipments/mine"],
  });

  const { data: myRentals = [] } = useQuery<Rental[]>({
    queryKey: ["/api/rentals/mine"],
  });

  const { data: ownerRentals = [] } = useQuery<Rental[]>({
    queryKey: ["/api/rentals/owner"],
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/equipments", data),
    onSuccess: () => {
      toast({ title: "Alat berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["/api/equipments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipments/mine"] });
      setShowAddDialog(false);
      resetNewEquipment();
    },
    onError: () => {
      toast({ title: "Gagal menambahkan alat", variant: "destructive" });
    },
  });

  const createRentalMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/rentals", data),
    onSuccess: () => {
      toast({ title: "Permintaan sewa berhasil dikirim" });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/mine"] });
      setShowRentDialog(false);
      setSelectedEquipment(null);
      setRentalForm({ startDate: "", endDate: "", notes: "" });
    },
    onError: () => {
      toast({ title: "Gagal mengirim permintaan sewa", variant: "destructive" });
    },
  });

  const updateRentalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/rentals/${id}/status`, { status }),
    onSuccess: () => {
      toast({ title: "Status berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/owner"] });
    },
    onError: () => {
      toast({ title: "Gagal memperbarui status", variant: "destructive" });
    },
  });

  const resetNewEquipment = () => {
    setNewEquipment({
      name: "",
      category: "excavator",
      brand: "",
      model: "",
      yearManufactured: new Date().getFullYear(),
      condition: "good",
      description: "",
      dailyRate: "",
      weeklyRate: "",
      monthlyRate: "",
      location: "",
      specifications: "",
    });
  };

  const handleCreateEquipment = () => {
    if (!newEquipment.name || !newEquipment.dailyRate || !newEquipment.location) {
      toast({ title: "Isi nama, harga harian, dan lokasi", variant: "destructive" });
      return;
    }
    const dailyRateNum = parseInt(newEquipment.dailyRate.replace(/[^0-9]/g, ""));
    if (isNaN(dailyRateNum) || dailyRateNum <= 0) {
      toast({ title: "Harga harian tidak valid", variant: "destructive" });
      return;
    }
    const weeklyRateNum = newEquipment.weeklyRate ? parseInt(newEquipment.weeklyRate.replace(/[^0-9]/g, "")) : null;
    const monthlyRateNum = newEquipment.monthlyRate ? parseInt(newEquipment.monthlyRate.replace(/[^0-9]/g, "")) : null;
    
    createEquipmentMutation.mutate({
      ...newEquipment,
      dailyRate: dailyRateNum,
      weeklyRate: weeklyRateNum,
      monthlyRate: monthlyRateNum,
    });
  };

  const handleCreateRental = () => {
    if (!selectedEquipment || !rentalForm.startDate || !rentalForm.endDate) {
      toast({ title: "Pilih tanggal mulai dan selesai", variant: "destructive" });
      return;
    }
    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    if (end <= start) {
      toast({ title: "Tanggal selesai harus setelah tanggal mulai", variant: "destructive" });
      return;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * selectedEquipment.dailyRate;

    createRentalMutation.mutate({
      equipmentId: selectedEquipment.id,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalDays,
      totalAmount,
      notes: rentalForm.notes,
    });
  };

  const filteredEquipments = useMemo(() => {
    return allEquipments.filter(eq => {
      const matchesSearch = !searchQuery || 
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (eq.brand?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        eq.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || eq.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allEquipments, searchQuery, categoryFilter]);

  const getCategoryLabel = (cat: string) => equipmentCategories.find(c => c.value === cat)?.label || cat;
  const getConditionLabel = (cond: string) => conditionOptions.find(c => c.value === cond)?.label || cond;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Construction className="w-5 h-5 text-primary" />
                Sewa Alat Berat
              </h1>
              <p className="text-sm text-muted-foreground">Marketplace Penyewaan Alat Konstruksi</p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-equipment">
                <Plus className="w-4 h-4 mr-2" /> Tambah Alat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Alat untuk Disewakan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Alat *</Label>
                    <Input
                      placeholder="Contoh: Excavator CAT 320D"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      data-testid="input-eq-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Select 
                      value={newEquipment.category} 
                      onValueChange={(v) => setNewEquipment({ ...newEquipment, category: v })}
                    >
                      <SelectTrigger data-testid="select-eq-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentCategories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Merk</Label>
                    <Input
                      placeholder="CAT, Komatsu, dll"
                      value={newEquipment.brand}
                      onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })}
                      data-testid="input-eq-brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      placeholder="320D, PC200, dll"
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                      data-testid="input-eq-model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Pembuatan</Label>
                    <Input
                      type="number"
                      value={newEquipment.yearManufactured}
                      onChange={(e) => setNewEquipment({ ...newEquipment, yearManufactured: parseInt(e.target.value) || 0 })}
                      data-testid="input-eq-year"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kondisi *</Label>
                    <Select 
                      value={newEquipment.condition} 
                      onValueChange={(v) => setNewEquipment({ ...newEquipment, condition: v })}
                    >
                      <SelectTrigger data-testid="select-eq-condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lokasi *</Label>
                    <Input
                      placeholder="Jakarta, Surabaya, dll"
                      value={newEquipment.location}
                      onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                      data-testid="input-eq-location"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Harga Harian (Rp) *</Label>
                    <Input
                      placeholder="5.000.000"
                      value={newEquipment.dailyRate}
                      onChange={(e) => setNewEquipment({ ...newEquipment, dailyRate: e.target.value })}
                      data-testid="input-eq-daily"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Mingguan (Rp)</Label>
                    <Input
                      placeholder="30.000.000"
                      value={newEquipment.weeklyRate}
                      onChange={(e) => setNewEquipment({ ...newEquipment, weeklyRate: e.target.value })}
                      data-testid="input-eq-weekly"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Bulanan (Rp)</Label>
                    <Input
                      placeholder="100.000.000"
                      value={newEquipment.monthlyRate}
                      onChange={(e) => setNewEquipment({ ...newEquipment, monthlyRate: e.target.value })}
                      data-testid="input-eq-monthly"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    placeholder="Deskripsi lengkap alat..."
                    value={newEquipment.description}
                    onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    rows={3}
                    data-testid="input-eq-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spesifikasi</Label>
                  <Textarea
                    placeholder="Kapasitas bucket, berat, dll..."
                    value={newEquipment.specifications}
                    onChange={(e) => setNewEquipment({ ...newEquipment, specifications: e.target.value })}
                    rows={2}
                    data-testid="input-eq-specs"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateEquipment} disabled={createEquipmentMutation.isPending} data-testid="button-submit-eq">
                  {createEquipmentMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse" data-testid="tab-browse">Cari Alat ({filteredEquipments.length})</TabsTrigger>
            <TabsTrigger value="my-equipment" data-testid="tab-my-equipment">Alat Saya ({myEquipments.length})</TabsTrigger>
            <TabsTrigger value="my-rentals" data-testid="tab-my-rentals">Sewa Saya ({myRentals.length})</TabsTrigger>
            <TabsTrigger value="rental-requests" data-testid="tab-rental-requests">Permintaan Masuk ({ownerRentals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari alat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-eq"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-filter-category">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {equipmentCategories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="py-20" />
                  </Card>
                ))}
              </div>
            ) : filteredEquipments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Construction className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Tidak ada alat ditemukan</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipments.map(eq => (
                  <Card key={eq.id} className="hover-elevate" data-testid={`eq-card-${eq.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{eq.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{eq.brand} {eq.model}</p>
                        </div>
                        <Badge variant="secondary">{getCategoryLabel(eq.category)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{eq.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Settings className="w-4 h-4" />
                        <span>{getConditionLabel(eq.condition)} | {eq.yearManufactured}</span>
                      </div>
                      {eq.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{eq.description}</p>
                      )}
                      <div className="pt-2 border-t">
                        <p className="text-lg font-bold text-primary">{formatCurrency(eq.dailyRate)}<span className="text-sm font-normal text-muted-foreground">/hari</span></p>
                        {eq.weeklyRate && <p className="text-sm text-muted-foreground">{formatCurrency(eq.weeklyRate)}/minggu</p>}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setShowRentDialog(true);
                        }}
                        data-testid={`button-rent-${eq.id}`}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Sewa Sekarang
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-equipment" className="space-y-4">
            {myEquipments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Anda belum menambahkan alat</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Alat
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myEquipments.map(eq => (
                  <Card key={eq.id} data-testid={`my-eq-card-${eq.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{eq.name}</CardTitle>
                        <Badge variant={eq.availability === "available" ? "default" : "secondary"}>
                          {eq.availability === "available" ? "Tersedia" : eq.availability === "rented" ? "Disewa" : "Maintenance"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{getCategoryLabel(eq.category)} | {eq.location}</p>
                      <p className="text-lg font-bold text-primary mt-2">{formatCurrency(eq.dailyRate)}/hari</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-rentals" className="space-y-4">
            {myRentals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Anda belum menyewa alat</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myRentals.map(rental => (
                  <RentalCard key={rental.id} rental={rental} type="renter" onUpdate={updateRentalMutation.mutate} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rental-requests" className="space-y-4">
            {ownerRentals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Tidak ada permintaan sewa</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {ownerRentals.map(rental => (
                  <RentalCard key={rental.id} rental={rental} type="owner" onUpdate={updateRentalMutation.mutate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showRentDialog} onOpenChange={setShowRentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sewa {selectedEquipment?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-medium">{selectedEquipment.name}</p>
                <p className="text-sm text-muted-foreground">{selectedEquipment.brand} {selectedEquipment.model} | {selectedEquipment.location}</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(selectedEquipment.dailyRate)}/hari</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai *</Label>
                <Input
                  type="date"
                  value={rentalForm.startDate}
                  onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-rental-start"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai *</Label>
                <Input
                  type="date"
                  value={rentalForm.endDate}
                  onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                  min={rentalForm.startDate || new Date().toISOString().split('T')[0]}
                  data-testid="input-rental-end"
                />
              </div>
            </div>
            {rentalForm.startDate && rentalForm.endDate && selectedEquipment && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Estimasi Total:</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(
                    Math.ceil((new Date(rentalForm.endDate).getTime() - new Date(rentalForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) * selectedEquipment.dailyRate
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.ceil((new Date(rentalForm.endDate).getTime() - new Date(rentalForm.startDate).getTime()) / (1000 * 60 * 60 * 24))} hari
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan untuk pemilik alat..."
                value={rentalForm.notes}
                onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                rows={2}
                data-testid="input-rental-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRentDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateRental} disabled={createRentalMutation.isPending} data-testid="button-submit-rental">
              {createRentalMutation.isPending ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RentalCard({ rental, type, onUpdate }: { rental: Rental; type: "renter" | "owner"; onUpdate: (params: { id: number; status: string }) => void }) {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Menunggu Konfirmasi",
    confirmed: "Dikonfirmasi",
    active: "Sedang Berjalan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <Card data-testid={`rental-${rental.id}`}>
      <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={statusColors[rental.status || "pending"]}>{statusLabels[rental.status || "pending"]}</Badge>
          </div>
          <p className="font-medium">Alat #{rental.equipmentId}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(rental.startDate).toLocaleDateString('id-ID')} - {new Date(rental.endDate).toLocaleDateString('id-ID')}
            <span className="mx-2">|</span>
            {rental.totalDays} hari
          </p>
          <p className="text-lg font-bold text-primary mt-1">{formatCurrency(rental.totalAmount)}</p>
        </div>
        <div className="flex gap-2">
          {type === "owner" && rental.status === "pending" && (
            <>
              <Button size="sm" onClick={() => onUpdate({ id: rental.id, status: "confirmed" })} data-testid={`button-confirm-${rental.id}`}>
                <CheckCircle className="w-4 h-4 mr-1" /> Konfirmasi
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ id: rental.id, status: "cancelled" })} data-testid={`button-cancel-${rental.id}`}>
                <XCircle className="w-4 h-4 mr-1" /> Tolak
              </Button>
            </>
          )}
          {type === "owner" && rental.status === "confirmed" && (
            <Button size="sm" onClick={() => onUpdate({ id: rental.id, status: "active" })} data-testid={`button-activate-${rental.id}`}>
              <Clock className="w-4 h-4 mr-1" /> Mulai Sewa
            </Button>
          )}
          {type === "owner" && rental.status === "active" && (
            <Button size="sm" onClick={() => onUpdate({ id: rental.id, status: "completed" })} data-testid={`button-complete-${rental.id}`}>
              <CheckCircle className="w-4 h-4 mr-1" /> Selesai
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
