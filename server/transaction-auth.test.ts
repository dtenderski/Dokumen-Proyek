// @vitest-environment node
/**
 * Authorization tests for PATCH /api/transactions/:id and DELETE /api/transactions/:id.
 *
 * Verifies that:
 * - A user attempting to PATCH another user's transaction receives 403.
 * - A user attempting to DELETE another user's transaction receives 403.
 * - The owner of a transaction can PATCH and DELETE it (200 / 204).
 */
import { vi, describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import type { Express } from "express";

// ── Shared fixture ─────────────────────────────────────────────────────────────
const OWNER_ID = "user-owner";
const OTHER_ID = "user-other";

const OWNED_TXN = {
  id: 1,
  userId: OWNER_ID,
  type: "income" as const,
  category: "Sales",
  description: "Test income",
  amount: 100000,
  date: new Date("2026-01-01"),
  projectId: null,
  notes: null,
  createdAt: new Date("2026-01-01"),
};

// ── Mock: storage module ───────────────────────────────────────────────────────
vi.mock("./storage", () => ({
  storage: {
    // seedDatabase dependencies
    getHeroContent:            vi.fn().mockResolvedValue({ id: 1 }),
    getModules:                vi.fn().mockResolvedValue([{}]),
    getUserRoles:              vi.fn().mockResolvedValue([{}]),
    getBenefits:               vi.fn().mockResolvedValue([{}]),
    getCtaContent:             vi.fn().mockResolvedValue({ id: 1 }),
    updateHeroBackgroundImage: vi.fn().mockResolvedValue(undefined),
    // Transaction methods under test
    getTransaction:     vi.fn().mockResolvedValue(OWNED_TXN),
    updateTransaction:  vi.fn().mockResolvedValue(OWNED_TXN),
    deleteTransaction:  vi.fn().mockResolvedValue(true),
    // Other storage methods referenced at app setup (return harmless stubs)
    getTransactionsByUser: vi.fn().mockResolvedValue([]),
    createTransaction:     vi.fn().mockResolvedValue(OWNED_TXN),
  },
}));

// ── Mock: auth middleware ──────────────────────────────────────────────────────
// We expose a mutable `currentUserId` so each test can switch the caller.
let currentUserId = OTHER_ID;

vi.mock("./replit_integrations/auth", () => ({
  isAuthenticated: (req: any, _res: any, next: () => void) => {
    req.user = { claims: { sub: currentUserId } };
    next();
  },
  setupAuth:           vi.fn(),
  getSession:          vi.fn(),
  authStorage:         {},
  registerAuthRoutes:  vi.fn(),
}));

// ── Silence drizzle / pg imports inside routes.ts ─────────────────────────────
vi.mock("./db", () => ({
  db:   {},
  pool: { end: vi.fn() },
}));

// ── Build the Express app once ─────────────────────────────────────────────────
let app: Express;

beforeAll(async () => {
  const { createServer } = await import("http");
  const { registerRoutes } = await import("./routes");
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PATCH /api/transactions/:id – cross-user authorization", () => {
  it("returns 403 when the caller does not own the transaction", async () => {
    currentUserId = OTHER_ID; // caller ≠ OWNER_ID

    const res = await request(app)
      .patch("/api/transactions/1")
      .send({ description: "hacked" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("returns 200 when the caller owns the transaction", async () => {
    currentUserId = OWNER_ID; // caller === OWNER_ID

    const res = await request(app)
      .patch("/api/transactions/1")
      .send({ description: "legit update" });

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/transactions/:id – cross-user authorization", () => {
  it("returns 403 when the caller does not own the transaction", async () => {
    currentUserId = OTHER_ID; // caller ≠ OWNER_ID

    const res = await request(app).delete("/api/transactions/1");

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("returns 204 when the caller owns the transaction", async () => {
    currentUserId = OWNER_ID; // caller === OWNER_ID

    const res = await request(app).delete("/api/transactions/1");

    expect(res.status).toBe(204);
  });
});
