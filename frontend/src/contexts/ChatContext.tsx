import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ChatMessage, ConnectionStatus } from '../types';

const CANNED_REPLIES = [
  "Thanks for stopping by — this chat runs on a mocked WebSocket layer for the demo.",
  "Good question. In production this would hit a real socket server, but here it's all client-side.",
  "I'm mid-build on a few things right now, but feel free to look around the projects section.",
  "That's on the roadmap! Check the IoT panel below for a preview of what's next.",
];

let messageId = 0;
const nextId = () => `msg-${Date.now()}-${messageId++}`;

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const replyIndexRef = useRef(0);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // Simulate the socket handshake once on mount.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConnectionStatus('online');
      setMessages([
        {
          id: nextId(),
          author: 'system',
          text: 'Connected. This is a mock backend for demo purposes.',
          timestamp: Date.now(),
        },
        {
          id: nextId(),
          author: 'roger',
          text: "Hey! I'm not online right now, but leave a message and I'll get back to you.",
          timestamp: Date.now(),
        },
      ]);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), author: 'visitor', text: trimmed, timestamp: Date.now() },
    ]);

    setIsTyping(true);
    const delay = 900 + Math.random() * 900;

    window.setTimeout(() => {
      setIsTyping(false);
      const reply = CANNED_REPLIES[replyIndexRef.current % CANNED_REPLIES.length];
      replyIndexRef.current += 1;

      setMessages((prev) => [
        ...prev,
        { id: nextId(), author: 'roger', text: reply, timestamp: Date.now() },
      ]);

      if (!isOpenRef.current) {
        setUnreadCount((count) => count + 1);
      }
    }, delay);
  }, []);

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

  return (
    <ChatContext.Provider
      value={{ isOpen, open, close, toggle, messages, sendMessage, isTyping, connectionStatus, unreadCount }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
