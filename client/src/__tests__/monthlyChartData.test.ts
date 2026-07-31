/**
 * Unit tests for the cash-flow chart logic in FinancialModule.
 *
 * Imports the real production utility so any regression in production code is
 * caught here immediately.
 *
 * Verifies:
 *  1. Months with both income and expense → both `pemasukan` and `pengeluaran` present
 *  2. Months with only income  → `pemasukan` present, `pengeluaran` undefined (no bar)
 *  3. Months with only expense → `pengeluaran` present, `pemasukan` undefined (no bar)
 *  4. Multiple transactions in the same month are accumulated correctly
 *  5. Only the last 6 months are returned
 *  6. Transactions with invalid/missing dates are skipped
 */

import { describe, it, expect } from "vitest";
import { buildMonthlyChartData } from "../lib/financialChartUtils";

describe("buildMonthlyChartData (production utility)", () => {
  it("returns empty array when there are no transactions", () => {
    expect(buildMonthlyChartData([])).toEqual([]);
  });

  it("month with both income and expense shows both pemasukan and pengeluaran", () => {
    const data = buildMonthlyChartData([
      { type: "income",  amount: 5_000_000, date: "2025-03-10" },
      { type: "expense", amount: 2_000_000, date: "2025-03-15" },
    ]);
    expect(data).toHaveLength(1);
    expect(data[0].pemasukan).toBe(5_000_000);
    expect(data[0].pengeluaran).toBe(2_000_000);
  });

  it("month with only income has no pengeluaran key (bar absent in chart)", () => {
    const data = buildMonthlyChartData([
      { type: "income", amount: 3_000_000, date: "2025-04-05" },
    ]);
    expect(data).toHaveLength(1);
    expect(data[0].pemasukan).toBe(3_000_000);
    expect("pengeluaran" in data[0]).toBe(false);
  });

  it("month with only expense has no pemasukan key (bar absent in chart)", () => {
    const data = buildMonthlyChartData([
      { type: "expense", amount: 1_500_000, date: "2025-05-20" },
    ]);
    expect(data).toHaveLength(1);
    expect(data[0].pengeluaran).toBe(1_500_000);
    expect("pemasukan" in data[0]).toBe(false);
  });

  it("accumulates multiple transactions of same type in the same month", () => {
    const data = buildMonthlyChartData([
      { type: "income",  amount: 1_000_000, date: "2025-06-01" },
      { type: "income",  amount: 2_000_000, date: "2025-06-15" },
      { type: "expense", amount: 500_000,   date: "2025-06-10" },
    ]);
    expect(data[0].pemasukan).toBe(3_000_000);
    expect(data[0].pengeluaran).toBe(500_000);
  });

  it("only returns up to the last 6 months", () => {
    const txns = Array.from({ length: 8 }, (_, i) => ({
      type: "income",
      amount: 1_000_000,
      date: `2025-${String(i + 1).padStart(2, "0")}-01`,
    }));
    expect(buildMonthlyChartData(txns)).toHaveLength(6);
  });

  it("skips transactions with missing or invalid dates without crashing", () => {
    const data = buildMonthlyChartData([
      { type: "income",  amount: 1_000_000, date: "2025-07-01" },
      { type: "expense", amount: 500_000,   date: "" },
      { type: "expense", amount: 200_000,   date: null },
    ]);
    // Only the valid July entry should appear; invalid dates skipped
    expect(data).toHaveLength(1);
    expect(data[0].pemasukan).toBe(1_000_000);
    expect("pengeluaran" in data[0]).toBe(false);
  });
});
