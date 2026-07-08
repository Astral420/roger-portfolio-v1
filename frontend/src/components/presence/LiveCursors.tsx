import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresence } from "../../contexts/PresenceContext";
import { useReducedMotionPreference } from "../../hooks/useReducedMotion";

/**
 * Renders every other visitor's live cursor + name tag over the page.
 *
 * Positions are broadcast as normalized (0..1) *document/page* coordinates
 * (not viewport coordinates). That keeps cursors anchored to the same section
 * across visitors even when their local scroll positions differ.
 */
function getDocumentMetrics() {
  const doc = document.documentElement;
  return {
    width: Math.max(doc.scrollWidth, window.innerWidth),
    height: Math.max(doc.scrollHeight, window.innerHeight),
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

export function LiveCursors() {
  const { remoteCursors, reportCursor } = usePresence();
  const reducedMotion = useReducedMotionPreference();
  const frameRef = useRef<number | null>(null);
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { width: 1, height: 1, scrollX: 0, scrollY: 0 }
      : getDocumentMetrics(),
  );

  useEffect(() => {
    if (reducedMotion) return;

    const handleMove = (event: PointerEvent) => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const metrics = getDocumentMetrics();
        reportCursor(event.pageX / metrics.width, event.pageY / metrics.height);
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [reducedMotion, reportCursor]);

  useEffect(() => {
    let rafId: number | null = null;

    const syncViewport = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setViewport(getDocumentMetrics());
      });
    };

    window.addEventListener("scroll", syncViewport, { passive: true });
    window.addEventListener("resize", syncViewport, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  if (reducedMotion || remoteCursors.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
    >
      <AnimatePresence>
        {remoteCursors.map((cursor) => (
          <motion.div
            key={cursor.id}
            className="absolute will-change-transform"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: cursor.x * viewport.width - viewport.scrollX,
              y: cursor.y * viewport.height - viewport.scrollY,
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
              mass: 0.6,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="drop-shadow-sm"
            >
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
