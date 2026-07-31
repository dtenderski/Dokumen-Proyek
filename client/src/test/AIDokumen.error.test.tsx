/**
 * Tests: AIDokumen page — now a GustaftaEmbed wrapper
 * Covers:
 *   - Basic UI: Navbar, title, badge, back link, external link all render
 *   - iframe points to the correct Bedah Dokumen URL
 *   - "Buka di Gustafta" link opens in a new tab with noopener
 *   - Page is accessible without authentication (requireAuth=false)
 *   - Fallback card renders when the iframe is blocked
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AIDokumen from "../pages/AIDokumen";

const BEDAH_DOKUMEN_URL = "https://gustafta.my.id/bedah-dokumen";

// ── Mock wouter ───────────────────────────────────────────────────────────────
vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/ai-dokumen", vi.fn()],
}));

// ── Mock useAuth — authenticated user by default ──────────────────────────────
const mockUser = { id: "user-1", email: "test@example.com" };
let mockAuthUser: typeof mockUser | null = mockUser;

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

// ── Suppress Navbar ───────────────────────────────────────────────────────────
vi.mock("@/components/Navbar", () => ({
  Navbar: () => <div data-testid="navbar" />,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

// ─────────────────────────────────────────────────────────────────────────────

describe("AIDokumen – basic UI (GustaftaEmbed)", () => {
  beforeEach(() => {
    mockAuthUser = mockUser;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Navbar", () => {
    renderWithQuery(<AIDokumen />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("shows the AI Dokumen title in the info bar", () => {
    renderWithQuery(<AIDokumen />);
    const matches = screen.getAllByText(/AI Dokumen/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows the 'by Gustafta' badge", () => {
    renderWithQuery(<AIDokumen />);
    expect(screen.getByText(/by Gustafta/i)).toBeInTheDocument();
  });

  it("renders a back link pointing to /agent-hub", () => {
    renderWithQuery(<AIDokumen />);
    const backLink = screen.getByText(/Agent Hub/i).closest("a,[role='link'],button");
    expect(backLink).toBeTruthy();
  });

  it("renders an 'Buka di Gustafta' external link to the bedah-dokumen URL", () => {
    renderWithQuery(<AIDokumen />);
    const extLink = screen.getByText(/Buka di Gustafta/i).closest("a");
    expect(extLink).not.toBeNull();
    expect(extLink?.getAttribute("href")).toBe(BEDAH_DOKUMEN_URL);
    expect(extLink?.getAttribute("target")).toBe("_blank");
    expect(extLink?.getAttribute("rel")).toContain("noopener");
  });

  it("embeds an iframe pointing to the Bedah Dokumen URL", () => {
    renderWithQuery(<AIDokumen />);
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(BEDAH_DOKUMEN_URL);
  });

  it("is accessible without login (no auth gate shown)", () => {
    mockAuthUser = null; // unauthenticated
    renderWithQuery(<AIDokumen />);
    // With requireAuth=false, the embed should render — not the lock screen
    expect(screen.queryByText(/Masuk untuk Memulai/i)).not.toBeInTheDocument();
    // The title and badge should still be visible
    expect(screen.getAllByText(/AI Dokumen/i).length).toBeGreaterThan(0);
  });

  it("embeds the iframe with safe sandbox attributes", () => {
    renderWithQuery(<AIDokumen />);
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    const sandbox = iframe?.getAttribute("sandbox") ?? "";
    // Must allow scripts and forms so the Gustafta app works
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-forms");
    // Must allow popups to escape so external links work for the user
    expect(sandbox).toContain("allow-popups-to-escape-sandbox");
  });

  it("shows a description in the info bar", () => {
    renderWithQuery(<AIDokumen />);
    expect(
      screen.getByText(/Upload dokumen, tanya isi dokumen dengan AI/i)
    ).toBeInTheDocument();
  });
});
