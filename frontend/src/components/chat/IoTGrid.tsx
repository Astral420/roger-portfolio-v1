import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";

// A small curated preview instead of a full 25-swatch grid — this is a
// "coming soon" teaser, not a real control surface yet.
const PREVIEW_COLORS = [
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#0EA5E9",
  "#6366F1",
  "#EC4899",
];

export function IoTGrid() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-border/8">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
          <Lightbulb size={12} strokeWidth={1.75} />
          WLED lighting
          <span className="rounded-full border border-border/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-tertiary">
            Soon
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-tertiary transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 px-4 pb-3">
              <div
                className="flex shrink-0 items-center gap-1.5"
                role="group"
                aria-label="Future IoT lighting color preview, not yet enabled"
              >
                {PREVIEW_COLORS.map((color) => (
                  <span
                    key={color}
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full opacity-50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-tertiary">
                Pick a color here and it'll push live to my room lights over
                WebSocket.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
