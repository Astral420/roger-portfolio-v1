import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

  useEffect(() => {
    if (!PRESENCE_WS_URL) return;

    let cancelled = false;
    let reconnectTimer: number | undefined;

    const connect = () => {
      const socket = new WebSocket(PRESENCE_WS_URL);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (cancelled) return;
        setConnectionStatus("online");
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
        if (cancelled) return;
        setConnectionStatus("connecting");
        reconnectTimer = window.setTimeout(connect, 2000);
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    };

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      connectionStatus,
      send: (payload) => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify(payload));
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
