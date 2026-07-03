import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Menu, Star, Users, X } from "lucide-react";
import { navLinks, siteConfig } from "../../data/site";
import { scrollToSection } from "../../lib/scrollTo";
import { useActiveSection } from "../../hooks/useActiveSection";
import { useChat } from "../../contexts/ChatContext";
import { usePresence } from "../../contexts/PresenceContext";
import { useGithubStars } from "../../hooks/useGithubStars";
import { ThemeToggle } from "../ui/ThemeToggle";

const SECTION_IDS = navLinks.map((l) => l.id);

function GithubStarButton() {
  const stars = useGithubStars(siteConfig.githubRepo);

  return (
    <a
      href={`https://github.com/${siteConfig.githubRepo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={
        stars !== null
          ? `Star this portfolio on GitHub, ${stars} stars so far`
          : "Star this portfolio on GitHub"
      }
      className="flex h-9 items-center gap-1.5 rounded-full border border-border/10 px-3 text-xs text-secondary transition-colors duration-300 ease-premium hover:text-primary hover:border-border/25"
    >
      <Star size={13} strokeWidth={1.75} />
      {stars !== null ? stars.toLocaleString() : "—"}
    </a>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);
  const { toggle: toggleChat, unreadCount, isOpen: chatOpen } = useChat();
  const { activeUsers } = usePresence();

  const handleNavigate = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <div className="relative flex w-full justify-center">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Primary"
        className="flex w-full max-w-content items-center justify-between rounded-full bg-bg-overlay/70 px-3 py-2 backdrop-blur-xl shadow-lg shadow-black/5 dark:bg-transparent dark:backdrop-blur-none dark:shadow-none"
      >
        <button
          type="button"
          onClick={() => handleNavigate("hero")}
          className="rounded-full px-3 py-1.5 text-sm font-medium tracking-tight text-primary"
        >
          {siteConfig.name}
          <span className="text-accent-from">.</span>
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeId === link.id;
            return (
              <li key={link.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleNavigate(link.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative rounded-full px-4 py-1.5 text-sm transition-colors duration-300 ease-premium ${
                    isActive
                      ? "text-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-primary/[0.06] border border-border/8"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Utilities */}
        <div className="flex items-center gap-1.5">
          <span
            className="hidden items-center gap-1.5 rounded-full border border-border/10 px-3 py-1.5 text-xs text-secondary sm:flex"
            title="Visitors currently on this site"
          >
            <Users size={13} strokeWidth={1.75} />
            {activeUsers}
          </span>

          <GithubStarButton />

          <button
            type="button"
            onClick={toggleChat}
            aria-label={
              unreadCount > 0
                ? `Open chat playground, ${unreadCount} unread`
                : "Open chat playground"
            }
            aria-expanded={chatOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/10 text-secondary transition-colors duration-300 ease-premium hover:text-primary hover:border-border/25"
          >
            <MessageSquare size={16} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-from px-1 text-[10px] font-medium text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/10 text-secondary md:hidden"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[68px] w-[calc(100%-2rem)] max-w-content rounded-2xl border border-border/8 bg-bg-overlay/95 backdrop-blur-xl p-2 md:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(link.id)}
                    aria-current={activeId === link.id ? "true" : undefined}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors duration-300 ${
                      activeId === link.id
                        ? "text-primary bg-primary/[0.06]"
                        : "text-secondary"
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
