import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  ArrowLeft, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Activity,
  FileText,
  History,
  Flag,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Project, ProjectUpdate, UserProfile } from "@shared/schema";
import { ExecSummaryModal } from "@/components/ExecSummaryModal";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  planning: { label: "Perencanaan", color: "bg-blue-500", icon: Clock },
  ongoing: { label: "Berjalan", color: "bg-green-500", icon: Activity },
  completed: { label: "Selesai", color: "bg-emerald-500", icon: CheckCircle2 },
  delayed: { label: "Terlambat", color: "bg-amber-500", icon: AlertCircle },
  cancelled: { label: "Dibatalkan", color: "bg-red-500", icon: AlertCircle },
};

const updateTypes = [
  { value: "progress", label: "Update Progress" },
  { value: "issue", label: "Masalah/Issue" },
  { value: "milestone", label: "Milestone Tercapai" },
  { value: "expense", label: "Pengeluaran" },
];

export default function ProjectDashboard() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [execSummaryProject, setExecSummaryProject] = useState<Project | null>(null);
  
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    clientName: "",
    location: "",
    contractValue: "",
    startDate: "",
    endDate: "",
    status: "planning",
  });

  const [newUpdate, setNewUpdate] = useState({
    title: "",
    description: "",
    progressDelta: 0,
    updateType: "progress",
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: projectUpdates = [] } = useQuery<ProjectUpdate[]>({
    queryKey: ["/api/projects", selectedProject?.id, "updates"],
    enabled: !!selectedProject,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      toast({ title: "Proyek berhasil dibuat" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateDialog(false);
      setNewProject({
        name: "",
        description: "",
        clientName: "",
        location: "",
        contractValue: "",
        startDate: "",
        endDate: "",
        status: "planning",
      });
    },
    onError: () => {
      toast({ title: "Gagal membuat proyek", variant: "destructive" });
    },
  });

  const createUpdateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", `/api/projects/${selectedProject?.id}/updates`, data),
    onSuccess: () => {
      toast({ title: "Update berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "updates"] });
      setShowUpdateDialog(false);
      setNewUpdate({ title: "", description: "", progressDelta: 0, updateType: "progress" });
    },
    onError: () => {
      toast({ title: "Gagal menambahkan update", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/projects/${id}`, data),
    onSuccess: () => {
      toast({ title: "Proyek diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name) {
      toast({ title: "Isi nama proyek", variant: "destructive" });
      return;
    }
    createProjectMutation.mutate({
      ...newProject,
      startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : null,
      endDate: newProject.endDate ? new Date(newProject.endDate).toISOString() : null,
    });
  };

  const handleCreateUpdate = () => {
    if (!newUpdate.title) {
      toast({ title: "Isi judul update", variant: "destructive" });
      return;
    }
    createUpdateMutation.mutate(newUpdate);
  };

  const ongoingProjects = projects.filter(p => p.status === "ongoing");
  const delayedProjects = projects.filter(p => p.status === "delayed");
  const completedProjects = projects.filter(p => p.status === "completed");
  const totalValue = projects.reduce((sum, p) => {
    const val = parseFloat((p.contractValue || "0").replace(/[^0-9]/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {execSummaryProject && (
        <ExecSummaryModal
          sourceType="project"
          sourceId={execSummaryProject.id}
          sourceName={execSummaryProject.name}
          onClose={() => setExecSummaryProject(null)}
        />
      )}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Kendali Proyek
              </h1>
              <p className="text-sm text-muted-foreground">Monitoring & Tracking Proyek Real-time</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-project">
                <Plus className="w-4 h-4 mr-2" /> Tambah Proyek
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Proyek Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Proyek *</Label>
                  <Input
                    placeholder="Nama proyek..."
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    data-testid="input-project-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    placeholder="Deskripsi proyek..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={2}
                    data-testid="input-project-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pemberi Kerja</Label>
                    <Input
                      placeholder="Nama klien..."
                      value={newProject.clientName}
                      onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                      data-testid="input-client-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lokasi</Label>
                    <Input
                      placeholder="Lokasi proyek..."
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                      data-testid="input-location"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nilai Kontrak</Label>
                  <Input
                    placeholder="Rp 1.000.000.000"
                    value={newProject.contractValue}
                    onChange={(e) => setNewProject({ ...newProject, contractValue: e.target.value })}
                    data-testid="input-contract-value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Selesai</Label>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                  {createProjectMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Proyek</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sedang Berjalan</p>
                  <p className="text-2xl font-bold text-green-600">{ongoingProjects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terlambat</p>
                  <p className="text-2xl font-bold text-amber-600">{delayedProjects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                  <p className="text-2xl font-bold text-emerald-600">{completedProjects.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Belum ada proyek</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Proyek Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const status = statusConfig[project.status || "planning"];
              const StatusIcon = status.icon;
              return (
                <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                      <Badge className={`${status.color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 space-y-3">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {project.clientName && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="truncate">{project.clientName}</span>
                        </div>
                      )}
                      {project.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{project.location}</span>
                        </div>
                      )}
                      {project.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(project.startDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {project.contractValue && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="truncate">{project.contractValue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowHistoryDialog(true);
                      }}
                      data-testid={`button-history-${project.id}`}
                    >
                      <History className="w-4 h-4 mr-1" /> Riwayat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowUpdateDialog(true);
                      }}
                      data-testid={`button-update-${project.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Update
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-400"
                      onClick={() => setExecSummaryProject(project)}
                      data-testid={`button-exec-summary-${project.id}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Exec. Summary
                    </Button>
                    {project.status === "planning" && (
                      <Button
                        size="sm"
                        onClick={() => updateProjectMutation.mutate({ id: project.id, data: { status: "ongoing" } })}
                        data-testid={`button-start-${project.id}`}
                      >
                        Mulai
                      </Button>
                    )}
                    {project.status === "ongoing" && project.progress === 100 && (
                      <Button
                        size="sm"
                        onClick={() => updateProjectMutation.mutate({ id: project.id, data: { status: "completed" } })}
                        data-testid={`button-complete-${project.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Selesai
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* History / Milestone Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Riwayat & Milestone — {selectedProject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {/* Project Info */}
            {selectedProject && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-bold">{selectedProject.progress || 0}%</span>
                </div>
                <Progress value={selectedProject.progress || 0} className="h-2" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {selectedProject.clientName && <span>👤 {selectedProject.clientName}</span>}
                  {selectedProject.location && <span>📍 {selectedProject.location}</span>}
                  {selectedProject.contractValue && <span>💰 {selectedProject.contractValue}</span>}
                </div>
              </div>
            )}

            {/* Updates Timeline */}
            {projectUpdates.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Belum ada update/riwayat untuk proyek ini.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                  onClick={() => { setShowHistoryDialog(false); setShowUpdateDialog(true); }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Tambah Update Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {projectUpdates
                  .slice()
                  .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
                  .map((update, idx) => {
                    const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
                      milestone: { icon: Flag, color: "text-amber-500 bg-amber-50", label: "Milestone" },
                      issue: { icon: AlertTriangle, color: "text-red-500 bg-red-50", label: "Issue" },
                      progress: { icon: Activity, color: "text-blue-500 bg-blue-50", label: "Progress" },
                      expense: { icon: DollarSign, color: "text-green-500 bg-green-50", label: "Biaya" },
                    };
                    const tc = typeConfig[update.updateType || "progress"] || typeConfig.progress;
                    const Icon = tc.icon;
                    return (
                      <div key={update.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`p-1.5 rounded-full ${tc.color} flex-shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {idx < projectUpdates.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[24px]" />
                          )}
                        </div>
                        <div className="pb-3 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold leading-tight">{update.title}</p>
                              <Badge variant="secondary" className="text-[10px] h-4 px-1 mt-0.5">{tc.label}</Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {update.createdAt ? new Date(update.createdAt).toLocaleDateString('id-ID') : "-"}
                            </span>
                          </div>
                          {update.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{update.description}</p>
                          )}
                          {update.progressDelta && update.progressDelta > 0 && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +{update.progressDelta}% progress
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { setShowHistoryDialog(false); setShowUpdateDialog(true); }}
              data-testid="button-add-update-from-history"
            >
              <Plus className="w-4 h-4 mr-1" /> Tambah Update
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowHistoryDialog(false)}
              data-testid="button-close-history"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Update: {selectedProject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Update *</Label>
              <Input
                placeholder="Apa yang terjadi hari ini..."
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                data-testid="input-update-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe Update</Label>
              <Select value={newUpdate.updateType} onValueChange={(v) => setNewUpdate({ ...newUpdate, updateType: v })}>
                <SelectTrigger data-testid="select-update-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {updateTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Detail update..."
                value={newUpdate.description}
                onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                rows={3}
                data-testid="input-update-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Tambah Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newUpdate.progressDelta}
                onChange={(e) => setNewUpdate({ ...newUpdate, progressDelta: parseInt(e.target.value) || 0 })}
                data-testid="input-progress-delta"
              />
              <p className="text-xs text-muted-foreground">
                Progress saat ini: {selectedProject?.progress || 0}% 
                {newUpdate.progressDelta > 0 && ` → ${Math.min(100, (selectedProject?.progress || 0) + newUpdate.progressDelta)}%`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateUpdate} disabled={createUpdateMutation.isPending} data-testid="button-submit-update">
              {createUpdateMutation.isPending ? "Menyimpan..." : "Simpan Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
