/**
 * One-off smoke test for the presence/chat WebSocket server. Not part of the
 * app or CI — run manually with `npx tsx scripts/smoke-test-ws.ts`.
 * Starts the real Express app + WS attach on an ephemeral port, connects two
 * WebSocket clients, exercises join/cursor-move/rename/chat-message/typing,
 * and asserts on the frames each client receives.
 */
import { createApp } from "../src/app";
import { attachPresenceSocket } from "../src/ws/socket-server";
import { WebSocket } from "ws";

function waitForMessage(ws: WebSocket, predicate: (payload: any) => boolean, timeoutMs = 3000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeListener("message", onMessage);
      reject(new Error("Timed out waiting for message: " + predicate.toString()));
    }, timeoutMs);

    function onMessage(raw: Buffer) {
      const payload = JSON.parse(raw.toString());
      if (predicate(payload)) {
        clearTimeout(timer);
        ws.removeListener("message", onMessage);
        resolve(payload);
      }
    }

    ws.on("message", onMessage);
  });
}

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => ws.once("open", () => resolve()));
}

async function main() {
  const app = createApp();
  const server = app.listen(0);
  attachPresenceSocket(server);

  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected AddressInfo");
  const url = `ws://127.0.0.1:${address.port}`;

  let passed = 0;
  const assert = (cond: boolean, message: string) => {
    if (!cond) throw new Error("FAIL: " + message);
    passed++;
    console.log("  ok -", message);
  };

  console.log("Connecting client A + B to", url);
  const a = new WebSocket(url);
  const b = new WebSocket(url);
  await Promise.all([waitForOpen(a), waitForOpen(b)]);

  console.log("Test: join + presence-sync + active-users");
  a.send(JSON.stringify({ type: "join", id: "guest-a", guestNumber: 1111, name: "Alice", color: "#6366F1" }));
  const syncA = await waitForMessage(a, (p) => p.type === "presence-sync");
  assert(syncA.activeUsers === 1, `A sees activeUsers=1 after joining alone (got ${syncA.activeUsers})`);

  const bJoinPromise = waitForMessage(b, (p) => p.type === "presence-sync");
  const aSeesActiveUsersPromise = waitForMessage(a, (p) => p.type === "active-users");
  b.send(JSON.stringify({ type: "join", id: "guest-b", guestNumber: 2222, name: "Bob", color: "#3B82F6" }));
  const syncB = await bJoinPromise;
  assert(syncB.activeUsers === 2, `B sees activeUsers=2 after joining (got ${syncB.activeUsers})`);
  assert(syncB.cursors.length === 1 && syncB.cursors[0].id === "guest-a", "B's presence-sync includes A's cursor");
  const activeUsersA = await aSeesActiveUsersPromise;
  assert(activeUsersA.count === 2, `A gets active-users broadcast with count=2 (got ${activeUsersA.count})`);

  console.log("Test: cursor-move relay");
  const bSeesCursorPromise = waitForMessage(b, (p) => p.type === "cursor-move" && p.cursor.id === "guest-a");
  a.send(JSON.stringify({ type: "cursor-move", cursor: { id: "guest-a", name: "Alice", guestNumber: 1111, color: "#6366F1", x: 0.42, y: 0.73, updatedAt: Date.now() } }));
  const cursorMove = await bSeesCursorPromise;
  assert(cursorMove.cursor.x === 0.42 && cursorMove.cursor.y === 0.73, "B receives A's cursor-move with correct coordinates");

  console.log("Test: cursor-move coordinate clamping");
  const bSeesClampedPromise = waitForMessage(b, (p) => p.type === "cursor-move" && p.cursor.id === "guest-a" && p.cursor.x === 1);
  a.send(JSON.stringify({ type: "cursor-move", cursor: { id: "guest-a", x: 5, y: -3, updatedAt: Date.now() } }));
  const clamped = await bSeesClampedPromise;
  assert(clamped.cursor.x === 1 && clamped.cursor.y === 0, "Out-of-range coordinates get clamped to [0,1]");

  console.log("Test: rename broadcast");
  const bSeesRenamePromise = waitForMessage(b, (p) => p.type === "cursor-move" && p.cursor.id === "guest-a" && p.cursor.name === "Alice2");
  a.send(JSON.stringify({ type: "rename", id: "guest-a", name: "Alice2" }));
  await bSeesRenamePromise;
  assert(true, "B sees A's renamed cursor label");

  console.log("Test: chat-message relay (fans out to sender too)");
  const aSeesChatPromise = waitForMessage(a, (p) => p.type === "chat-message" && p.message.text === "hello from bob");
  const bSeesChatPromise = waitForMessage(b, (p) => p.type === "chat-message" && p.message.text === "hello from bob");
  b.send(JSON.stringify({ type: "chat-message", id: "client-side-id-ignored", text: "hello from bob" }));
  const [chatA, chatB] = await Promise.all([aSeesChatPromise, bSeesChatPromise]);
  assert(chatA.message.guestId === "guest-b" && chatA.message.name === "Bob", "Chat message is stamped with sender's guestId/name");
  assert(chatB.message.id === chatA.message.id, "Both clients receive the same server-assigned message id");

  console.log("Test: chat text sanitization (HTML stripped)");
  const aSeesSanitizedPromise = waitForMessage(a, (p) => p.type === "chat-message" && p.message.guestId === "guest-b" && p.message.text.includes("sanitized"));
  b.send(JSON.stringify({ type: "chat-message", id: "x", text: "<script>alert(1)</script> sanitized text" }));
  const sanitized = await aSeesSanitizedPromise;
  assert(!sanitized.message.text.includes("<script>"), "HTML tags are stripped from chat text");

  console.log("Test: typing relay");
  const aSeesTypingPromise = waitForMessage(a, (p) => p.type === "typing" && p.id === "guest-b");
  b.send(JSON.stringify({ type: "typing" }));
  await aSeesTypingPromise;
  assert(true, "A receives B's typing frame");

  console.log("Test: user-left on disconnect");
  const aSeesLeftPromise = waitForMessage(a, (p) => p.type === "user-left" && p.id === "guest-b");
  b.close();
  const left = await aSeesLeftPromise;
  assert(left.activeUsers === 1, `A sees activeUsers=1 after B leaves (got ${left.activeUsers})`);

  a.close();
  server.close();

  console.log(`\nAll ${passed} assertions passed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
