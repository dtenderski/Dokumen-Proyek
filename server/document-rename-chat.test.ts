// @vitest-environment node
/**
 * Route integration tests: document chat history survives a document rename.
 *
 * Exercises the real Express route handlers:
 *   PATCH /api/ai-dokumen/documents/:id/name
 *   GET   /api/ai-dokumen/documents/:id/messages
 *
 * The storage layer is mocked so no database is required.
 *
 * Acceptance criteria:
 *  1. PATCH /name calls updateProjectDocumentName and returns the updated doc
 *     (name changed, id unchanged).
 *  2. GET /messages calls getDocumentChatMessages with the document ID — not
 *     the document name — and returns the chat history unchanged.
 *  3. After a rename, a subsequent GET /messages returns identical messages to
 *     those returned before the rename.
 *  4. PATCH /name with an empty body field returns 400 (bad request).
 *  5. PATCH /name for a document the caller does not own returns 404.
 */
import { vi, describe, it, expect, beforeAll, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import type { Express } from "express";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = "user-owner";
const DOC_ID = 42;

const makeDocument = (name: string) => ({
  id: DOC_ID,
  name,
  originalFilename: "spesifikasi.pdf",
  mimeType: "application/pdf",
  fileSize: 102400,
  userId: USER_ID,
  contentText: "isi dokumen rahasia",
  summaryText: null,
  createdAt: new Date("2026-07-01T08:00:00Z"),
  updatedAt: new Date("2026-07-01T08:00:00Z"),
});

const MESSAGES = [
  {
    id: 1,
    documentId: DOC_ID,
    userId: USER_ID,
    role: "user",
    content: "Apa isi dokumen ini?",
    createdAt: new Date("2026-07-01T09:00:00Z"),
  },
  {
    id: 2,
    documentId: DOC_ID,
    userId: USER_ID,
    role: "assistant",
    content: "Dokumen ini berisi spesifikasi teknis.",
    createdAt: new Date("2026-07-01T09:00:05Z"),
  },
];

// ── Mutable state: per-test overrides ────────────────────────────────────────

let currentUserId = USER_ID;
// null → document not found (simulate wrong owner / unknown id)
let storedDoc: ReturnType<typeof makeDocument> | null = makeDocument("Nama Awal");

// ── Mock: storage module ──────────────────────────────────────────────────────

const mockGetProjectDocument = vi.fn(async (_id: number, _userId: string) => storedDoc);
const mockUpdateProjectDocumentName = vi.fn(async (id: number, userId: string, name: string) => {
  if (!storedDoc || storedDoc.userId !== userId) return null;
  storedDoc = { ...storedDoc, name };
  return storedDoc;
});
const mockGetDocumentChatMessages = vi.fn(async (_documentId: number) => MESSAGES);

vi.mock("./storage", () => ({
  storage: {
    // ── Seed / startup methods ─────────────────────────────────────────────
    getHeroContent:            vi.fn().mockResolvedValue({ id: 1 }),
    getModules:                vi.fn().mockResolvedValue([{}]),
    getUserRoles:              vi.fn().mockResolvedValue([{}]),
    getBenefits:               vi.fn().mockResolvedValue([{}]),
    getCtaContent:             vi.fn().mockResolvedValue({ id: 1 }),
    updateHeroBackgroundImage: vi.fn().mockResolvedValue(undefined),
    // ── Routes under test ─────────────────────────────────────────────────
    getProjectDocument:         mockGetProjectDocument,
    updateProjectDocumentName:  mockUpdateProjectDocumentName,
    getDocumentChatMessages:    mockGetDocumentChatMessages,
    // ── Other storage methods routes.ts may call (safe stubs) ─────────────
    getProjectDocumentsByUser:  vi.fn().mockResolvedValue([]),
    createProjectDocument:      vi.fn().mockResolvedValue(makeDocument("Baru")),
    deleteProjectDocument:      vi.fn().mockResolvedValue(undefined),
    clearDocumentChatMessages:  vi.fn().mockResolvedValue(undefined),
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

// ── Mock: db (silence drizzle / pg imports inside routes.ts) ─────────────────

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
  // Reset document to original state and clear call counts
  storedDoc = makeDocument("Nama Awal");
  currentUserId = USER_ID;
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PATCH /api/ai-dokumen/documents/:id/name", () => {
  it("returns 200 with updated name and the same document ID", async () => {
    const res = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Setelah Rename" });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(DOC_ID);
    expect(res.body.name).toBe("Nama Setelah Rename");
  });

  it("strips the contentText field from the rename response", async () => {
    const res = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Aman" });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("contentText");
  });

  it("calls updateProjectDocumentName with the document ID, caller ID, and new name", async () => {
    await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Baru" });

    expect(mockUpdateProjectDocumentName).toHaveBeenCalledTimes(1);
    expect(mockUpdateProjectDocumentName).toHaveBeenCalledWith(DOC_ID, USER_ID, "Nama Baru");
  });

  it("returns 400 when the name field is an empty string", async () => {
    const res = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the name field contains only whitespace", async () => {
    const res = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "   " });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the document does not belong to the caller", async () => {
    storedDoc = null; // simulate missing / other-owner document

    const res = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Tak Diizinkan" });

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/ai-dokumen/documents/:id/messages – after rename", () => {
  it("returns 200 with the document's chat messages after a successful rename", async () => {
    // Step 1: rename the document
    const patchRes = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Diganti" });
    expect(patchRes.status).toBe(200);

    // Step 2: fetch messages — must still succeed
    const msgRes = await request(app)
      .get(`/api/ai-dokumen/documents/${DOC_ID}/messages`);

    expect(msgRes.status).toBe(200);
    expect(Array.isArray(msgRes.body)).toBe(true);
    expect(msgRes.body).toHaveLength(MESSAGES.length);
  });

  it("calls getDocumentChatMessages with the numeric document ID, not the document name", async () => {
    // Rename first so the stored name differs from the original
    await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Yang Berubah" });

    vi.clearAllMocks(); // reset call counts — we care only about the GET call below

    await request(app)
      .get(`/api/ai-dokumen/documents/${DOC_ID}/messages`);

    expect(mockGetDocumentChatMessages).toHaveBeenCalledTimes(1);
    // Must be called with the document ID (number), not the name string
    expect(mockGetDocumentChatMessages).toHaveBeenCalledWith(DOC_ID);
    expect(mockGetDocumentChatMessages).not.toHaveBeenCalledWith("Nama Yang Berubah");
  });

  it("returns identical messages before and after a rename", async () => {
    // Fetch before rename
    const beforeRes = await request(app)
      .get(`/api/ai-dokumen/documents/${DOC_ID}/messages`);
    expect(beforeRes.status).toBe(200);

    // Rename
    const patchRes = await request(app)
      .patch(`/api/ai-dokumen/documents/${DOC_ID}/name`)
      .send({ name: "Nama Baru Sama Sekali" });
    expect(patchRes.status).toBe(200);

    // Fetch after rename
    const afterRes = await request(app)
      .get(`/api/ai-dokumen/documents/${DOC_ID}/messages`);
    expect(afterRes.status).toBe(200);

    // Content must be identical — rename does not touch chat history
    expect(afterRes.body).toEqual(beforeRes.body);
  });

  it("returns 404 for messages when the document does not belong to the caller", async () => {
    storedDoc = null;

    const res = await request(app)
      .get(`/api/ai-dokumen/documents/${DOC_ID}/messages`);

    expect(res.status).toBe(404);
  });
});
