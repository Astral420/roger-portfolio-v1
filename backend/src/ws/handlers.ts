import type { IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocket } from "ws";
import { PresenceStore } from "../features/presence/presence.store";
import { clamp01, sanitizeName } from "../features/presence/presence.service";
import type { RemoteCursor } from "../features/presence/presence.types";
import { sanitizeChatText } from "../features/chat/chat.service";
import type { ChatMessage } from "../features/chat/chat.types";
import { SlidingWindowLimiter } from "../common/lib/rate-limit";
import { broadcast, send } from "./broadcast";

const HEARTBEAT_INTERVAL_MS = 30_000;
const SWEEP_INTERVAL_MS = 10_000;

// Defense-in-depth caps beyond what the frontend already throttles/caps
// client-side — see `BACKEND.md` §7.
const CURSOR_RATE_LIMIT = { max: 40, windowMs: 1_000 };
const CHAT_RATE_LIMIT = { max: 5, windowMs: 5_000 };
const TYPING_RATE_LIMIT = { max: 10, windowMs: 2_000 };

interface ConnectionState {
  guestId?: string;
  isAlive: boolean;
}

interface IncomingFrame {
  type?: unknown;
  [key: string]: unknown;
}

function parseFrame(raw: unknown): IncomingFrame | undefined {
  try {
    const payload = JSON.parse(String(raw));
    if (payload && typeof payload === "object" && typeof payload.type === "string") {
      return payload as IncomingFrame;
    }
  } catch {
    // Ignore malformed frames rather than crashing the connection.
  }
  return undefined;
}

/**
 * Builds the per-server connection handler. Holds all mutable state
 * (presence store, guestId -> socket map, rate limiters) in closures so a
 * single call wires up one isolated socket server instance.
 */
export function createConnectionHandler() {
  const store = new PresenceStore();
  const clients = new Map<string, WebSocket>();
  const connectionStates = new WeakMap<WebSocket, ConnectionState>();
  const cursorLimiter = new SlidingWindowLimiter(CURSOR_RATE_LIMIT.max, CURSOR_RATE_LIMIT.windowMs);
  const chatLimiter = new SlidingWindowLimiter(CHAT_RATE_LIMIT.max, CHAT_RATE_LIMIT.windowMs);
  const typingLimiter = new SlidingWindowLimiter(TYPING_RATE_LIMIT.max, TYPING_RATE_LIMIT.windowMs);

  function toRemoteCursor(id: string, name: string, guestNumber: number, color: string, x: number, y: number): RemoteCursor {
    return { id, name, guestNumber, color, x, y, updatedAt: Date.now() };
  }

  function removeGuest(id: string): void {
    store.remove(id);
    clients.delete(id);
    cursorLimiter.cleanup(id);
    chatLimiter.cleanup(id);
    typingLimiter.cleanup(id);
    broadcast(clients, { type: "user-left", id, activeUsers: store.count() });
  }

  const sweepTimer = setInterval(() => {
    for (const id of store.sweepExpired()) {
      clients.get(id)?.close();
      removeGuest(id);
    }
  }, SWEEP_INTERVAL_MS);
  sweepTimer.unref?.();

  const heartbeatTimer = setInterval(() => {
    for (const [id, ws] of clients) {
      const state = connectionStates.get(ws);
      if (!state) continue;

      if (!state.isAlive) {
        ws.terminate();
        removeGuest(id);
        continue;
      }

      state.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref?.();

  return function handleConnection(ws: WebSocket, _req: IncomingMessage): void {
    const state: ConnectionState = { isAlive: true };
    connectionStates.set(ws, state);

    ws.on("pong", () => {
      state.isAlive = true;
    });

    ws.on("message", (raw) => {
      const frame = parseFrame(raw);
      if (!frame) return;

      switch (frame.type) {
        case "join": {
          const id = typeof frame.id === "string" ? frame.id : undefined;
          const guestNumber = Number(frame.guestNumber);
          if (!id || !Number.isFinite(guestNumber)) return;

          const name = sanitizeName(frame.name, guestNumber);
          const color = typeof frame.color === "string" ? frame.color : "#6366F1";

          state.guestId = id;
          clients.set(id, ws);
          store.join({ id, guestNumber, name, color, x: 0.5, y: 0.5, lastSeen: Date.now() });

          send(ws, {
            type: "presence-sync",
            activeUsers: store.count(),
            cursors: store.list().filter((cursor) => cursor.id !== id),
          });
          broadcast(clients, { type: "active-users", count: store.count() }, id);
          break;
        }

        case "cursor-move": {
          const id = state.guestId;
          if (!id || !cursorLimiter.allow(id)) return;

          const cursor = frame.cursor as { x?: unknown; y?: unknown } | undefined;
          if (!cursor || typeof cursor.x !== "number" || typeof cursor.y !== "number") return;

          const x = clamp01(cursor.x);
          const y = clamp01(cursor.y);
          const updated = store.updateCursor(id, x, y);
          if (!updated) return;

          broadcast(
            clients,
            { type: "cursor-move", cursor: toRemoteCursor(id, updated.name, updated.guestNumber, updated.color, x, y) },
            id,
          );
          break;
        }

        case "rename": {
          const id = state.guestId;
          if (!id) return;

          const name = sanitizeName(frame.name, undefined);
          if (!name) return;

          const updated = store.rename(id, name);
          if (!updated) return;

          broadcast(clients, {
            type: "cursor-move",
            cursor: toRemoteCursor(id, updated.name, updated.guestNumber, updated.color, updated.x, updated.y),
          });
          break;
        }

        case "chat-message": {
          const id = state.guestId;
          if (!id || !chatLimiter.allow(id)) return;

          const record = store.get(id);
          if (!record) return;

          const text = sanitizeChatText(frame.text);
          if (!text) return;

          const message: ChatMessage = {
            id: randomUUID(),
            guestId: id,
            name: record.name,
            text,
            timestamp: Date.now(),
          };
          broadcast(clients, { type: "chat-message", message });
          break;
        }

        case "typing":
        case "stopped-typing": {
          const id = state.guestId;
          if (!id || !typingLimiter.allow(id)) return;

          const record = store.get(id);
          if (!record) return;

          broadcast(clients, { type: frame.type, id, name: record.name }, id);
          break;
        }

        case "ping": {
          if (state.guestId) store.touch(state.guestId);
          break;
        }

        default:
          break;
      }
    });

    ws.on("close", () => {
      if (state.guestId) removeGuest(state.guestId);
    });

    ws.on("error", () => {
      ws.terminate();
    });
  };
}
