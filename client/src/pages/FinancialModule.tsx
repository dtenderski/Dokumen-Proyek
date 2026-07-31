import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Pencil,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { Transaction, Project, UserProfile } from "@shared/schema";
import { buildMonthlyChartData, formatChartValue } from "@/lib/financialChartUtils";

const incomeCategories = [
  { value: "payment_received", label: "Pembayaran Diterima" },
  { value: "termin", label: "Termin Proyek" },
  { value: "invoice_paid", label: "Invoice Terbayar" },
  { value: "other_income", label: "Pendapatan Lain" },
];

const expenseCategories = [
  { value: "material", label: "Material" },
  { value: "labor", label: "Upah Tenaga Kerja" },
  { value: "equipment", label: "Sewa Peralatan" },
  { value: "transport", label: "Transportasi" },
  { value: "overhead", label: "Overhead" },
  { value: "tax", label: "Pajak" },
  { value: "other_expense", label: "Pengeluaran Lain" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function FinancialModule() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  // "all" is a sentinel meaning "no filter"; Radix Select v2 forbids value="".
  const [filterMonth, setFilterMonth] = useState<string>("all");
  
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    category: "material",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    projectId: null as number | null,
    notes: "",
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      toast({ title: "Transaksi berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowAddDialog(false);
      setNewTransaction({
        type: "expense",
        category: "material",
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        projectId: null,
        notes: "",
      });
    },
    onError: () => {
      toast({ title: "Gagal menambahkan transaksi", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      toast({ title: "Isi deskripsi dan jumlah", variant: "destructive" });
      return;
    }
    const amountNum = parseInt(newTransaction.amount.replace(/[^0-9]/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Jumlah tidak valid", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...newTransaction,
      amount: amountNum,
      date: new Date(newTransaction.date).toISOString(),
    });
  };

  const filteredTransactions = useMemo(() => {
    if (filterMonth === "all") return transactions;
    return transactions.filter(t => {
      const txDate = new Date(t.date || t.createdAt || "");
      const monthStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      return monthStr === filterMonth;
    });
  }, [transactions, filterMonth]);

  const summary = useMemo(() => {
    const txns = filteredTransactions;
    const totalIncome = txns.filter(t => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = txns.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);
    const balance = totalIncome - totalExpense;
    
    const expenseByCategory: Record<string, number> = {};
    txns.filter(t => t.type === "expense").forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + (t.amount || 0);
    });
    
    return { totalIncome, totalExpense, balance, expenseByCategory };
  }, [filteredTransactions]);

  const incomeTransactions = filteredTransactions.filter(t => t.type === "income");
  const expenseTransactions = filteredTransactions.filter(t => t.type === "expense");

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.date || t.createdAt || "");
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  const monthlyChartData = useMemo(
    () => buildMonthlyChartData(transactions),
    [transactions],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold flex items-center gap-2 truncate">
                <Wallet className="w-5 h-5 text-primary shrink-0" />
                Financial Module
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Laporan Keuangan & Tracking Cash Flow</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-32 sm:w-40" data-testid="select-filter-month">
                  <Calendar className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {months.map(m => (
                    <SelectItem key={m} value={m}>
                      {new Date(m + "-01").toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-transaction" size="sm" className="sm:size-auto">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah Transaksi</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newTransaction.type === "income" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setNewTransaction({ ...newTransaction, type: "income", category: "payment_received" });
                      }}
                      data-testid="button-type-income"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2 text-green-500" />
                      Pemasukan
                    </Button>
                    <Button
                      type="button"
                      variant={newTransaction.type === "expense" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setNewTransaction({ ...newTransaction, type: "expense", category: "material" });
                      }}
                      data-testid="button-type-expense"
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2 text-red-500" />
                      Pengeluaran
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select 
                      value={newTransaction.category} 
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(newTransaction.type === "income" ? incomeCategories : expenseCategories).map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi *</Label>
                    <Input
                      placeholder="Deskripsi transaksi..."
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      data-testid="input-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jumlah (Rp) *</Label>
                      <Input
                        placeholder="1.000.000"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        data-testid="input-amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        data-testid="input-date"
                      />
                    </div>
                  </div>
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <Label>Proyek (Opsional)</Label>
                      <Select 
                        value={newTransaction.projectId?.toString() || ""} 
                        onValueChange={(v) => setNewTransaction({ ...newTransaction, projectId: v ? parseInt(v) : null })}
                      >
                        <SelectTrigger data-testid="select-project">
                          <SelectValue placeholder="Pilih proyek..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tidak terkait proyek</SelectItem>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea
                      placeholder="Catatan tambahan..."
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                      rows={2}
                      data-testid="input-notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={summary.balance >= 0 ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${summary.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}`}>Saldo</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${summary.balance >= 0 ? "bg-blue-100 dark:bg-blue-900" : "bg-amber-100 dark:bg-amber-900"} flex items-center justify-center`}>
                  <DollarSign className={`w-6 h-6 ${summary.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Cash Flow Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              Cash Flow Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-center gap-2">
                <BarChart3 className="w-10 h-10 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Belum ada data transaksi</p>
                <p className="text-xs text-muted-foreground">Tambahkan transaksi untuk melihat grafik cash flow</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                </Button>
              </div>
            ) : (
              <div className="h-52 -mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} barGap={2} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 10 }} width={40} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="pemasukan" name="Pemasukan" fill="#22c55e" radius={[3, 3, 0, 0]} minPointSize={3} />
                    <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[3, 3, 0, 0]} minPointSize={3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown by Category */}
        {Object.keys(summary.expenseByCategory).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="w-5 h-5 text-primary" />
                Rincian Pengeluaran per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expenseCategories
                  .filter(cat => summary.expenseByCategory[cat.value])
                  .sort((a, b) => (summary.expenseByCategory[b.value] || 0) - (summary.expenseByCategory[a.value] || 0))
                  .map(cat => {
                    const amount = summary.expenseByCategory[cat.value] || 0;
                    const pct = summary.totalExpense > 0 ? Math.round((amount / summary.totalExpense) * 100) : 0;
                    return (
                      <div
                        key={cat.value}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                        data-testid={`expense-category-${cat.value}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cat.label}</p>
                          <p className="text-xs text-muted-foreground">{pct}% dari total pengeluaran</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(amount)}</p>
                          <div className="mt-1 h-1.5 w-20 rounded-full bg-red-100 dark:bg-red-900/30">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">Semua ({filteredTransactions.length})</TabsTrigger>
            <TabsTrigger value="income" data-testid="tab-income">Pemasukan ({incomeTransactions.length})</TabsTrigger>
            <TabsTrigger value="expense" data-testid="tab-expense">Pengeluaran ({expenseTransactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada transaksi</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} projects={projects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            {incomeTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada pemasukan</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {incomeTransactions.map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} projects={projects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            {expenseTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Belum ada pengeluaran</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {expenseTransactions.map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} projects={projects} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TransactionRow({ transaction, projects }: { transaction: Transaction; projects: Project[] }) {
  const { toast } = useToast();
  const isIncome = transaction.type === "income";
  const allCategories = [...incomeCategories, ...expenseCategories];
  const categoryLabel = allCategories.find(c => c.value === transaction.category)?.label || transaction.category;
  const project = projects.find(p => p.id === transaction.projectId);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    type: transaction.type as "income" | "expense",
    category: transaction.category,
    description: transaction.description,
    amount: String(transaction.amount),
    date: new Date(transaction.date || transaction.createdAt || "").toISOString().split('T')[0],
    projectId: transaction.projectId ?? null as number | null,
    notes: transaction.notes ?? "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PATCH", `/api/transactions/${transaction.id}`, data),
    onSuccess: () => {
      toast({ title: "Transaksi berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({ title: "Gagal memperbarui transaksi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", `/api/transactions/${transaction.id}`),
    onSuccess: () => {
      toast({ title: "Transaksi berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({ title: "Gagal menghapus transaksi", variant: "destructive" });
    },
  });

  const handleUpdate = () => {
    if (!editData.description || !editData.amount) {
      toast({ title: "Isi deskripsi dan jumlah", variant: "destructive" });
      return;
    }
    const amountNum = parseInt(editData.amount.replace(/[^0-9]/g, ""));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Jumlah tidak valid", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      ...editData,
      amount: amountNum,
      date: new Date(editData.date).toISOString(),
    });
  };

  return (
    <>
      <Card className="hover-elevate" data-testid={`txn-${transaction.id}`}>
        <CardContent className="py-3 flex items-center gap-3">
          <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${isIncome ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
            {isIncome ? (
              <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{transaction.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <span>{categoryLabel}</span>
              {project && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[80px]">{project.name}</span>
                </>
              )}
              <span>·</span>
              <span>{new Date(transaction.date || transaction.createdAt || "").toLocaleDateString('id-ID')}</span>
            </div>
            <p className={`text-sm font-semibold sm:hidden mt-0.5 ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <p className={`font-semibold text-sm hidden sm:block mr-1 ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEditData({
                  type: transaction.type as "income" | "expense",
                  category: transaction.category,
                  description: transaction.description,
                  amount: String(transaction.amount),
                  date: new Date(transaction.date || transaction.createdAt || "").toISOString().split('T')[0],
                  projectId: transaction.projectId ?? null,
                  notes: transaction.notes ?? "",
                });
                setShowEditDialog(true);
              }}
              data-testid={`button-edit-${transaction.id}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              data-testid={`button-delete-${transaction.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={editData.type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setEditData({ ...editData, type: "income", category: "payment_received" })}
              >
                <ArrowUpRight className="w-4 h-4 mr-2 text-green-500" />
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={editData.type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setEditData({ ...editData, type: "expense", category: "material" })}
              >
                <ArrowDownRight className="w-4 h-4 mr-2 text-red-500" />
                Pengeluaran
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={editData.category} onValueChange={(v) => setEditData({ ...editData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(editData.type === "income" ? incomeCategories : expenseCategories).map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Input
                placeholder="Deskripsi transaksi..."
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah (Rp) *</Label>
                <Input
                  placeholder="1.000.000"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                />
              </div>
            </div>
            {projects.length > 0 && (
              <div className="space-y-2">
                <Label>Proyek (Opsional)</Label>
                <Select
                  value={editData.projectId?.toString() || ""}
                  onValueChange={(v) => setEditData({ ...editData, projectId: v ? parseInt(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih proyek..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak terkait proyek</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan tambahan..."
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} data-testid={`button-save-edit-${transaction.id}`}>
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi <strong>{transaction.description}</strong> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-${transaction.id}`}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirm-delete-${transaction.id}`}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
