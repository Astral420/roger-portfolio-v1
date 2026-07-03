import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ConnectionStatus, RemoteCursor } from "../types";

const GUEST_NUMBER_KEY = "roger-portfolio-guest-number";
const GUEST_ID_KEY = "roger-portfolio-guest-id";
const GUEST_NAME_KEY = "roger-portfolio-guest-name";

const CURSOR_COLORS = [
  "#6366F1",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#EF4444",
];

/** Presence server URL, e.g. wss://presence.rogerdy.dev — see backend/BACKEND.md. */
const PRESENCE_WS_URL = import.meta.env.VITE_PRESENCE_WS_URL as
  string | undefined;

// Throttle outgoing cursor broadcasts so we don't flood the socket.
const CURSOR_BROADCAST_MS = 50;
const REMOTE_CURSOR_TIMEOUT_MS = 12_000;

function randomGuestNumber() {
  return 1000 + Math.floor(Math.random() * 9000);
}

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function colorForGuest(guestNumber: number) {
  return CURSOR_COLORS[guestNumber % CURSOR_COLORS.length];
}

function readOrCreateIdentity() {
  if (typeof window === "undefined") {
    return { id: randomId(), guestNumber: randomGuestNumber(), name: "" };
  }

  let id = window.localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(GUEST_ID_KEY, id);
  }

  let guestNumber = Number(window.localStorage.getItem(GUEST_NUMBER_KEY));
  if (!guestNumber || Number.isNaN(guestNumber)) {
    guestNumber = randomGuestNumber();
    window.localStorage.setItem(GUEST_NUMBER_KEY, String(guestNumber));
  }

  const name = window.localStorage.getItem(GUEST_NAME_KEY) ?? "";

  return { id, guestNumber, name };
}

interface PresenceContextValue {
  guestId: string;
  guestNumber: number;
  /** Display name — defaults to `Guest-####` until the visitor renames themself. */
  name: string;
  setName: (name: string) => void;
  color: string;
  /** Total visitors currently on the site, including yourself. */
  activeUsers: number;
  remoteCursors: RemoteCursor[];
  connectionStatus: ConnectionStatus;
  reportCursor: (nx: number, ny: number) => void;
}

const PresenceContext = createContext<PresenceContextValue | undefined>(
  undefined,
);

export function PresenceProvider({ children }: { children: ReactNode }) {
  const identityRef = useRef(readOrCreateIdentity());
  const [guestNumber] = useState(identityRef.current.guestNumber);
  const [guestId] = useState(identityRef.current.id);
  const [name, setNameState] = useState(
    identityRef.current.name || `Guest-${guestNumber}`,
  );
  const [activeUsers, setActiveUsers] = useState(1);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    PRESENCE_WS_URL ? "connecting" : "offline",
  );

  const socketRef = useRef<WebSocket | null>(null);
  const lastSentRef = useRef(0);
  const color = useMemo(() => colorForGuest(guestNumber), [guestNumber]);

  // Connect to the presence backend when one is configured. With no backend
  // (e.g. local dev, or before it's deployed) we stay fully functional in a
  // solo/offline mode: you're always "1 active user" and see no remote cursors.
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
        socket.send(
          JSON.stringify({
            type: "join",
            id: guestId,
            guestNumber,
            name,
            color,
          }),
        );
      });

      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "presence-sync") {
            setActiveUsers(payload.activeUsers ?? 1);
            setRemoteCursors(
              (payload.cursors ?? []).filter(
                (c: RemoteCursor) => c.id !== guestId,
              ),
            );
          } else if (payload.type === "cursor-move") {
            const cursor: RemoteCursor = payload.cursor;
            if (cursor.id === guestId) return;
            setRemoteCursors((prev) => {
              const next = prev.filter((c) => c.id !== cursor.id);
              next.push(cursor);
              return next;
            });
          } else if (payload.type === "user-left") {
            setRemoteCursors((prev) => prev.filter((c) => c.id !== payload.id));
            if (typeof payload.activeUsers === "number")
              setActiveUsers(payload.activeUsers);
          } else if (payload.type === "active-users") {
            setActiveUsers(payload.count ?? 1);
          }
        } catch {
          // Ignore malformed frames rather than crashing the UI.
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestId]);

  // Drop remote cursors that stop reporting in (tab closed without a clean close frame).
  useEffect(() => {
    if (!PRESENCE_WS_URL) return;
    const interval = window.setInterval(() => {
      const cutoff = Date.now() - REMOTE_CURSOR_TIMEOUT_MS;
      setRemoteCursors((prev) => prev.filter((c) => c.updatedAt >= cutoff));
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const setName = useCallback(
    (nextName: string) => {
      const trimmed = nextName.trim().slice(0, 24);
      if (!trimmed) return;
      setNameState(trimmed);
      window.localStorage.setItem(GUEST_NAME_KEY, trimmed);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({ type: "rename", id: guestId, name: trimmed }),
        );
      }
    },
    [guestId],
  );

  const reportCursor = useCallback(
    (nx: number, ny: number) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      const now = Date.now();
      if (now - lastSentRef.current < CURSOR_BROADCAST_MS) return;
      lastSentRef.current = now;

      socket.send(
        JSON.stringify({
          type: "cursor-move",
          cursor: {
            id: guestId,
            name,
            guestNumber,
            color,
            x: nx,
            y: ny,
            updatedAt: now,
          },
        }),
      );
    },
    [guestId, name, guestNumber, color],
  );

  const value = useMemo<PresenceContextValue>(
    () => ({
      guestId,
      guestNumber,
      name,
      setName,
      color,
      activeUsers,
      remoteCursors,
      connectionStatus,
      reportCursor,
    }),
    [
      guestId,
      guestNumber,
      name,
      setName,
      color,
      activeUsers,
      remoteCursors,
      connectionStatus,
      reportCursor,
    ],
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx)
    throw new Error("usePresence must be used within a PresenceProvider");
  return ctx;
}
