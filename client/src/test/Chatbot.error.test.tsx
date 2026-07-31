/**
 * Tests: AI error messages in Chatbot widget
 * Covers: 429 (quota_exceeded), 401 (auth_error), network failure
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chatbot } from "../components/Chatbot";

// ── Mock wouter ───────────────────────────────────────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

// ── Silence ReactMarkdown ─────────────────────────────────────────────────────
vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockFetchResponse(status: number, body: object) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

function mockFetchNetworkError() {
  return vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
}

async function openAndSend(text: string) {
  // Open the chatbot widget
  fireEvent.click(screen.getByTestId("button-open-chatbot"));
  const input = screen.getByTestId("input-chatbot");
  await userEvent.clear(input);
  await userEvent.type(input, text);
  fireEvent.click(screen.getByTestId("button-send-chatbot"));
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Chatbot – error message rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows quota-exceeded message and retry button when API returns 429/503", async () => {
    mockFetchResponse(503, {
      message: "Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.",
      errorCode: "quota_exceeded",
    });

    render(<Chatbot />);
    await openAndSend("Test quota");

    await waitFor(() => {
      expect(
        screen.getByText(/Layanan AI sedang sibuk atau kuota habis/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("button-retry-chatbot")).toBeInTheDocument();
  });

  it("shows auth-error message WITHOUT retry button when API returns auth_error", async () => {
    mockFetchResponse(503, {
      message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
      errorCode: "auth_error",
    });

    render(<Chatbot />);
    await openAndSend("Test auth");

    await waitFor(() => {
      expect(
        screen.getByText(/Silakan masuk terlebih dahulu/i)
      ).toBeInTheDocument();
    });

    // Auth errors must NOT show a retry button
    expect(screen.queryByTestId("button-retry-chatbot")).not.toBeInTheDocument();
  });

  it("shows 'Masuk untuk melanjutkan' login link pointing to /api/login when server returns 401", async () => {
    mockFetchResponse(401, {
      message: "Silakan masuk terlebih dahulu untuk menggunakan fitur AI Chat.",
      errorCode: "auth_error",
    });

    render(<Chatbot />);
    await openAndSend("Unauthenticated chatbot message");

    await waitFor(() => {
      expect(
        screen.getByText(/Silakan masuk terlebih dahulu/i)
      ).toBeInTheDocument();
    });

    // Login CTA must be visible and correct
    const loginLink = screen.getByTestId("link-login-from-chatbot");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveTextContent(/Masuk untuk melanjutkan/i);
    expect(loginLink).toHaveAttribute("href", "/api/login?returnTo=/ai-chat");

    // No retry button for auth errors
    expect(screen.queryByTestId("button-retry-chatbot")).not.toBeInTheDocument();
  });

  it("shows network-error message and retry button when fetch throws", async () => {
    mockFetchNetworkError();

    render(<Chatbot />);
    await openAndSend("Test network drop");

    await waitFor(() => {
      expect(
        screen.getByText(/koneksi bermasalah/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId("button-retry-chatbot")).toBeInTheDocument();
  });

  it("shows fallback error message and retry button for generic 500 response", async () => {
    mockFetchResponse(500, { message: "Gagal memproses pesan" });

    render(<Chatbot />);
    await openAndSend("Test 500");

    await waitFor(() => {
      expect(screen.getByText(/Gagal memproses pesan/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("button-retry-chatbot")).toBeInTheDocument();
  });

  it("shows server-error message with distinct text and icon when API returns server_error", async () => {
    mockFetchResponse(500, {
      message: "Terjadi kesalahan pada server AI.",
      errorCode: "server_error",
    });

    render(<Chatbot />);
    await openAndSend("Test server down");

    await waitFor(() => {
      expect(
        screen.getByText(/Terjadi kesalahan pada server AI/i)
      ).toBeInTheDocument();
    });

    // ServerCrash icon must appear for server_error
    expect(screen.getByTestId("icon-server-error-chatbot")).toBeInTheDocument();

    // Retry button must still be shown (server errors are transient)
    expect(screen.getByTestId("button-retry-chatbot")).toBeInTheDocument();
  });

  it("server_error renders a different label than network_error", async () => {
    // Render server_error first
    const fetchSpy = mockFetchResponse(500, {
      message: "Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.",
      errorCode: "server_error",
    });

    const { unmount } = render(<Chatbot />);
    await openAndSend("Server down test");

    let serverErrText: string | null = null;
    await waitFor(() => {
      const el = screen.getByText(/Terjadi kesalahan pada server AI/i);
      serverErrText = el.textContent;
    });

    unmount();
    fetchSpy.mockRestore();

    // Now render network_error
    mockFetchNetworkError();

    render(<Chatbot />);
    await openAndSend("Network drop test");

    let networkErrText: string | null = null;
    await waitFor(() => {
      const el = screen.getByText(/koneksi bermasalah/i);
      networkErrText = el.textContent;
    });

    expect(serverErrText).not.toEqual(networkErrText);
  });

  it("retry button resends the last user message", async () => {
    // First call fails with quota error
    const fetchSpy = mockFetchResponse(503, {
      message: "Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.",
      errorCode: "quota_exceeded",
    });

    render(<Chatbot />);
    await openAndSend("Retry chatbot msg");

    await waitFor(() => {
      expect(screen.getByTestId("button-retry-chatbot")).toBeInTheDocument();
    });

    // Second call succeeds
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ reply: "Balasan sukses" }),
    } as Response);

    fireEvent.click(screen.getByTestId("button-retry-chatbot"));

    await waitFor(() => {
      expect(screen.getByText("Balasan sukses")).toBeInTheDocument();
    });

    const calls = fetchSpy.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/api/chat")
    );
    expect(calls.length).toBeGreaterThanOrEqual(2);

    const retryBody = JSON.parse(calls[calls.length - 1][1]?.body as string);
    expect(retryBody.message).toBe("Retry chatbot msg");
  });
});
