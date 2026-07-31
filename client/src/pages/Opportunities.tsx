import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter,
  Plus,
  Building2,
  ArrowLeft,
  Clock,
  ChevronRight,
  Users,
  Bell,
  Settings,
  LogOut,
  Star
} from "lucide-react";
import { Link } from "wouter";
import type { Opportunity, UserProfile } from "@shared/schema";

const categoryOptions = [
  { value: "tender", label: "Tender Proyek" },
  { value: "konsultasi", label: "Jasa Konsultasi" },
  { value: "pekerjaan", label: "Lowongan Kerja" },
  { value: "material", label: "Kebutuhan Material" },
  { value: "alat", label: "Sewa Alat" },
  { value: "lainnya", label: "Lainnya" },
];

const stakeholderLabels: Record<string, string> = {
  kontraktor: "Kontraktor",
  konsultan: "Konsultan",
  vendor: "Vendor",
  supplier: "Supplier",
  tenaga_kerja: "Tenaga Kerja",
  masyarakat: "Pengguna Jasa",
};

const categoryForStakeholder: Record<string, string[]> = {
  kontraktor: ["tender", "konsultasi", "material", "alat"],
  konsultan: ["tender", "konsultasi"],
  vendor: ["material", "alat"],
  supplier: ["material"],
  tenaga_kerja: ["pekerjaan"],
  masyarakat: ["tender", "konsultasi"],
};

export default function Opportunities() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  const [newOpp, setNewOpp] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budget: "",
    deadline: "",
    requirements: "",
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/opportunities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Peluang berhasil ditambahkan" });
      setIsCreateOpen(false);
      setNewOpp({ title: "", description: "", category: "", location: "", budget: "", deadline: "", requirements: "" });
    },
    onError: () => {
      toast({ title: "Gagal menambahkan peluang", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!newOpp.title || !newOpp.category || !newOpp.description) {
      toast({ title: "Isi judul, kategori, dan deskripsi", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      title: newOpp.title,
      description: newOpp.description,
      category: newOpp.category,
      location: newOpp.location || null,
      budget: newOpp.budget || null,
      deadline: newOpp.deadline ? new Date(newOpp.deadline).toISOString() : null,
      requirements: newOpp.requirements ? newOpp.requirements.split(",").map(r => r.trim()) : [],
      targetStakeholders: [],
      status: "open",
    });
  };

  const stakeholderType = profile?.stakeholderType || "";
  const relevantCategories = categoryForStakeholder[stakeholderType] || [];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || opp.category === categoryFilter;
    
    const matchesStakeholder = !showOnlyRelevant || relevantCategories.includes(opp.category);
    
    return matchesSearch && matchesCategory && matchesStakeholder;
  });

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Pengguna";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Peluang Usaha</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Peluang Usaha & Proyek
            </h1>
            <p className="text-muted-foreground">
              Temukan peluang yang sesuai dengan profil bisnis Anda
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-opportunity">
                <Plus className="w-4 h-4 mr-2" /> Posting Peluang
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Posting Peluang Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Judul *</Label>
                  <Input
                    placeholder="Judul peluang..."
                    value={newOpp.title}
                    onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                    required
                    data-testid="input-opp-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={newOpp.category} onValueChange={(v) => setNewOpp({ ...newOpp, category: v })}>
                    <SelectTrigger data-testid="select-opp-category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi *</Label>
                  <Textarea
                    placeholder="Deskripsi peluang..."
                    value={newOpp.description}
                    onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                    rows={3}
                    required
                    data-testid="input-opp-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lokasi</Label>
                    <Input
                      placeholder="Jakarta, Indonesia"
                      value={newOpp.location}
                      onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                      data-testid="input-opp-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget (Rp)</Label>
                    <Input
                      placeholder="100.000.000"
                      value={newOpp.budget}
                      onChange={(e) => setNewOpp({ ...newOpp, budget: e.target.value })}
                      data-testid="input-opp-budget"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={newOpp.deadline}
                    onChange={(e) => setNewOpp({ ...newOpp, deadline: e.target.value })}
                    data-testid="input-opp-deadline"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Persyaratan (pisahkan dengan koma)</Label>
                  <Input
                    placeholder="SBU, SKK, Pengalaman 5 tahun"
                    value={newOpp.requirements}
                    onChange={(e) => setNewOpp({ ...newOpp, requirements: e.target.value })}
                    data-testid="input-opp-requirements"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  data-testid="button-submit-opportunity"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Posting Peluang"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peluang..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-opportunities"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-filter-category">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stakeholderType && (
                <Button
                  variant={showOnlyRelevant ? "default" : "outline"}
                  onClick={() => setShowOnlyRelevant(!showOnlyRelevant)}
                  data-testid="button-toggle-relevant"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {showOnlyRelevant ? "Semua" : "Cocok untuk Saya"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showOnlyRelevant && stakeholderType && (
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-primary flex items-center gap-2">
              <Star className="w-4 h-4" />
              Menampilkan peluang yang cocok untuk {stakeholderLabels[stakeholderType]}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Belum ada peluang</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== "all" 
                  ? "Tidak ada peluang yang sesuai dengan filter Anda"
                  : "Jadilah yang pertama posting peluang"}
              </p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-first-opportunity">
                <Plus className="w-4 h-4 mr-2" /> Posting Peluang Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map(opp => {
              const isRelevant = relevantCategories.includes(opp.category);
              const categoryLabel = categoryOptions.find(c => c.value === opp.category)?.label || opp.category;
              
              return (
                <Card 
                  key={opp.id} 
                  className={`hover-elevate cursor-pointer ${isRelevant ? "ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedOpp(opp)}
                  data-testid={`card-opportunity-${opp.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <Badge variant={isRelevant ? "default" : "secondary"}>
                        {categoryLabel}
                      </Badge>
                      {isRelevant && (
                        <Badge variant="outline" className="text-primary border-primary">
                          <Star className="w-3 h-3 mr-1" /> Cocok
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{opp.title}</h3>
                    
                    {opp.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {opp.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {opp.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{opp.location}</span>
                        </div>
                      )}
                      {opp.budget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Rp {opp.budget}</span>
                        </div>
                      )}
                      {opp.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(opp.deadline).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(opp.createdAt!).toLocaleDateString('id-ID')}
                      </span>
                      <Button variant="ghost" size="sm">
                        Detail <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedOpp} onOpenChange={() => setSelectedOpp(null)}>
          <DialogContent className="max-w-2xl">
            {selectedOpp && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedOpp.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{categoryOptions.find(c => c.value === selectedOpp.category)?.label}</Badge>
                    {relevantCategories.includes(selectedOpp.category) && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Star className="w-3 h-3 mr-1" /> Cocok untuk profil Anda
                      </Badge>
                    )}
                  </div>
                  
                  {selectedOpp.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Deskripsi</h4>
                      <p className="text-muted-foreground">{selectedOpp.description}</p>
                    </div>
                  )}
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedOpp.location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Lokasi</p>
                          <p className="font-medium">{selectedOpp.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedOpp.budget && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-medium">Rp {selectedOpp.budget}</p>
                        </div>
                      </div>
                    )}
                    {selectedOpp.deadline && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Deadline</p>
                          <p className="font-medium">{new Date(selectedOpp.deadline).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Diposting</p>
                        <p className="font-medium">{new Date(selectedOpp.createdAt!).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOpp.requirements && selectedOpp.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Persyaratan</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedOpp.requirements.map((req, i) => (
                          <Badge key={i} variant="secondary">{req}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="flex-1" data-testid="button-apply-opportunity">
                      Ajukan Penawaran
                    </Button>
                    <Button variant="outline" data-testid="button-save-opportunity">
                      Simpan
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
