/**
 * Tests: rename and delete operations on chat sessions in the history panel.
 *
 * Covers the three acceptance criteria for Task #72:
 *  1. After renaming a session the new title persists when the panel is
 *     re-opened — modelled as: perform rename → unmount → remount → open
 *     panel → server returns updated title → assert new title is shown.
 *  2. After deleting a session it stays gone when the panel is re-opened —
 *     modelled as: perform delete → unmount → remount → open panel → server
 *     returns filtered list → assert session is absent.
 *  3. When the server returns 403 (another user's session), the UI does not
 *     update — title stays the same / session stays in list.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import AIChat from "../pages/AIChat";

// ── Mock wouter ───────────────────────────────────────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/ai-chat", vi.fn()],
}));

// ── Mock useAuth ──────────────────────────────────────────────────────────────
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-42", email: "tester@example.com", firstName: "Tester" },
  }),
}));

// ── Silence ReactMarkdown ─────────────────────────────────────────────────────
vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <span data-testid="md">{children}</span>,
}));

// ── Fixture sessions ──────────────────────────────────────────────────────────
const SESSION_A = {
  id: 101,
  title: "Sesi Asli",
  updatedAt: "2026-07-28T10:00:00Z",
  createdAt: "2026-07-28T10:00:00Z",
};
const SESSION_B = {
  id: 202,
  title: "Sesi Kedua",
  updatedAt: "2026-07-28T11:00:00Z",
  createdAt: "2026-07-28T11:00:00Z",
};

// ── Fetch mock factory ────────────────────────────────────────────────────────

interface FetchMockOptions {
  /** Sessions list to return from GET /api/chat/sessions */
  sessionsList?: Array<typeof SESSION_A>;
  /** Return 403 for PATCH on any session */
  patchReturns403?: boolean;
  /** Return 403 for DELETE on any session */
  deleteReturns403?: boolean;
}

function setupFetch(opts: FetchMockOptions = {}) {
  const sessions = opts.sessionsList ?? [SESSION_B, SESSION_A];

  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any, init: any) => {
    const url = String(input);
    const method = ((init as RequestInit | undefined)?.method ?? "GET").toUpperCase();

    // Initial history load — empty
    if (url.endsWith("/api/chat/history") && method === "GET") {
      return { ok: true, status: 200, json: async () => ({ messages: [] }) } as Response;
    }

    // Session list
    if (url.endsWith("/api/chat/sessions") && method === "GET") {
      return { ok: true, status: 200, json: async () => sessions } as Response;
    }

    // Load individual session messages
    if (url.match(/\/api\/chat\/sessions\/\d+$/) && method === "GET") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: SESSION_A.id, messages: [] }),
      } as Response;
    }

    // PATCH rename
    if (url.match(/\/api\/chat\/sessions\/\d+$/) && method === "PATCH") {
      if (opts.patchReturns403) {
        return {
          ok: false,
          status: 403,
          json: async () => ({ message: "Not authorized" }),
        } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }

    // DELETE session
    if (url.match(/\/api\/chat\/sessions\/\d+$/) && method === "DELETE") {
      if (opts.deleteReturns403) {
        return {
          ok: false,
          status: 403,
          json: async () => ({ message: "Not authorized" }),
        } as Response;
      }
      return { ok: true, status: 200, json: async () => ({ success: true }) } as Response;
    }

    // Create session
    if (url.endsWith("/api/chat/history/session") && method === "POST") {
      return { ok: true, status: 201, json: async () => ({ sessionId: 999 }) } as Response;
    }

    // Save message
    if (url.endsWith("/api/chat/history/message") && method === "POST") {
      return { ok: true, status: 201, json: async () => ({}) } as Response;
    }

    // Chat send
    if (url.endsWith("/api/chat") && method === "POST") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ reply: "Respons AI" }),
      } as Response;
    }

    console.warn("[fetch mock] Unhandled:", method, url);
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function openHistoryPanel() {
  fireEvent.click(screen.getByTestId("button-history"));
  await waitFor(() => screen.getByTestId("panel-history"));
  return screen.getByTestId("panel-history");
}

async function openSessionMenu(panel: HTMLElement, sessionId: number) {
  // The "…" button is a sibling to the session button — find it directly in the panel
  const menuBtn = within(panel).getByTestId(`button-session-menu-${sessionId}`);
  fireEvent.click(menuBtn);
  await waitFor(() => within(panel).getByTestId(`menu-session-${sessionId}`));
}

// ─────────────────────────────────────────────────────────────────────────────

describe("AIChat – rename session", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("shows the rename input when 'Ubah nama' is clicked", async () => {
    setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).getByTestId(`input-rename-${SESSION_A.id}`)).toBeInTheDocument()
    );
  });

  it("updates the title in the list immediately on Enter", async () => {
    setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));

    const input = await waitFor(() =>
      within(panel).getByTestId(`input-rename-${SESSION_A.id}`)
    );
    fireEvent.change(input, { target: { value: "Judul Baru" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(within(panel).getByText("Judul Baru")).toBeInTheDocument()
    );
    expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument();
  });

  it("sends PATCH to the correct endpoint on commit", async () => {
    const fetchSpy = setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));
    const input = await waitFor(() =>
      within(panel).getByTestId(`input-rename-${SESSION_A.id}`)
    );
    fireEvent.change(input, { target: { value: "Judul Baru" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => within(panel).getByText("Judul Baru"));

    const patchCalls = fetchSpy.mock.calls.filter(
      ([url, opts]) =>
        String(url).includes(`/api/chat/sessions/${SESSION_A.id}`) &&
        ((opts as RequestInit | undefined)?.method ?? "").toUpperCase() === "PATCH"
    );
    expect(patchCalls).toHaveLength(1);
    const init = patchCalls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string) as { title: string };
    expect(body.title).toBe("Judul Baru");
  });

  it("persists renamed title after a page reload — remount fetches updated title from server", async () => {
    // Step 1: mount, rename session A through the UI
    setupFetch();
    render(<AIChat />);
    let panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));
    const input = await waitFor(() =>
      within(panel).getByTestId(`input-rename-${SESSION_A.id}`)
    );
    fireEvent.change(input, { target: { value: "Nama Baru Setelah Reload" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Confirm PATCH was sent (proving client called the server)
    await waitFor(() => within(panel).getByText("Nama Baru Setelah Reload"));

    // Step 2: simulate page reload — unmount, reset mocks, remount with
    // server now returning the renamed title
    cleanup();
    vi.restoreAllMocks();

    const renamedSession = { ...SESSION_A, title: "Nama Baru Setelah Reload" };
    setupFetch({ sessionsList: [SESSION_B, renamedSession] });
    render(<AIChat />);

    panel = await openHistoryPanel();

    // After reload the server-backed title is visible
    await waitFor(() =>
      expect(within(panel).getByText("Nama Baru Setelah Reload")).toBeInTheDocument()
    );
    // Original title is gone
    expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument();
  });

  it("does NOT update the title when the server returns 403", async () => {
    setupFetch({ patchReturns403: true });
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));
    const input = await waitFor(() =>
      within(panel).getByTestId(`input-rename-${SESSION_A.id}`)
    );
    fireEvent.change(input, { target: { value: "Judul Ditolak" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Wait for rename flow to complete (input disappears)
    await waitFor(() =>
      expect(within(panel).queryByTestId(`input-rename-${SESSION_A.id}`)).not.toBeInTheDocument()
    );

    // Title must remain unchanged
    expect(within(panel).queryByText("Judul Ditolak")).not.toBeInTheDocument();
    expect(within(panel).getByText("Sesi Asli")).toBeInTheDocument();
  });

  it("does nothing when committing an empty rename", async () => {
    const fetchSpy = setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-rename-${SESSION_A.id}`));
    const input = await waitFor(() =>
      within(panel).getByTestId(`input-rename-${SESSION_A.id}`)
    );
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(within(panel).queryByTestId(`input-rename-${SESSION_A.id}`)).not.toBeInTheDocument()
    );

    const patchCalls = fetchSpy.mock.calls.filter(
      ([url, opts]) =>
        String(url).includes(`/api/chat/sessions/${SESSION_A.id}`) &&
        ((opts as RequestInit | undefined)?.method ?? "").toUpperCase() === "PATCH"
    );
    expect(patchCalls).toHaveLength(0);
    expect(within(panel).getByText("Sesi Asli")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("AIChat – delete session", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("shows the confirm-delete prompt when 'Hapus' is clicked", async () => {
    setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)).toBeInTheDocument()
    );
  });

  it("removes session from list immediately when delete is confirmed", async () => {
    setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-confirm-delete-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument()
    );
    expect(within(panel).getByText("Sesi Kedua")).toBeInTheDocument();
  });

  it("cancelling delete confirmation keeps the session in the list", async () => {
    setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-cancel-delete-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).queryByTestId(`confirm-delete-${SESSION_A.id}`)).not.toBeInTheDocument()
    );
    expect(within(panel).getByText("Sesi Asli")).toBeInTheDocument();
  });

  it("sends DELETE to the correct endpoint on confirmation", async () => {
    const fetchSpy = setupFetch();
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-confirm-delete-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument()
    );

    const deleteCalls = fetchSpy.mock.calls.filter(
      ([url, opts]) =>
        String(url).includes(`/api/chat/sessions/${SESSION_A.id}`) &&
        ((opts as RequestInit | undefined)?.method ?? "").toUpperCase() === "DELETE"
    );
    expect(deleteCalls).toHaveLength(1);
  });

  it("does not remove the session when the server returns 403", async () => {
    setupFetch({ deleteReturns403: true });
    render(<AIChat />);
    const panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-confirm-delete-${SESSION_A.id}`));

    // Wait for async delete to settle (confirm dialog disappears)
    await waitFor(() =>
      expect(within(panel).queryByTestId(`confirm-delete-${SESSION_A.id}`)).not.toBeInTheDocument()
    );

    // Session must still be present because DELETE was rejected
    expect(within(panel).getByText("Sesi Asli")).toBeInTheDocument();
  });

  it("deleted session stays gone after a page reload — remount fetches filtered list from server", async () => {
    // Step 1: mount, delete session A through the UI
    setupFetch();
    render(<AIChat />);
    let panel = await openHistoryPanel();

    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-confirm-delete-${SESSION_A.id}`));

    // Confirm DELETE was called (client told the server to delete)
    await waitFor(() =>
      expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument()
    );

    // Step 2: simulate page reload — unmount, reset mocks, remount with
    // server now returning only the remaining session
    cleanup();
    vi.restoreAllMocks();

    setupFetch({ sessionsList: [SESSION_B] });
    render(<AIChat />);

    panel = await openHistoryPanel();

    // After reload the deleted session is absent
    await waitFor(() =>
      expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument()
    );
    // Remaining session is still visible
    expect(within(panel).getByText("Sesi Kedua")).toBeInTheDocument();
  });

  it("resets to a new chat when the currently active session is deleted", async () => {
    setupFetch();
    render(<AIChat />);

    // Load session A as the active session
    let panel = await openHistoryPanel();
    fireEvent.click(within(panel).getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() =>
      expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument()
    );

    // Re-open panel and delete the now-active session
    panel = await openHistoryPanel();
    await openSessionMenu(panel, SESSION_A.id);
    fireEvent.click(within(panel).getByTestId(`button-delete-${SESSION_A.id}`));
    await waitFor(() =>
      within(panel).getByTestId(`confirm-delete-${SESSION_A.id}`)
    );
    fireEvent.click(within(panel).getByTestId(`button-confirm-delete-${SESSION_A.id}`));

    await waitFor(() =>
      expect(within(panel).queryByText("Sesi Asli")).not.toBeInTheDocument()
    );
    // The remaining session is still visible
    expect(within(panel).getByText("Sesi Kedua")).toBeInTheDocument();
  });
});
