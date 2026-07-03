import { motion } from "framer-motion";
import { nowPlaying } from "../../data/site";

const BARS = [0, 1, 2, 3];

/**
 * Placeholder "Currently Listening" strip, docked directly beneath the navbar.
 * Swap `nowPlaying` in data/site.ts for a live Spotify "now playing" API
 * response when that's wired up.
 */
export function SpotifyBar() {
  return (
    <div className="mx-auto mt-2 flex w-full max-w-content justify-center px-4">
      <div className="flex h-8 items-center gap-2.5 rounded-full bg-bg-overlay/60 px-4 text-xs backdrop-blur-xl shadow-lg shadow-black/5 dark:bg-transparent dark:backdrop-blur-none dark:shadow-none">
        <span className="hidden sm:inline text-tertiary tracking-wide uppercase text-[10px]">
          Currently Listening
        </span>

        <span
          aria-hidden="true"
          className="hidden sm:block h-3 w-px bg-border/15"
        />

        <div
          className="flex items-center gap-2 text-secondary"
          role="status"
          aria-live="off"
        >
          {nowPlaying.isPlaying ? (
            <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
              {BARS.map((i) => (
                <motion.span
                  key={i}
                  className="w-[2px] rounded-full bg-accent-from"
                  animate={{ height: ["30%", "100%", "55%", "85%", "30%"] }}
                  transition={{
                    duration: 1.1 + i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </span>
          ) : (
            <span aria-hidden="true" className="text-tertiary">
              ♪
            </span>
          )}

          <span className="truncate max-w-[180px] sm:max-w-none">
            <span className="text-primary font-medium">{nowPlaying.song}</span>
            <span className="text-tertiary"> — </span>
            <span>{nowPlaying.artist}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
