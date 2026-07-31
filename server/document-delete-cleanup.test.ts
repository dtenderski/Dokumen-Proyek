// @vitest-environment node
/**
 * Route integration tests: DELETE /api/ai-dokumen/documents/:id HTTP contract.
 *
 * The storage layer is mocked so no database is required.
 *
 * Acceptance criteria:
 *  1. DELETE returns 200 with { success: true } for the document owner.
 *  2. deleteProjectDocument is called with the correct document ID + user ID.
 *  3. DELETE returns 404 when the document is not found / not owned.
 *  4. deleteProjectDocument is NOT called when the ownership guard rejects.
 *  5. GET /messages returns 404 after the document is deleted.
 */
import { vi, describe, it, expect, beforeAll, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import type { Express } from "express";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID      = "user-owner";
const ROUTE_DOC_ID = 77;

const makeDocument = () => ({
  id: ROUTE_DOC_ID,
  name: "Rancangan Kontrak.pdf",
  originalFilename: "Rancangan Kontrak.pdf",
  mimeType: "application/pdf",
  fileSize: 204800,
  userId: USER_ID,
  contentText: "isi dokumen rahasia",
  summaryText: null,
  createdAt: new Date("2026-07-15T08:00:00Z"),
  updatedAt: new Date("2026-07-15T08:00:00Z"),
});

// ── Mutable per-test state ────────────────────────────────────────────────────

let currentUserId = USER_ID;
// null → document not found (already deleted or wrong owner)
let storedDoc: ReturnType<typeof makeDocument> | null = makeDocument();

// ── Mock spy fns ──────────────────────────────────────────────────────────────

const mockGetProjectDocument    = vi.fn(async () => storedDoc);
const mockDeleteProjectDocument = vi.fn(async (_id: number, _userId: string) => {
  if (!storedDoc) return false;
  storedDoc = null; // simulate transactional removal of doc + messages
  return true;
});
const mockGetDocumentChatMessages = vi.fn(async () => []);

// ── Mock: storage module ──────────────────────────────────────────────────────

vi.mock("./storage", () => ({
  storage: {
    // Seed / startup methods
    getHeroContent:            vi.fn().mockResolvedValue({ id: 1 }),
    getModules:                vi.fn().mockResolvedValue([{}]),
    getUserRoles:              vi.fn().mockResolvedValue([{}]),
    getBenefits:               vi.fn().mockResolvedValue([{}]),
    getCtaContent:             vi.fn().mockResolvedValue({ id: 1 }),
    updateHeroBackgroundImage: vi.fn().mockResolvedValue(undefined),
    // Routes under test
    getProjectDocument:         mockGetProjectDocument,
    deleteProjectDocument:      mockDeleteProjectDocument,
    getDocumentChatMessages:    mockGetDocumentChatMessages,
    // Safe stubs for other storage methods routes.ts may call
    getProjectDocumentsByUser:   vi.fn().mockResolvedValue([]),
    createProjectDocument:       vi.fn().mockResolvedValue(makeDocument()),
    updateProjectDocumentName:   vi.fn().mockResolvedValue(makeDocument()),
    clearDocumentChatMessages:   vi.fn().mockResolvedValue(undefined),
    pruneDocumentChatMessages:   vi.fn().mockResolvedValue(undefined),
    createDocumentChatMessage:   vi.fn().mockResolvedValue({}),
    getDocumentChatMessageCount: vi.fn().mockResolvedValue(0),
  },
}));

// ── Mock: auth middleware ─────────────────────────────────────────────────────

vi.mock("./replit_integrations/auth", () => ({
  isAuthenticated: (req: any, _res: any, next: () => void) => {
    req.user = { claims: { sub: currentUserId } };
    next();
  },
  setupAuth:          vi.fn(),
  getSession:         vi.fn(),
  authStorage:        {},
  registerAuthRoutes: vi.fn(),
}));

// ── Mock: db (silence drizzle / pg imports inside routes.ts) ──────────────────

vi.mock("./db", () => ({
  db:   {},
  pool: { end: vi.fn() },
}));

// ── Build app once ────────────────────────────────────────────────────────────

let app: Express;

beforeAll(async () => {
  const { createServer } = await import("http");
  const { registerRoutes } = await import("./routes");
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
});

afterEach(() => {
  storedDoc     = makeDocument();
  currentUserId = USER_ID;
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────

describe("DELETE /api/ai-dokumen/documents/:id", () => {
  it("returns 200 with success:true when the document belongs to the caller", async () => {
    const res = await request(app)
      .delete(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("calls deleteProjectDocument with the correct document ID and user ID", async () => {
    await request(app).delete(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}`);

    expect(mockDeleteProjectDocument).toHaveBeenCalledTimes(1);
    expect(mockDeleteProjectDocument).toHaveBeenCalledWith(ROUTE_DOC_ID, USER_ID);
  });

  it("returns 404 when the document is not found or not owned by the caller", async () => {
    storedDoc = null;
    const res = await request(app)
      .delete(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}`);
    expect(res.status).toBe(404);
  });

  it("does not call deleteProjectDocument when the ownership guard returns null", async () => {
    storedDoc = null;
    await request(app).delete(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}`);
    expect(mockDeleteProjectDocument).not.toHaveBeenCalled();
  });

  it("GET /messages returns 404 after the document is deleted", async () => {
    // Delete the document — sets storedDoc to null
    const deleteRes = await request(app)
      .delete(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}`);
    expect(deleteRes.status).toBe(200);

    // storedDoc is now null → ownership guard in GET /messages rejects
    const msgRes = await request(app)
      .get(`/api/ai-dokumen/documents/${ROUTE_DOC_ID}/messages`);
    expect(msgRes.status).toBe(404);
  });
});
