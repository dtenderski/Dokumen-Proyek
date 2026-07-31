/**
 * Tests: switching between past sessions loads the correct messages
 * Covers: history panel open → session click → correct messages rendered
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AIChat from "../pages/AIChat";

// ── Mock wouter so <Link> renders a plain anchor ─────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/ai-chat", vi.fn()],
}));

// ── Mock useAuth with an authenticated user ───────────────────────────────────
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-42", email: "tester@example.com", firstName: "Tester" },
  }),
}));

// ── Silence ReactMarkdown ─────────────────────────────────────────────────────
vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <span data-testid="md">{children}</span>,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Fixture data – two sessions with distinct messages
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_A = { id: 101, title: "Sesi Pertama", updatedAt: "2026-07-28T10:00:00Z", createdAt: "2026-07-28T10:00:00Z" };
const SESSION_B = { id: 202, title: "Sesi Kedua", updatedAt: "2026-07-29T10:00:00Z", createdAt: "2026-07-29T10:00:00Z" };

const MESSAGES_A = [
  { id: 1, role: "user",      content: "Pesan unik sesi A dari pengguna", createdAt: "2026-07-28T10:01:00Z" },
  { id: 2, role: "assistant", content: "Balasan unik sesi A dari asisten", createdAt: "2026-07-28T10:01:05Z" },
];

const MESSAGES_B = [
  { id: 3, role: "user",      content: "Pesan unik sesi B dari pengguna", createdAt: "2026-07-29T10:01:00Z" },
  { id: 4, role: "assistant", content: "Balasan unik sesi B dari asisten", createdAt: "2026-07-29T10:01:05Z" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fetch router helper
// ─────────────────────────────────────────────────────────────────────────────
function setupFetch() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any, opts: any) => {
    const url = String(input);
    const method = opts?.method?.toUpperCase() ?? "GET";

    // Initial history load on mount — return empty (no active session yet)
    if (url.endsWith("/api/chat/history") && method === "GET") {
      return { ok: true, status: 200, json: async () => ({ messages: [] }) } as Response;
    }

    // Session list — return both sessions
    if (url.endsWith("/api/chat/sessions") && method === "GET") {
      return { ok: true, status: 200, json: async () => [SESSION_B, SESSION_A] } as Response;
    }

    // Individual session — session A
    if (url.endsWith(`/api/chat/sessions/${SESSION_A.id}`) && method === "GET") {
      return {
        ok: true, status: 200,
        json: async () => ({ id: SESSION_A.id, messages: MESSAGES_A }),
      } as Response;
    }

    // Individual session — session B
    if (url.endsWith(`/api/chat/sessions/${SESSION_B.id}`) && method === "GET") {
      return {
        ok: true, status: 200,
        json: async () => ({ id: SESSION_B.id, messages: MESSAGES_B }),
      } as Response;
    }

    // Create session (POST)
    if (url.endsWith("/api/chat/history/session") && method === "POST") {
      return { ok: true, status: 201, json: async () => ({ sessionId: 999 }) } as Response;
    }

    // Save message (POST) — silently succeed
    if (url.endsWith("/api/chat/history/message") && method === "POST") {
      return { ok: true, status: 201, json: async () => ({}) } as Response;
    }

    // Chat API (POST) — return a generic reply
    if (url.endsWith("/api/chat") && method === "POST") {
      return { ok: true, status: 200, json: async () => ({ reply: "Respons dari AI" }) } as Response;
    }

    // PATCH / DELETE sessions — succeed silently
    if (url.match(/\/api\/chat\/sessions\/\d+$/) && (method === "PATCH" || method === "DELETE")) {
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }

    // Fallback — unexpected call
    console.warn("[fetch mock] Unhandled:", method, url);
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Stateful fetch router for "send during loaded session" tests.
//
// Server state transitions:
//   • Before persistence (messageSaveCount < 2):
//       /api/chat/sessions → [SESSION_B, SESSION_A]  (SESSION_B most recent)
//   • After both messages are persisted (messageSaveCount >= 2):
//       /api/chat/sessions → [SESSION_A_UPDATED, SESSION_B]  (SESSION_A promoted)
//
// This lets the tests assert a real before→after transition rather than a
// mock that always returns SESSION_A first.
// ─────────────────────────────────────────────────────────────────────────────
function setupFetchStateful() {
  const SESSION_A_UPDATED = { ...SESSION_A, updatedAt: "2026-07-30T10:05:00Z" };
  let messageSaveCount = 0;

  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any, opts: any) => {
    const url = String(input);
    const method = opts?.method?.toUpperCase() ?? "GET";

    if (url.endsWith("/api/chat/history") && method === "GET") {
      return { ok: true, status: 200, json: async () => ({ messages: [] }) } as Response;
    }

    // Sessions list — ordering depends on how many messages have been persisted
    if (url.endsWith("/api/chat/sessions") && method === "GET") {
      const list =
        messageSaveCount >= 2
          ? [SESSION_A_UPDATED, SESSION_B]   // SESSION_A is most recent after send
          : [SESSION_B, SESSION_A];           // original order before any send
      return { ok: true, status: 200, json: async () => list } as Response;
    }

    if (url.endsWith(`/api/chat/sessions/${SESSION_A.id}`) && method === "GET") {
      return {
        ok: true, status: 200,
        json: async () => ({ id: SESSION_A.id, messages: MESSAGES_A }),
      } as Response;
    }

    if (url.endsWith(`/api/chat/sessions/${SESSION_B.id}`) && method === "GET") {
      return {
        ok: true, status: 200,
        json: async () => ({ id: SESSION_B.id, messages: MESSAGES_B }),
      } as Response;
    }

    // No new session should be created when one is already loaded
    if (url.endsWith("/api/chat/history/session") && method === "POST") {
      return { ok: true, status: 201, json: async () => ({ sessionId: SESSION_A.id }) } as Response;
    }

    // Each persisted message increments the counter so the sessions list updates
    if (url.endsWith("/api/chat/history/message") && method === "POST") {
      messageSaveCount += 1;
      return { ok: true, status: 201, json: async () => ({}) } as Response;
    }

    if (url.endsWith("/api/chat") && method === "POST") {
      return { ok: true, status: 200, json: async () => ({ reply: "Respons dari AI" }) } as Response;
    }

    if (url.match(/\/api\/chat\/sessions\/\d+$/) && (method === "PATCH" || method === "DELETE")) {
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }

    console.warn("[fetch mock] Unhandled:", method, url);
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });

  return { spy, getMessageSaveCount: () => messageSaveCount };
}

// ─────────────────────────────────────────────────────────────────────────────

describe("AIChat – session switching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the history panel and shows the session list", async () => {
    setupFetch();
    render(<AIChat />);

    fireEvent.click(screen.getByTestId("button-history"));

    await waitFor(() => {
      expect(screen.getByTestId("panel-history")).toBeInTheDocument();
    });

    // Both session titles must appear in the panel
    const panel = screen.getByTestId("panel-history");
    expect(within(panel).getByText("Sesi Pertama")).toBeInTheDocument();
    expect(within(panel).getByText("Sesi Kedua")).toBeInTheDocument();
  });

  it("loads session A messages when session A is clicked", async () => {
    setupFetch();
    render(<AIChat />);

    // Open history panel
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // Click session A button
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));

    // Session A messages should appear in the chat area
    await waitFor(() => {
      expect(screen.getByText("Pesan unik sesi A dari pengguna")).toBeInTheDocument();
      expect(screen.getByText("Balasan unik sesi A dari asisten")).toBeInTheDocument();
    });

    // Session B messages must NOT be visible
    expect(screen.queryByText("Pesan unik sesi B dari pengguna")).not.toBeInTheDocument();
    expect(screen.queryByText("Balasan unik sesi B dari asisten")).not.toBeInTheDocument();
  });

  it("loads session B messages when session B is clicked", async () => {
    setupFetch();
    render(<AIChat />);

    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    fireEvent.click(screen.getByTestId(`button-session-${SESSION_B.id}`));

    await waitFor(() => {
      expect(screen.getByText("Pesan unik sesi B dari pengguna")).toBeInTheDocument();
      expect(screen.getByText("Balasan unik sesi B dari asisten")).toBeInTheDocument();
    });

    expect(screen.queryByText("Pesan unik sesi A dari pengguna")).not.toBeInTheDocument();
    expect(screen.queryByText("Balasan unik sesi A dari asisten")).not.toBeInTheDocument();
  });

  it("switches correctly from session A to session B", async () => {
    setupFetch();
    render(<AIChat />);

    // ── Load session A first ────────────────────────────────────────────────
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));

    await waitFor(() => {
      expect(screen.getByText("Pesan unik sesi A dari pengguna")).toBeInTheDocument();
    });

    // History panel closes after load — re-open it
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // ── Now switch to session B ─────────────────────────────────────────────
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_B.id}`));

    await waitFor(() => {
      expect(screen.getByText("Pesan unik sesi B dari pengguna")).toBeInTheDocument();
      expect(screen.getByText("Balasan unik sesi B dari asisten")).toBeInTheDocument();
    });

    // Session A messages must no longer be present
    expect(screen.queryByText("Pesan unik sesi A dari pengguna")).not.toBeInTheDocument();
    expect(screen.queryByText("Balasan unik sesi A dari asisten")).not.toBeInTheDocument();
  });

  it("closes the history panel after a session is loaded", async () => {
    setupFetch();
    render(<AIChat />);

    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));

    // Panel should disappear once the session loads
    await waitFor(() => {
      expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument();
    });
  });

  it("fetches the correct session endpoint for each session clicked", async () => {
    const fetchSpy = setupFetch();
    render(<AIChat />);

    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));

    // Re-open panel and load session B
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_B.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi B dari pengguna"));

    // Verify the correct endpoints were called
    const sessionCalls = fetchSpy.mock.calls
      .map(([url]: any[]) => String(url))
      .filter(url => url.match(/\/api\/chat\/sessions\/\d+$/));

    expect(sessionCalls).toContain(`/api/chat/sessions/${SESSION_A.id}`);
    expect(sessionCalls).toContain(`/api/chat/sessions/${SESSION_B.id}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("AIChat – history panel sync after sending in loaded session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper: wait until the stateful mock has received exactly `count` message-save POSTs
  async function waitForMessageSaves(spy: ReturnType<typeof vi.spyOn>, count: number) {
    await waitFor(() => {
      const saves = spy.mock.calls.filter(
        ([url, opts]: any[]) =>
          String(url).endsWith("/api/chat/history/message") &&
          (opts?.method?.toUpperCase() ?? "GET") === "POST",
      );
      expect(saves).toHaveLength(count);
    });
  }

  it("loaded session still appears in panel after a new message is sent", async () => {
    const { spy } = setupFetchStateful();
    render(<AIChat />);

    // ── Load session A (SESSION_B is listed first before any send) ──────────
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // Before loading, SESSION_B is first in the list
    const panelBefore = screen.getByTestId("panel-history");
    const btnsBefore = within(panelBefore)
      .getAllByRole("button")
      .filter(b => /^button-session-\d+$/.test(b.getAttribute("data-testid") ?? ""));
    expect(btnsBefore[0]).toHaveAttribute("data-testid", `button-session-${SESSION_B.id}`);

    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());

    // ── Send a new message while session A is active ────────────────────────
    fireEvent.change(screen.getByTestId("input-chat"), {
      target: { value: "Pertanyaan baru dalam sesi yang sudah dimuat" },
    });
    fireEvent.click(screen.getByTestId("button-send-chat"));

    // Wait for the AI reply to render
    await waitFor(() => screen.getByText("Respons dari AI"));

    // Wait for both messages (user + assistant) to be persisted before checking the panel
    await waitForMessageSaves(spy, 2);

    // ── Re-open history panel ───────────────────────────────────────────────
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // Session A must still be listed in the panel
    const panel = screen.getByTestId("panel-history");
    expect(within(panel).getByText("Sesi Pertama")).toBeInTheDocument();

    // Session B must also still be listed
    expect(within(panel).getByText("Sesi Kedua")).toBeInTheDocument();
  });

  it("loaded session appears at the top of the panel after sending a new message", async () => {
    const { spy } = setupFetchStateful();
    render(<AIChat />);

    // Load session A
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());

    // Send a new message
    fireEvent.change(screen.getByTestId("input-chat"), {
      target: { value: "Pesan lanjutan di sesi A" },
    });
    fireEvent.click(screen.getByTestId("button-send-chat"));
    await waitFor(() => screen.getByText("Respons dari AI"));

    // Wait until both user+assistant messages are persisted — the server will
    // now return SESSION_A at the top on the next sessions GET
    await waitForMessageSaves(spy, 2);

    // Re-open history panel — triggers a fresh GET /api/chat/sessions
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // Session A should be the first session button (promoted to top after save)
    const panel = screen.getByTestId("panel-history");
    const sessionButtons = within(panel)
      .getAllByRole("button")
      .filter(b => /^button-session-\d+$/.test(b.getAttribute("data-testid") ?? ""));

    expect(sessionButtons[0]).toHaveAttribute(
      "data-testid",
      `button-session-${SESSION_A.id}`,
    );
  });

  it("both messages are persisted against the loaded session id", async () => {
    const { spy } = setupFetchStateful();
    render(<AIChat />);

    // Load session A
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());

    // Send a new message
    fireEvent.change(screen.getByTestId("input-chat"), {
      target: { value: "Pesan baru harus tersimpan di sesi A" },
    });
    fireEvent.click(screen.getByTestId("button-send-chat"));
    await waitFor(() => screen.getByText("Respons dari AI"));

    // Wait for both saves
    await waitForMessageSaves(spy, 2);

    // Both POST /api/chat/history/message calls must carry SESSION_A.id in the body
    const saveCalls = spy.mock.calls.filter(
      ([url, opts]: any[]) =>
        String(url).endsWith("/api/chat/history/message") &&
        (opts?.method?.toUpperCase() ?? "GET") === "POST",
    );
    expect(saveCalls).toHaveLength(2);
    for (const [, opts] of saveCalls) {
      const body = JSON.parse(opts.body);
      expect(body.sessionId).toBe(SESSION_A.id);
    }
  });

  it("does not create a duplicate session when sending in a loaded session", async () => {
    const { spy } = setupFetchStateful();
    render(<AIChat />);

    // Load session A
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());

    // Send a new message in the loaded session
    fireEvent.change(screen.getByTestId("input-chat"), {
      target: { value: "Pesan baru tanpa duplikasi sesi" },
    });
    fireEvent.click(screen.getByTestId("button-send-chat"));
    await waitFor(() => screen.getByText("Respons dari AI"));
    await waitForMessageSaves(spy, 2);

    // No new session must have been created
    const createSessionCalls = spy.mock.calls.filter(
      ([url, opts]: any[]) =>
        String(url).endsWith("/api/chat/history/session") &&
        (opts?.method?.toUpperCase() ?? "GET") === "POST",
    );
    expect(createSessionCalls).toHaveLength(0);

    // Re-open panel — still exactly two sessions (no phantom entry)
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    const panel = screen.getByTestId("panel-history");
    const sessionButtons = within(panel)
      .getAllByRole("button")
      .filter(b => /^button-session-\d+$/.test(b.getAttribute("data-testid") ?? ""));
    expect(sessionButtons).toHaveLength(2);
  });

  it("highlights the active session in the panel after sending a new message", async () => {
    const { spy } = setupFetchStateful();
    render(<AIChat />);

    // Load session A
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));
    fireEvent.click(screen.getByTestId(`button-session-${SESSION_A.id}`));
    await waitFor(() => screen.getByText("Pesan unik sesi A dari pengguna"));
    await waitFor(() => expect(screen.queryByTestId("panel-history")).not.toBeInTheDocument());

    // Send a new message
    fireEvent.change(screen.getByTestId("input-chat"), {
      target: { value: "Lanjut ngobrol di sesi yang sudah dimuat" },
    });
    fireEvent.click(screen.getByTestId("button-send-chat"));
    await waitFor(() => screen.getByText("Respons dari AI"));
    await waitForMessageSaves(spy, 2);

    // Re-open panel
    fireEvent.click(screen.getByTestId("button-history"));
    await waitFor(() => screen.getByTestId("panel-history"));

    // The row wrapping the session A button should carry the blue active classes
    const sessionABtn = screen.getByTestId(`button-session-${SESSION_A.id}`);
    // Walk up to the row div (the div with the class conditional on sessionId === s.id)
    const activeRow = sessionABtn.closest("div.border");
    expect(activeRow).not.toBeNull();
    expect(activeRow!.className).toMatch(/bg-blue-600/);
  });
});
