/**
 * Pure utilities for the Financial Module cash-flow chart.
 * Exported so they can be unit-tested directly against production logic.
 */

export type TransactionLike = {
  type: string;
  amount?: number | null;
  date?: string | null;
  createdAt?: string | null;
};

export type MonthlyChartEntry = {
  bulan: string;
  pemasukan?: number;
  pengeluaran?: number;
};

/**
 * Builds the last-6-months bar-chart dataset from a list of transactions.
 * Months with only income will have no `pengeluaran` key (no red bar).
 * Months with only expense will have no `pemasukan` key (no green bar).
 */
export function buildMonthlyChartData(transactions: TransactionLike[]): MonthlyChartEntry[] {
  if (transactions.length === 0) return [];

  const monthMap: Record<string, { pemasukan?: number; pengeluaran?: number }> = {};

  transactions.forEach(t => {
    const d = new Date(t.date || t.createdAt || "");
    if (isNaN(d.getTime())) return; // skip invalid dates
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = {};
    if (t.type === "income") {
      monthMap[key].pemasukan = (monthMap[key].pemasukan ?? 0) + (t.amount || 0);
    } else {
      monthMap[key].pengeluaran = (monthMap[key].pengeluaran ?? 0) + (t.amount || 0);
    }
  });

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, data]) => {
      const d = new Date(key + "-01");
      return {
        bulan: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
        ...data,
      };
    });
}

/** Compact Y-axis tick label (e.g. "5jt", "300rb", "1.2M") */
export function formatChartValue(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}jt`;
  return `${(value / 1000).toFixed(0)}rb`;
}
