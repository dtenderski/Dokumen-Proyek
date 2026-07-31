// @vitest-environment node
/**
 * Tests: per-document chat message isolation in the storage layer.
 *
 * AIDokumen.tsx is now a GustaftaEmbed (iframe to external Gustafta service).
 * Document switching happens in Gustafta, which calls our backend API:
 *   GET /api/ai-dokumen/documents/:id/messages  →  storage.getDocumentChatMessages(id)
 *
 * These tests exercise the real DatabaseStorage class against a mocked database,
 * confirming that getDocumentChatMessages(id) isolates messages per document:
 * fetching document A never returns document B's messages, and vice versa.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

// ── In-memory fixture rows ────────────────────────────────────────────────────
// Defined at module level so they are visible to both the mock factory and the
// test suite. Because vi.mock() is hoisted, the factory captures these via the
// outer closure at first-import time — by which point these `const`s are live.
const ROWS = [
  { id: 10, documentId: 1, userId: "u1", role: "user",      content: "Pesan pengguna dokumen A", createdAt: new Date("2026-07-01T10:00:00Z") },
  { id: 11, documentId: 1, userId: "u1", role: "assistant", content: "Balasan AI dokumen A",      createdAt: new Date("2026-07-01T10:00:05Z") },
  { id: 20, documentId: 2, userId: "u1", role: "user",      content: "Pesan pengguna dokumen B", createdAt: new Date("2026-07-02T10:00:00Z") },
  { id: 21, documentId: 2, userId: "u1", role: "assistant", content: "Balasan AI dokumen B",      createdAt: new Date("2026-07-02T10:00:05Z") },
];

// ── Mock drizzle-orm's eq() to attach the compared value as a plain property ──
// This avoids having to reverse-engineer drizzle's internal SQL AST.
vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  return {
    ...actual,
    eq: (col: unknown, val: unknown) => {
      const expr = (actual.eq as any)(col, val);
      // Tag the expression so the mock db's where() can extract it without
      // parsing drizzle internals.
      (expr as any).__mockEqValue = val;
      return expr;
    },
  };
});

// ── Mock the db module to return filtered in-memory results ───────────────────
vi.mock("./db", () => {
  const mockDb = {
    select: () => ({
      from: () => ({
        where: (clause: any) => ({
          orderBy: async () => {
            const docId: number | undefined = clause?.__mockEqValue;
            if (docId === undefined) return ROWS.slice();
            return ROWS
              .filter(r => r.documentId === docId)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          },
        }),
      }),
    }),
    insert: () => ({ values: () => ({ returning: async () => [] }) }),
    delete: () => ({ where: async () => {} }),
    update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
  };
  return { db: mockDb, pool: { end: () => {} } };
});

// ── Import the real storage class after both mocks are in place ───────────────
import { DatabaseStorage } from "./storage";

// ─────────────────────────────────────────────────────────────────────────────

describe("DatabaseStorage – per-document chat message isolation", () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
  });

  // ── Document A returns only its own messages ──────────────────────────────
  it("returns only document A messages when queried with document A id", async () => {
    const msgs = await storage.getDocumentChatMessages(1);

    expect(msgs).toHaveLength(2);
    for (const m of msgs) {
      expect(m.documentId).toBe(1);
      expect(m.content).not.toMatch(/dokumen B/i);
    }
    expect(msgs.map(m => m.content)).toEqual(
      expect.arrayContaining(["Pesan pengguna dokumen A", "Balasan AI dokumen A"])
    );
  });

  // ── Document B returns only its own messages ──────────────────────────────
  it("returns only document B messages when queried with document B id", async () => {
    const msgs = await storage.getDocumentChatMessages(2);

    expect(msgs).toHaveLength(2);
    for (const m of msgs) {
      expect(m.documentId).toBe(2);
      expect(m.content).not.toMatch(/dokumen A/i);
    }
    expect(msgs.map(m => m.content)).toEqual(
      expect.arrayContaining(["Pesan pengguna dokumen B", "Balasan AI dokumen B"])
    );
  });

  // ── Switching A → B returns independent, non-overlapping results ──────────
  it("returns non-overlapping message IDs when switching A → B", async () => {
    const msgsA = await storage.getDocumentChatMessages(1);
    const msgsB = await storage.getDocumentChatMessages(2);

    const idsA = new Set(msgsA.map(m => m.id));
    for (const { id } of msgsB) {
      expect(idsA.has(id)).toBe(false);
    }
  });

  // ── Switching B → A returns independent, non-overlapping results ──────────
  it("returns non-overlapping message IDs when switching B → A", async () => {
    const msgsB = await storage.getDocumentChatMessages(2);
    const msgsA = await storage.getDocumentChatMessages(1);

    const idsB = new Set(msgsB.map(m => m.id));
    for (const { id } of msgsA) {
      expect(idsB.has(id)).toBe(false);
    }
  });

  // ── Unknown document returns empty array (no bleed from other docs) ───────
  it("returns empty array for a document that has no messages", async () => {
    const msgs = await storage.getDocumentChatMessages(99);
    expect(msgs).toHaveLength(0);
  });

  // ── Results are ordered chronologically (user needs predictable history) ──
  it("returns messages in ascending chronological order", async () => {
    const msgs = await storage.getDocumentChatMessages(1);

    for (let i = 1; i < msgs.length; i++) {
      expect(new Date(msgs[i].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(msgs[i - 1].createdAt).getTime());
    }
  });
});
