import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  ShoppingCart,
  Users,
  FileText,
  Truck,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "wouter";
import type { Opportunity, Product, Transaction, Project, Equipment } from "@shared/schema";

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function SimpleBarChart({ data, maxValue }: { data: number[], maxValue: number }) {
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-primary/80 rounded-t-sm transition-all"
            style={{ height: `${(value / maxValue) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-muted-foreground">{months[index]}</span>
        </div>
      ))}
    </div>
  );
}

function SimpleDonutChart({ segments }: { segments: { label: string, value: number, color: string }[] }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((segment, index) => {
            const percentage = total > 0 ? (segment.value / total) * 100 : 0;
            const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
            const strokeDashoffset = -currentAngle * 2.51;
            currentAngle += percentage;
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
      <div className="space-y-1">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="font-medium">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor 
}: { 
  title: string, 
  value: string | number, 
  change?: string, 
  changeType?: 'up' | 'down' | 'neutral',
  icon: any,
  iconColor: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                changeType === 'up' ? 'text-green-600' : 
                changeType === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {changeType === 'up' && <ArrowUpRight className="w-4 h-4" />}
                {changeType === 'down' && <ArrowDownRight className="w-4 h-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { user } = useAuth();

  const { data: opportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const openOpportunities = opportunities.filter(o => o.status === 'open').length;
  const inProgressOpportunities = opportunities.filter(o => o.status === 'in_progress').length;

  const monthlyData = months.map((_, monthIndex) => {
    return transactions.filter(t => {
      const d = new Date(t.date || t.createdAt || "");
      return d.getFullYear() === new Date().getFullYear() && d.getMonth() === monthIndex;
    }).length;
  });
  const maxMonthlyValue = Math.max(...monthlyData, 1);

  const opportunitySegments = [
    { label: "Open", value: openOpportunities, color: "#22c55e" },
    { label: "Progress", value: inProgressOpportunities, color: "#3b82f6" },
    { label: "Closed", value: opportunities.filter(o => o.status === 'closed').length, color: "#94a3b8" },
  ];

  const projectSegments = [
    { label: "Planning", value: projects.filter(p => p.status === 'planning').length, color: "#f59e0b" },
    { label: "In Progress", value: activeProjects, color: "#3b82f6" },
    { label: "Completed", value: completedProjects, color: "#22c55e" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">Dashboard Analytics</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Activity className="w-3 h-3 mr-1" />
            Real-time
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pendapatan"
            value={`Rp ${(totalIncome / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            iconColor="bg-emerald-500"
          />
          <StatCard
            title="Peluang Aktif"
            value={openOpportunities + inProgressOpportunities}
            icon={Briefcase}
            iconColor="bg-blue-500"
          />
          <StatCard
            title="Proyek Berjalan"
            value={activeProjects}
            change={`${completedProjects} selesai`}
            changeType="neutral"
            icon={Target}
            iconColor="bg-purple-500"
          />
          <StatCard
            title="Produk Marketplace"
            value={products.length}
            icon={ShoppingCart}
            iconColor="bg-orange-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tren Aktivitas Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={monthlyData} maxValue={maxMonthlyValue} />
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Total aktivitas tahun ini: {monthlyData.reduce((a, b) => a + b, 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-primary" />
                Status Peluang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDonutChart segments={opportunitySegments} />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Status Proyek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleDonutChart segments={projectSegments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Ringkasan Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Pendapatan</span>
                </div>
                <span className="font-bold text-green-600 text-right text-sm break-all">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Pengeluaran</span>
                </div>
                <span className="font-bold text-red-600 text-right text-sm break-all">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Net Profit</span>
                </div>
                <span className={`font-bold text-right text-sm break-all ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Tender
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tender</span>
                <span className="font-bold">{opportunities.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tender Aktif</span>
                <span className="font-bold text-green-600">{openOpportunities}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="font-bold text-blue-600">—</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Produk</span>
                <span className="font-bold">{products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaksi Bulan Ini</span>
                <span className="font-bold text-green-600">{transactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                <span className="font-bold text-blue-600">
                  {transactions.length > 0
                    ? `Rp ${(transactions.reduce((s, t) => s + t.amount, 0) / transactions.length / 1_000_000).toFixed(1)}M`
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5 text-primary" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Alat</span>
                <span className="font-bold">{equipment.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tersedia</span>
                <span className="font-bold text-green-600">
                  {equipment.filter(e => e.availability === 'available').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Utilization Rate</span>
                <span className="font-bold text-blue-600">
                  {equipment.length > 0
                    ? `${Math.round((equipment.filter(e => e.availability !== 'available').length / equipment.length) * 100)}%`
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
