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
import { useSocket } from "./SocketContext";

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

  const { connectionStatus, send, subscribe } = useSocket();
  const color = useMemo(() => colorForGuest(guestNumber), [guestNumber]);

  // Keep a ref of the latest name so callbacks (join/cursor-move) sent from
  // effects/timers don't need `name` in their dependency arrays.
  const nameRef = useRef(name);
  nameRef.current = name;

  const lastSentRef = useRef(0);
  const hasJoinedRef = useRef(false);

  // Send `join` once per (re)connect. `connectionStatus` flips to "online"
  // right after the handshake; it never goes "offline" again once configured
  // (only "connecting" <-> "online"), so guard with a ref to avoid re-joining
  // on unrelated re-renders.
  useEffect(() => {
    if (connectionStatus === "online" && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      send({
        type: "join",
        id: guestId,
        guestNumber,
        name: nameRef.current,
        color,
      });
    }
    if (connectionStatus === "connecting") {
      hasJoinedRef.current = false;
    }
  }, [connectionStatus, guestId, guestNumber, color, send]);

  useEffect(() => {
    const unsubscribeSync = subscribe("presence-sync", (payload) => {
      setActiveUsers((payload.activeUsers as number) ?? 1);
      setRemoteCursors(
        ((payload.cursors as RemoteCursor[]) ?? []).filter(
          (cursor) => cursor.id !== guestId,
        ),
      );
    });

    const unsubscribeMove = subscribe("cursor-move", (payload) => {
      const cursor = payload.cursor as RemoteCursor | undefined;
      if (!cursor || cursor.id === guestId) return;
      setRemoteCursors((prev) => {
        const next = prev.filter((c) => c.id !== cursor.id);
        next.push(cursor);
        return next;
      });
    });

    const unsubscribeLeft = subscribe("user-left", (payload) => {
      setRemoteCursors((prev) =>
        prev.filter((cursor) => cursor.id !== payload.id),
      );
      if (typeof payload.activeUsers === "number")
        setActiveUsers(payload.activeUsers);
    });

    const unsubscribeActive = subscribe("active-users", (payload) => {
      setActiveUsers((payload.count as number) ?? 1);
    });

    return () => {
      unsubscribeSync();
      unsubscribeMove();
      unsubscribeLeft();
      unsubscribeActive();
    };
  }, [subscribe, guestId]);

  // Drop remote cursors that stop reporting in (tab closed without a clean close frame).
  useEffect(() => {
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
      send({ type: "rename", id: guestId, name: trimmed });
    },
    [guestId, send],
  );

  const reportCursor = useCallback(
    (nx: number, ny: number) => {
      const now = Date.now();
      if (now - lastSentRef.current < CURSOR_BROADCAST_MS) return;
      lastSentRef.current = now;

      send({
        type: "cursor-move",
        cursor: {
          id: guestId,
          name: nameRef.current,
          guestNumber,
          color,
          x: nx,
          y: ny,
          updatedAt: now,
        },
      });
    },
    [guestId, guestNumber, color, send],
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
