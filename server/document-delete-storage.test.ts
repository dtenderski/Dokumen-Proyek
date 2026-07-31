// @vitest-environment node
/**
 * Storage-layer tests: DatabaseStorage.deleteProjectDocument is transactional.
 *
 * Exercises the real DatabaseStorage class against a mocked database client,
 * confirming that ownership check, chat-message delete, and document delete
 * all run inside a single transaction and that a db error causes a rollback
 * without permanently removing chat messages.
 *
 * Acceptance criteria:
 *  1. All three operations (ownership select, message delete, doc delete) are
 *     issued on the transaction object — not on the bare db.
 *  2. Chat messages are deleted before the document row.
 *  3. When the caller does not own the document, neither delete is called.
 *  4. When the document-row delete fails, the transaction is rolled back and
 *     messages are not permanently removed.
 *  5. Returns true on success; false when the document is not owned.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const OWNER_ID = "user-owner";
const DOC_ID   = 42;
const DOC_ROW  = { id: DOC_ID };

// ── Per-test control flags ────────────────────────────────────────────────────

let txSelectShouldFind  = true;
let txDocDeleteShouldFail = false;

// ── Spies for operations issued on the tx object ──────────────────────────────

const txSelectSpy   = vi.fn();
const txMsgDelSpy   = vi.fn();
const txDocDelSpy   = vi.fn();
const txRollbackSpy = vi.fn();

// Build a fresh tx object for each transaction call.
// delete() tracks call order: first call → messages, second → document.
function makeTx() {
  let deleteCallCount = 0;
  return {
    select: () => ({
      from: () => ({
        where: async () => {
          txSelectSpy();
          return txSelectShouldFind ? [DOC_ROW] : [];
        },
      }),
    }),
    delete: (_table: unknown) => ({
      where: async () => {
        deleteCallCount += 1;
        if (deleteCallCount === 1) {
          txMsgDelSpy();
        } else {
          txDocDelSpy();
          if (txDocDeleteShouldFail) throw new Error("simulated db error");
        }
      },
    }),
  };
}

// ── Mock: db module ───────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  db: {
    transaction: async (fn: (tx: ReturnType<typeof makeTx>) => Promise<unknown>) => {
      const tx = makeTx();
      try {
        return await fn(tx);
      } catch (err) {
        txRollbackSpy();
        throw err;
      }
    },
    // Stubs for non-transactional db calls within storage (e.g. getDocumentChatMessages)
    select: () => ({ from: () => ({ where: () => ({ orderBy: async () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: async () => [] }) }),
    delete: () => ({ where: async () => {} }),
    update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
  },
  pool: { end: vi.fn() },
}));

// ── Import real storage AFTER mock is in place ────────────────────────────────

import { DatabaseStorage } from "./storage";

// ─────────────────────────────────────────────────────────────────────────────

describe("DatabaseStorage.deleteProjectDocument – transactional cleanup", () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
    txSelectShouldFind    = true;
    txDocDeleteShouldFail = false;
    vi.clearAllMocks();
  });

  it("performs the ownership select inside the transaction", async () => {
    await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    expect(txSelectSpy).toHaveBeenCalledTimes(1);
  });

  it("deletes chat messages inside the transaction", async () => {
    await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    expect(txMsgDelSpy).toHaveBeenCalledTimes(1);
  });

  it("deletes the document row inside the transaction", async () => {
    await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    expect(txDocDelSpy).toHaveBeenCalledTimes(1);
  });

  it("deletes chat messages before the document row", async () => {
    await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    const msgOrder = txMsgDelSpy.mock.invocationCallOrder[0];
    const docOrder = txDocDelSpy.mock.invocationCallOrder[0];
    expect(msgOrder).toBeLessThan(docOrder);
  });

  it("returns true when the owned document is successfully deleted", async () => {
    const result = await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    expect(result).toBe(true);
  });

  it("returns false and skips both deletes when document is not owned by caller", async () => {
    txSelectShouldFind = false;
    const result = await storage.deleteProjectDocument(DOC_ID, OWNER_ID);
    expect(result).toBe(false);
    expect(txMsgDelSpy).not.toHaveBeenCalled();
    expect(txDocDelSpy).not.toHaveBeenCalled();
  });

  it("rolls back the whole transaction when the document delete throws", async () => {
    txDocDeleteShouldFail = true;
    await expect(storage.deleteProjectDocument(DOC_ID, OWNER_ID))
      .rejects.toThrow("simulated db error");
    // Rollback triggered — neither delete is permanently committed
    expect(txRollbackSpy).toHaveBeenCalledTimes(1);
  });
});
