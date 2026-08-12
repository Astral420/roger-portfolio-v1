import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Reconnect backoff constants
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_CAP_MS = 30_000;
// Application-level keepalive interval — must be well under any proxy idle timeout
const KEEPALIVE_MS = 20_000;
// Max frames to buffer while reconnecting (bounded to avoid unbounded growth)
const QUEUE_CAP = 20;
import type { ConnectionStatus } from "../types";

/** Presence/chat server URL, e.g. wss://presence.rogerdy.dev — see backend/BACKEND.md. */
const PRESENCE_WS_URL = import.meta.env.VITE_PRESENCE_WS_URL as
  string | undefined;

type SocketMessage = { type: string; [key: string]: unknown };
type MessageHandler = (payload: SocketMessage) => void;

interface SocketContextValue {
  /**
   * `offline` means no `VITE_PRESENCE_WS_URL` is configured — the site runs
   * in a solo/offline fallback with no reconnect attempts. Once configured,
   * status only ever toggles between `connecting` and `online`.
   */
  connectionStatus: ConnectionStatus;
  send: (payload: SocketMessage) => void;
  /** Subscribe to server->client frames of a given `type`. Returns an unsubscribe fn. */
  subscribe: (type: string, handler: MessageHandler) => () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);

/**
 * Owns the single WebSocket connection shared by presence (cursors/identity)
 * and chat. Both `PresenceContext` and `ChatContext` consume this instead of
 * opening their own sockets, since `cursor-move`/`chat-message`/etc. are all
 * frames on the same connection per `BACKEND.md` §4.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    PRESENCE_WS_URL ? "connecting" : "offline",
  );
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(new Map<string, Set<MessageHandler>>());
  /** Frames buffered while the socket is not OPEN; drained on each reconnect. */
  const pendingQueueRef = useRef<SocketMessage[]>([]);

  useEffect(() => {
    if (!PRESENCE_WS_URL) return;

    let cancelled = false;
    let reconnectTimer: number | undefined;
    let keepaliveTimer: number | undefined;
    /** How many consecutive failed attempts — reset to 0 on a successful open. */
    let attempt = 0;

    /** Full-jitter exponential backoff: random(0, min(cap, base * 2^attempt)). */
    function nextDelay(): number {
      const ceiling = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** attempt);
      return Math.random() * ceiling;
    }

    const connect = () => {
      const socket = new WebSocket(PRESENCE_WS_URL);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (cancelled) return;
        attempt = 0;
        setConnectionStatus("online");

        // Drain any frames that were queued while we were reconnecting.
        const queued = pendingQueueRef.current.splice(0);
        for (const msg of queued) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
          }
        }

        // Send an application-level ping on a fixed interval so:
        //   (a) NAT/proxy idle timeouts don't silently kill the TCP connection,
        //   (b) the server's presence TTL is refreshed even when the cursor isn't moving.
        keepaliveTimer = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, KEEPALIVE_MS);
      });

      socket.addEventListener("message", (event) => {
        let payload: SocketMessage;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!payload || typeof payload.type !== "string") return;

        const handlers = handlersRef.current.get(payload.type);
        handlers?.forEach((handler) => handler(payload));
      });

      socket.addEventListener("close", () => {
        window.clearInterval(keepaliveTimer);
        if (cancelled) return;
        setConnectionStatus("connecting");
        const delay = nextDelay();
        attempt++;
        reconnectTimer = window.setTimeout(connect, delay);
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      window.clearInterval(keepaliveTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      connectionStatus,
      send: (payload) => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(payload));
        } else {
          // Buffer the frame so it's delivered once the socket reopens.
          // The cap prevents unbounded growth if the server is down for an extended period.
          if (pendingQueueRef.current.length < QUEUE_CAP) {
            pendingQueueRef.current.push(payload);
          }
        }
      },
      subscribe: (type, handler) => {
        const handlers = handlersRef.current;
        if (!handlers.has(type)) handlers.set(type, new Set());
        handlers.get(type)!.add(handler);
        return () => {
          handlers.get(type)?.delete(handler);
        };
      },
    }),
    [connectionStatus],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
