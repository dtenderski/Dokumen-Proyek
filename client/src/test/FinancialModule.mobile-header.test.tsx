/**
 * Tests: financial page header controls on small (375px) phone screens — Task #22.
 *
 * jsdom does not apply CSS media queries or compute layout, so these tests
 * focus on the DOM structure that drives the responsive behaviour, plus full
 * interaction testing for each header control.
 *
 * Structural assertions (supplementary — see e2e/ for the real 375px viewport
 * tests using Playwright):
 *  1. The label <span> carries `hidden sm:inline` — CSS hides it below 640 px.
 *  2. The Plus icon is always present inside the button.
 *  3. The month-filter trigger has `w-32 sm:w-40` (128 px mobile, 160 px desktop).
 *  4. The action-wrapper has `shrink-0` so it never collapses in a flex row.
 *
 * Interaction tests:
 *  5. Clicking the icon-only button opens the add-transaction dialog.
 *  6. Selecting a month from the filter reduces the visible transaction count.
 */
import React, { createContext, useContext } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import FinancialModule from "../pages/FinancialModule";
import { queryClient as globalQueryClient } from "@/lib/queryClient";

// ── vi.hoisted: shared handler registry for the Select mock ──────────────────
// vi.mock factories are hoisted before imports, so any variable they rely on
// must also be hoisted. This registry maps each Select instance (by insertion
// order) to its onValueChange callback so SelectItems can call it.
const { selectRegistry } = vi.hoisted(() => {
  const registry: Array<((v: string) => void) | undefined> = [];
  return { selectRegistry: registry };
});

// ── Mock wouter ───────────────────────────────────────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/financial", vi.fn()],
}));

// ── Mock Radix Select with working onValueChange propagation ──────────────────
// SelectContext threads onValueChange from Select → SelectItem so that
// clicking a SelectItem fires the correct parent callback.
const SelectContext = createContext<((v: string) => void) | undefined>(
  undefined
);

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <SelectContext.Provider value={onValueChange}>
      <div data-testid="select-mock" data-value={value ?? ""}>
        {children}
      </div>
    </SelectContext.Provider>
  ),
  SelectTrigger: ({ children, className, ...props }: any) => (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder ?? ""}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => {
    const onValueChange = useContext(SelectContext);
    return (
      <div
        role="option"
        data-value={value}
        onClick={() => onValueChange?.(value)}
        style={{ cursor: "pointer" }}
      >
        {children}
      </div>
    );
  },
}));

// ── Silence recharts in jsdom ─────────────────────────────────────────────────
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

// ── Fixture transactions (two different months so filter has visible effect) ──
const TXN_JUNE = {
  id: 1,
  userId: "u1",
  type: "income",
  category: "payment_received",
  description: "Pembayaran Proyek Alpha",
  amount: 5_000_000,
  date: "2026-06-01T00:00:00.000Z",
  createdAt: "2026-06-01T00:00:00.000Z",
  projectId: null,
  notes: null,
};
const TXN_JULY = {
  id: 2,
  userId: "u1",
  type: "expense",
  category: "material",
  description: "Beli Material Juli",
  amount: 1_000_000,
  date: "2026-07-15T00:00:00.000Z",
  createdAt: "2026-07-15T00:00:00.000Z",
  projectId: null,
  notes: null,
};

// ── Fetch mock ────────────────────────────────────────────────────────────────
function setupFetchMock(transactions: object[] = []) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
    const url = String(input);
    if (url.endsWith("/api/profile"))
      return { ok: true, status: 200, json: async () => null } as Response;
    if (url.endsWith("/api/projects"))
      return { ok: true, status: 200, json: async () => [] } as Response;
    if (url.endsWith("/api/transactions"))
      return { ok: true, status: 200, json: async () => transactions } as Response;
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });
}

// ── Render helper ─────────────────────────────────────────────────────────────
function renderFinancialModule() {
  return render(
    <QueryClientProvider client={globalQueryClient}>
      <FinancialModule />
    </QueryClientProvider>
  );
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  globalQueryClient.clear();
  selectRegistry.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

// ─────────────────────────────────────────────────────────────────────────────

describe("FinancialModule – mobile header controls (375 px viewport)", () => {
  // ── Structural assertions (supplementary) ───────────────────────────────────

  it("renders the add-transaction button with the Plus icon always visible", () => {
    setupFetchMock();
    renderFinancialModule();

    const addBtn = screen.getByTestId("button-add-transaction");
    expect(addBtn).toBeInTheDocument();

    // The lucide Plus icon is rendered as an <svg> inside the button
    expect(addBtn.querySelector("svg")).not.toBeNull();
  });

  it("the 'Tambah Transaksi' label span carries 'hidden sm:inline' (icon-only below sm)", () => {
    setupFetchMock();
    renderFinancialModule();

    const addBtn = screen.getByTestId("button-add-transaction");

    // Both 'hidden' and 'sm:inline' must be present so CSS hides the label
    // below the 640 px breakpoint, leaving only the Plus icon visible.
    const labelSpan = addBtn.querySelector("span.hidden.sm\\:inline");
    expect(labelSpan).not.toBeNull();
    expect(labelSpan?.textContent).toBe("Tambah Transaksi");
  });

  it("month-filter trigger carries 'w-32 sm:w-40' (128 px on mobile, 160 px on desktop)", () => {
    setupFetchMock();
    renderFinancialModule();

    const trigger = screen.getByTestId("select-filter-month");
    expect(trigger.className).toMatch(/\bw-32\b/);
    expect(trigger.className).toMatch(/\bsm:w-40\b/);
  });

  it("header action wrapper carries 'shrink-0' to prevent flex collapse on narrow screens", () => {
    setupFetchMock();
    renderFinancialModule();

    const addBtn = screen.getByTestId("button-add-transaction");
    expect(addBtn.closest("div.shrink-0")).not.toBeNull();
  });

  // ── Interaction tests ───────────────────────────────────────────────────────

  it("tapping the icon-only button opens the add-transaction dialog", async () => {
    setupFetchMock();
    renderFinancialModule();

    fireEvent.click(screen.getByTestId("button-add-transaction"));

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Tambah Transaksi" })).toBeInTheDocument();
  });

  it("dialog opened from icon button contains income/expense type toggles", async () => {
    setupFetchMock();
    renderFinancialModule();

    fireEvent.click(screen.getByTestId("button-add-transaction"));
    await waitFor(() => screen.getByRole("dialog"));

    expect(screen.getByTestId("button-type-income")).toBeInTheDocument();
    expect(screen.getByTestId("button-type-expense")).toBeInTheDocument();
  });

  it("dialog can be dismissed via the Batal button after opening from the icon", async () => {
    setupFetchMock();
    renderFinancialModule();

    fireEvent.click(screen.getByTestId("button-add-transaction"));
    await waitFor(() => screen.getByRole("dialog"));

    fireEvent.click(screen.getByText("Batal"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("month-filter trigger is present and not disabled", () => {
    setupFetchMock();
    renderFinancialModule();

    const trigger = screen.getByTestId("select-filter-month");
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toBeDisabled();
  });

  it("selecting a month via the filter reduces the transaction count to that month only", async () => {
    setupFetchMock([TXN_JUNE, TXN_JULY]);
    renderFinancialModule();

    // Wait for both transactions to appear (all-transactions tab shows 2)
    await waitFor(() =>
      expect(screen.getByTestId("tab-all")).toHaveTextContent("(2)")
    );

    // Both rows are visible before filtering
    expect(screen.getByText("Pembayaran Proyek Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beli Material Juli")).toBeInTheDocument();

    // Click the "2026-07" month option inside the month-filter Select.
    // Our mock renders SelectItems as clickable <div role="option"> elements.
    // The first Select in the header is the month filter.
    const julyOption = screen.getByRole("option", { name: /Juli 2026/i });
    fireEvent.click(julyOption);

    // After filtering, only the July transaction should appear
    await waitFor(() =>
      expect(screen.getByTestId("tab-all")).toHaveTextContent("(1)")
    );
    expect(screen.getByText("Beli Material Juli")).toBeInTheDocument();
    expect(screen.queryByText("Pembayaran Proyek Alpha")).not.toBeInTheDocument();
  });

  it("clearing the month filter (Semua Bulan) restores all transactions", async () => {
    setupFetchMock([TXN_JUNE, TXN_JULY]);
    renderFinancialModule();

    await waitFor(() =>
      expect(screen.getByTestId("tab-all")).toHaveTextContent("(2)")
    );

    // Filter to July
    fireEvent.click(screen.getByRole("option", { name: /Juli 2026/i }));
    await waitFor(() =>
      expect(screen.getByTestId("tab-all")).toHaveTextContent("(1)")
    );

    // Clear filter — "Semua Bulan" option has value ""
    fireEvent.click(screen.getByRole("option", { name: /Semua Bulan/i }));
    await waitFor(() =>
      expect(screen.getByTestId("tab-all")).toHaveTextContent("(2)")
    );
    expect(screen.getByText("Pembayaran Proyek Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beli Material Juli")).toBeInTheDocument();
  });
});
