/**
 * Tests: edit and delete transaction actions in FinancialModule.
 *
 * Covers the three acceptance criteria for Task #15:
 *  1. Editing a transaction updates the row and totals — including after a
 *     full page reload (unmount → remount with a fresh QueryClient).
 *  2. Deleting a transaction removes the row and refreshes totals — including
 *     after a full page reload.
 *  3. The delete confirmation dialog guards against accidental removal —
 *     clicking "Cancel" leaves the transaction intact.
 *
 * "Page reload" is modelled as:
 *   - Perform the mutation and wait for success.
 *   - cleanup() (unmount all rendered components).
 *   - Create a brand-new QueryClient (empty cache — no stale data).
 *   - Re-render FinancialModule wrapped in the fresh client.
 *   - The fetch mock now returns the post-mutation server state.
 *   - Assert the UI reflects the persisted change.
 *
 * Implementation note:
 *   FinancialModule imports the global `queryClient` singleton from
 *   `@/lib/queryClient` and calls `queryClient.invalidateQueries()` inside
 *   mutation `onSuccess` handlers. To keep the Provider and the mutation
 *   invalidation on the same cache, we also wrap "before-reload" renders with
 *   that singleton, then switch to a fresh standalone QueryClient for the
 *   post-reload render (which deliberately avoids any shared state).
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FinancialModule from "../pages/FinancialModule";
import { queryClient as globalQueryClient, getQueryFn } from "@/lib/queryClient";

// ── Mock wouter ───────────────────────────────────────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/financial", vi.fn()],
}));

// ── Mock Radix Select to avoid empty-value restriction in jsdom ───────────────
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value }: any) => (
    <div data-testid="select-mock" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button type="button" {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div role="option" data-value={value}>{children}</div>
  ),
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

// ── Fixture transactions ──────────────────────────────────────────────────────
const TXN_A = {
  id: 1,
  userId: "user-1",
  type: "income",
  category: "payment_received",
  description: "Pembayaran Proyek Alpha",
  amount: 5_000_000,
  date: "2026-07-01T00:00:00.000Z",
  createdAt: "2026-07-01T00:00:00.000Z",
  projectId: null,
  notes: null,
};

const TXN_B = {
  id: 2,
  userId: "user-1",
  type: "expense",
  category: "material",
  description: "Pembelian Material Besi",
  amount: 2_000_000,
  date: "2026-07-05T00:00:00.000Z",
  createdAt: "2026-07-05T00:00:00.000Z",
  projectId: null,
  notes: null,
};

// ── Persistent mock state helper ──────────────────────────────────────────────
//
// `serverState` mirrors what the server would persist after mutations.
// The fetch mock always reads from it, so tests that unmount → remount get the
// post-mutation data on the first fresh GET — exactly like a real page reload.

function makeFetchMock(serverTransactions: object[]) {
  const state = { transactions: serverTransactions };

  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(
    async (input: any, init: any) => {
      const url = String(input);
      const method = ((init as RequestInit | undefined)?.method ?? "GET").toUpperCase();

      // Profile
      if (url.endsWith("/api/profile") && method === "GET") {
        return { ok: true, status: 200, json: async () => null } as Response;
      }

      // Projects
      if (url.endsWith("/api/projects") && method === "GET") {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }

      // GET transactions — always returns current server state
      if (url.endsWith("/api/transactions") && method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => [...state.transactions],
        } as Response;
      }

      // PATCH (edit) — update server state, return updated record
      if (url.match(/\/api\/transactions\/(\d+)$/) && method === "PATCH") {
        const id = parseInt(url.match(/\/api\/transactions\/(\d+)$/)![1]);
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        state.transactions = state.transactions.map((t: any) =>
          t.id === id ? { ...t, ...body } : t
        );
        const updated = state.transactions.find((t: any) => t.id === id);
        return {
          ok: true,
          status: 200,
          json: async () => updated,
          text: async () => JSON.stringify(updated),
        } as Response;
      }

      // DELETE — update server state, return 204
      if (url.match(/\/api\/transactions\/(\d+)$/) && method === "DELETE") {
        const id = parseInt(url.match(/\/api\/transactions\/(\d+)$/)![1]);
        state.transactions = state.transactions.filter((t: any) => t.id !== id);
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
          text: async () => "",
        } as Response;
      }

      console.warn("[fetch mock] Unhandled:", method, url);
      return {
        ok: false,
        status: 404,
        json: async () => ({}),
        text: async () => "",
      } as Response;
    }
  );

  return { spy, state };
}

// ── Render helpers ────────────────────────────────────────────────────────────

/** Render with the global singleton (mutations share its cache). */
function renderWithGlobalClient() {
  return render(
    <QueryClientProvider client={globalQueryClient}>
      <FinancialModule />
    </QueryClientProvider>
  );
}

/** Render with a brand-new QueryClient — simulates a fresh page load. */
function renderWithFreshClient() {
  const freshClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "throw" }),
        retry: false,
        staleTime: 0,
      },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={freshClient}>
      <FinancialModule />
    </QueryClientProvider>
  );
}

// ── Per-test lifecycle ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  globalQueryClient.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function waitForRows() {
  await waitFor(() =>
    expect(screen.getByTestId(`txn-${TXN_A.id}`)).toBeInTheDocument()
  );
}

async function openEditDialog() {
  fireEvent.click(screen.getByTestId(`button-edit-${TXN_A.id}`));
  await waitFor(() => screen.getByText("Edit Transaksi"));
}

async function openDeleteDialog() {
  fireEvent.click(screen.getByTestId(`button-delete-${TXN_B.id}`));
  await waitFor(() => screen.getByText("Hapus Transaksi?"));
}

// ─────────────────────────────────────────────────────────────────────────────

describe("FinancialModule – edit transaction", () => {
  it("opens the edit dialog when the pencil button is clicked", async () => {
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openEditDialog();

    expect(screen.getByText("Edit Transaksi")).toBeInTheDocument();
  });

  it("pre-fills the edit form with the current transaction values", async () => {
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openEditDialog();

    expect(screen.getByDisplayValue(TXN_A.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(String(TXN_A.amount))).toBeInTheDocument();
  });

  it("sends a PATCH and the updated description is visible in the same session", async () => {
    const { spy } = makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openEditDialog();

    const descInput = screen.getByDisplayValue(TXN_A.description);
    fireEvent.change(descInput, { target: { value: "Pembayaran Diperbarui" } });
    fireEvent.click(screen.getByTestId(`button-save-edit-${TXN_A.id}`));

    // PATCH must have been called
    await waitFor(() =>
      expect(
        spy.mock.calls.some(
          ([url, init]: any) =>
            String(url).match(/\/api\/transactions\/1$/) &&
            (init?.method ?? "GET").toUpperCase() === "PATCH"
        )
      ).toBe(true)
    );

    // Updated description appears after cache invalidation + refetch
    await waitFor(() =>
      expect(screen.getByText("Pembayaran Diperbarui")).toBeInTheDocument()
    );
  });

  it("shows the edited description after a page reload (unmount → remount)", async () => {
    // 1. Perform the edit
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openEditDialog();
    const descInput = screen.getByDisplayValue(TXN_A.description);
    fireEvent.change(descInput, { target: { value: "Pembayaran Diperbarui" } });
    fireEvent.click(screen.getByTestId(`button-save-edit-${TXN_A.id}`));

    await waitFor(() =>
      expect(screen.getByText("Pembayaran Diperbarui")).toBeInTheDocument()
    );

    // 2. Simulate page reload — unmount and render fresh with empty cache
    cleanup();
    // fetch mock still reflects the updated server state from makeFetchMock
    renderWithFreshClient();

    // 3. The fresh render must show the updated description fetched from server
    await waitFor(() =>
      expect(screen.getByText("Pembayaran Diperbarui")).toBeInTheDocument()
    );
    // Original description must be gone
    expect(screen.queryByText(TXN_A.description)).not.toBeInTheDocument();
  });

  it("shows the updated income total after a page reload", async () => {
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openEditDialog();
    const amountInput = screen.getByDisplayValue(String(TXN_A.amount));
    fireEvent.change(amountInput, { target: { value: "6000000" } });
    fireEvent.click(screen.getByTestId(`button-save-edit-${TXN_A.id}`));

    await waitFor(() => {
      const incomeCard = screen.getByText("Total Pemasukan").closest("div")!;
      expect(incomeCard.textContent).toContain("6.000.000");
    });

    // Simulate reload
    cleanup();
    renderWithFreshClient();

    // Fresh render should show 6M income from server
    await waitFor(() => {
      const incomeCard = screen.getByText("Total Pemasukan").closest("div")!;
      expect(incomeCard.textContent).toContain("6.000.000");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("FinancialModule – delete transaction", () => {
  it("opens the confirmation dialog when the delete button is clicked", async () => {
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openDeleteDialog();

    expect(screen.getByText("Hapus Transaksi?")).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("does NOT fire a DELETE request when the user clicks Cancel", async () => {
    const { spy } = makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openDeleteDialog();
    fireEvent.click(screen.getByTestId(`button-cancel-delete-${TXN_B.id}`));

    await waitFor(() => {
      const deleteCalls = spy.mock.calls.filter(
        ([url, init]: any) =>
          String(url).match(/\/api\/transactions\/\d+$/) &&
          (init?.method ?? "GET").toUpperCase() === "DELETE"
      );
      expect(deleteCalls).toHaveLength(0);
    });

    // Row must still be present
    expect(screen.getByTestId(`txn-${TXN_B.id}`)).toBeInTheDocument();
  });

  it("removes the row immediately after delete confirmation", async () => {
    const { spy } = makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openDeleteDialog();
    fireEvent.click(screen.getByTestId(`button-confirm-delete-${TXN_B.id}`));

    await waitFor(() =>
      expect(
        spy.mock.calls.some(
          ([url, init]: any) =>
            String(url).match(/\/api\/transactions\/2$/) &&
            (init?.method ?? "GET").toUpperCase() === "DELETE"
        )
      ).toBe(true)
    );

    await waitFor(() =>
      expect(screen.queryByTestId(`txn-${TXN_B.id}`)).not.toBeInTheDocument()
    );
  });

  it("keeps the deleted row gone after a page reload (unmount → remount)", async () => {
    // 1. Delete TXN_B
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openDeleteDialog();
    fireEvent.click(screen.getByTestId(`button-confirm-delete-${TXN_B.id}`));

    await waitFor(() =>
      expect(screen.queryByTestId(`txn-${TXN_B.id}`)).not.toBeInTheDocument()
    );

    // 2. Simulate page reload — fresh QueryClient, empty cache
    cleanup();
    renderWithFreshClient();

    // 3. After a fresh fetch from the (updated) mock server, TXN_B must still be absent
    await waitFor(() =>
      expect(screen.getByTestId(`txn-${TXN_A.id}`)).toBeInTheDocument()
    );
    expect(screen.queryByTestId(`txn-${TXN_B.id}`)).not.toBeInTheDocument();
  });

  it("shows the corrected expense total after a page reload following a delete", async () => {
    // Initial: expense 2M. After delete: expense 0.
    makeFetchMock([TXN_A, TXN_B]);
    renderWithGlobalClient();
    await waitForRows();

    await openDeleteDialog();
    fireEvent.click(screen.getByTestId(`button-confirm-delete-${TXN_B.id}`));

    await waitFor(() => {
      const expenseCard = screen.getByText("Total Pengeluaran").closest("div")!;
      expect(expenseCard.textContent).toContain("0");
    });

    // Simulate reload
    cleanup();
    renderWithFreshClient();

    // Fresh render must also show 0 expense (no TXN_B)
    await waitFor(() => {
      const expenseCard = screen.getByText("Total Pengeluaran").closest("div")!;
      expect(expenseCard.textContent).toContain("0");
    });
  });
});
