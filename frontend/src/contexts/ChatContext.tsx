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
import type { ChatMessage, ConnectionStatus } from "../types";
import { useSocket } from "./SocketContext";
import { usePresence } from "./PresenceContext";

/** If no `typing`/`stopped-typing` refresh arrives within this window, assume they stopped. */
const TYPING_TIMEOUT_MS = 4_000;

let messageId = 0;
const nextLocalId = () => `local-${Date.now()}-${messageId++}`;

function randomMessageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : nextLocalId();
}

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  /** Call while the visitor is actively composing, throttled by the caller. */
  notifyTyping: () => void;
  /** Call on send/blur/clear to immediately signal typing has stopped. */
  notifyStoppedTyping: () => void;
  /** True when at least one other visitor is currently typing. */
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingGuestIds, setTypingGuestIds] = useState<Set<string>>(
    () => new Set(),
  );

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const { connectionStatus, send, subscribe } = useSocket();
  const { guestId } = usePresence();

  const announcedConnectedRef = useRef(false);
  const typingTimeoutsRef = useRef(new Map<string, number>());

  // Announce the live connection once per successful handshake.
  useEffect(() => {
    if (connectionStatus === "online" && !announcedConnectedRef.current) {
      announcedConnectedRef.current = true;
      setMessages((prev) => [
        ...prev,
        {
          id: nextLocalId(),
          author: "system",
          text: "Connected. You're chatting live with other visitors on the site.",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [connectionStatus]);

  useEffect(() => {
    const clearTypingFor = (id: string) => {
      window.clearTimeout(typingTimeoutsRef.current.get(id));
      typingTimeoutsRef.current.delete(id);
      setTypingGuestIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    const unsubscribeChat = subscribe("chat-message", (payload) => {
      const incoming = payload.message as
        | {
            id: string;
            guestId: string;
            name: string;
            text: string;
            timestamp: number;
          }
        | undefined;
      if (!incoming) return;

      const isSelf = incoming.guestId === guestId;

      setMessages((prev) => [
        ...prev,
        {
          id: incoming.id,
          author: isSelf ? "visitor" : "guest",
          name: isSelf ? undefined : incoming.name,
          text: incoming.text,
          timestamp: incoming.timestamp,
        },
      ]);

      if (!isSelf) {
        clearTypingFor(incoming.guestId);
        if (!isOpenRef.current) setUnreadCount((count) => count + 1);
      }
    });

    const unsubscribeTyping = subscribe("typing", (payload) => {
      const id = payload.id as string | undefined;
      if (!id || id === guestId) return;

      setTypingGuestIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      window.clearTimeout(typingTimeoutsRef.current.get(id));
      typingTimeoutsRef.current.set(
        id,
        window.setTimeout(() => clearTypingFor(id), TYPING_TIMEOUT_MS),
      );
    });

    const unsubscribeStoppedTyping = subscribe("stopped-typing", (payload) => {
      const id = payload.id as string | undefined;
      if (!id || id === guestId) return;
      clearTypingFor(id);
    });

    return () => {
      unsubscribeChat();
      unsubscribeTyping();
      unsubscribeStoppedTyping();
      typingTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      typingTimeoutsRef.current.clear();
    };
  }, [subscribe, guestId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      send({ type: "chat-message", id: randomMessageId(), text: trimmed });
    },
    [send],
  );

  const notifyTyping = useCallback(() => {
    send({ type: "typing" });
  }, [send]);

  const notifyStoppedTyping = useCallback(() => {
    send({ type: "stopped-typing" });
  }, [send]);

  const open = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      messages,
      sendMessage,
      notifyTyping,
      notifyStoppedTyping,
      isTyping: typingGuestIds.size > 0,
      connectionStatus,
      unreadCount,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      messages,
      sendMessage,
      notifyTyping,
      notifyStoppedTyping,
      typingGuestIds,
      connectionStatus,
      unreadCount,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
