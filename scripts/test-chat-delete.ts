/**
 * Smoke-test: Confirm deleted chat sessions are gone and don't reappear after reload.
 * Runs directly against the database (no HTTP auth needed).
 *
 * Usage: npx tsx scripts/test-chat-delete.ts
 */
import { storage } from "../server/storage";
import { db } from "../server/db";
import { chatSessions, chatMessages } from "../shared/schema";
import { eq } from "drizzle-orm";

const TEST_USER = "test-user-delete-smoke";

async function cleanup() {
  // Remove any leftover test data
  const sessions = await storage.getChatSessionsByUser(TEST_USER);
  for (const s of sessions) {
    await storage.deleteChatSession(s.id);
  }
}

async function run() {
  console.log("=== Chat session delete smoke-test ===\n");

  await cleanup();

  // 1. Create two sessions
  const s1 = await storage.createChatSession({ userId: TEST_USER, title: "Session A" });
  const s2 = await storage.createChatSession({ userId: TEST_USER, title: "Session B" });
  console.log(`Created sessions: ${s1.id} ("Session A"), ${s2.id} ("Session B")`);

  // 2. Add messages to both
  await storage.createChatMessage({ sessionId: s1.id, role: "user", content: "Hello from A" });
  await storage.createChatMessage({ sessionId: s1.id, role: "assistant", content: "Reply from A" });
  await storage.createChatMessage({ sessionId: s2.id, role: "user", content: "Hello from B" });
  console.log("Added messages to both sessions.");

  // 3. Verify both appear in the session list
  const beforeDelete = await storage.getChatSessionsByUser(TEST_USER);
  const ids = beforeDelete.map((s) => s.id);
  console.log(`Sessions before delete: [${ids.join(", ")}]`);
  if (!ids.includes(s1.id) || !ids.includes(s2.id)) {
    throw new Error("FAIL: Both sessions should be present before delete");
  }
  console.log("✓ Both sessions visible before delete.\n");

  // 4. Delete session 1
  await storage.deleteChatSession(s1.id);
  console.log(`Deleted session ${s1.id} ("Session A").`);

  // 5. Simulate page reload: fetch sessions again
  const afterDelete = await storage.getChatSessionsByUser(TEST_USER);
  const idsAfter = afterDelete.map((s) => s.id);
  console.log(`Sessions after delete (reload): [${idsAfter.join(", ")}]`);

  if (idsAfter.includes(s1.id)) {
    throw new Error(`FAIL: Deleted session ${s1.id} still appears after reload!`);
  }
  console.log("✓ Deleted session absent after reload.");

  if (!idsAfter.includes(s2.id)) {
    throw new Error(`FAIL: Surviving session ${s2.id} missing after reload!`);
  }
  console.log("✓ Remaining session still present.");

  // 6. Verify cascade: messages for deleted session must be gone
  const orphanMessages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, s1.id));
  if (orphanMessages.length > 0) {
    throw new Error(
      `FAIL: ${orphanMessages.length} orphaned message(s) remain after cascade delete!`
    );
  }
  console.log("✓ Cascade delete removed messages for deleted session.");

  // 7. Verify getChatSession returns null (simulates /api/chat/sessions/:id → 404)
  const ghost = await storage.getChatSession(s1.id);
  if (ghost !== null) {
    throw new Error(`FAIL: getChatSession(${s1.id}) should return null but got a record!`);
  }
  console.log("✓ getChatSession returns null → endpoint would return 404.\n");

  // 8. Verify messages for surviving session are intact
  const s2Messages = await storage.getChatMessages(s2.id);
  if (s2Messages.length !== 1) {
    throw new Error(
      `FAIL: Session B should have 1 message, found ${s2Messages.length}`
    );
  }
  console.log("✓ Surviving session's messages remain intact.\n");

  // Cleanup
  await cleanup();
  console.log("=== All checks passed. ===");
}

run().catch((err) => {
  console.error("TEST FAILED:", err.message);
  process.exit(1);
});
