import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Pencil, Users, Wifi, WifiOff, X } from "lucide-react";
import { useChat } from "../../contexts/ChatContext";
import { usePresence } from "../../contexts/PresenceContext";
import { IoTGrid } from "./IoTGrid";

const easing = [0.22, 1, 0.36, 1] as const;

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge() {
  const { connectionStatus } = useChat();

  if (connectionStatus === "connecting") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-tertiary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Connecting…
      </span>
    );
  }

  if (connectionStatus === "online") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-tertiary">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Online
        <Wifi size={12} className="text-tertiary" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-tertiary">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
      Offline
      <WifiOff size={12} className="text-tertiary" />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-primary/[0.04] px-3.5 py-2.5 w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-tertiary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/** Guest identity row: shows who you're chatting as, with an inline rename control. */
function IdentityBar() {
  const { name, setName, guestNumber, activeUsers } = usePresence();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    setName(draftName || name);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/8 bg-primary/[0.015] px-4 py-2">
      <span className="flex items-center gap-1.5 text-[11px] text-tertiary">
        <Users size={12} strokeWidth={1.75} />
        {activeUsers} {activeUsers === 1 ? "visitor" : "visitors"} online
      </span>

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={save}
            maxLength={24}
            aria-label="Your display name"
            className="w-28 rounded-full border border-border/15 bg-transparent px-2.5 py-1 text-[11px] text-primary focus:outline-none"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraftName(name);
            setEditing(true);
          }}
          className="flex items-center gap-1 text-[11px] text-tertiary transition-colors hover:text-primary"
        >
          You're{" "}
          <span className="font-medium text-secondary">
            {name}
            <span className="text-tertiary"> #{guestNumber}</span>
          </span>
          <Pencil size={10} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

export function ChatPlayground() {
  const { isOpen, close, messages, sendMessage, isTyping, connectionStatus } =
    useChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The page stays scrollable while the chat is open (no body-scroll lock —
  // that used to hide the scrollbar and shift centered content sideways).
  // Instead, an attempt to scroll the page dismisses the panel, same as
  // clicking outside it. Internal scrolling of the message list doesn't
  // bubble a window `scroll` event, so it's unaffected.
  useEffect(() => {
    if (!isOpen) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 200);

    const handleWindowScroll = () => {
      if (armed) close();
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [isOpen, close]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Chat playground"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: easing }}
            style={{ transformOrigin: "top right" }}
            className="fixed inset-x-3 bottom-3 top-16 z-[71] flex flex-col overflow-hidden rounded-2xl border border-border/10 bg-bg-overlay shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:h-auto sm:max-h-[min(600px,calc(100vh-6rem))] sm:w-[380px] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/8 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Chat Playground
                </p>
                <StatusBadge />
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:text-primary"
              >
                <X size={16} />
              </button>
            </div>

            <div className="shrink-0">
              <IdentityBar />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
            >
              {messages.map((msg) => {
                if (msg.author === "system") {
                  return (
                    <p
                      key={msg.id}
                      className="text-center text-[11px] text-tertiary"
                    >
                      {msg.text}
                    </p>
                  );
                }

                const isVisitor = msg.author === "visitor";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isVisitor ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        isVisitor
                          ? "rounded-br-sm bg-accent-gradient text-white"
                          : "rounded-bl-sm bg-primary/[0.04] text-primary"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[10px] text-tertiary">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })}

              {isTyping && <TypingIndicator />}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border/8 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-border/10 bg-primary/[0.02] p-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type a message…"
                  aria-label="Message"
                  disabled={connectionStatus !== "online"}
                  className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-primary placeholder:text-tertiary focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || connectionStatus !== "online"}
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white transition-opacity disabled:opacity-30"
                >
                  <CornerDownLeft size={14} />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-tertiary">
                Enter to send · Shift+Enter for a new line
              </p>
            </div>

            <div className="shrink-0">
              <IoTGrid />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
