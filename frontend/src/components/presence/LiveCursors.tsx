import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresence } from "../../contexts/PresenceContext";
import { useReducedMotionPreference } from "../../hooks/useReducedMotion";

/**
 * Renders every other visitor's live cursor + name tag over the page.
 *
 * Positions are broadcast as normalized (0..1) viewport coordinates so they
 * map sensibly across different screen sizes, then converted back to pixels
 * here. Your own cursor stays the native OS pointer — only remote visitors
 * see it, the same way it only shows theirs to you.
 */
export function LiveCursors() {
  const { remoteCursors, reportCursor } = usePresence();
  const reducedMotion = useReducedMotionPreference();
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const handleMove = (event: PointerEvent) => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        reportCursor(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion, reportCursor]);

  if (reducedMotion || remoteCursors.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <AnimatePresence>
        {remoteCursors.map((cursor) => (
          <motion.div
            key={cursor.id}
            className="absolute will-change-transform"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: cursor.x * window.innerWidth,
              y: cursor.y * window.innerHeight,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.6 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="drop-shadow-sm">
              <path
                d="M2 1.5 15.5 8.2 9.4 9.6 6.7 15.8 2 1.5Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="ml-3 -mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-white shadow-sm"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
