import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import { getNowPlaying } from "../../lib/spotify";
import type { SpotifyTrack } from "../../types";

const BARS = [0, 1, 2, 3];

/** Scroll distance (px) after which the SpotifyBar fades away. */
const HIDE_SCROLL_THRESHOLD = 24;
const NOW_PLAYING_POLL_MS = 5_000;

const FALLBACK_TRACK: SpotifyTrack = {
  song: "Not playing",
  artist: "Spotify",
  isPlaying: false,
};

/**
 * "Currently Listening" strip, docked directly beneath the navbar.
 * Only visible at the top of the page; fades away once the user scrolls down.
 */
export function SpotifyBar() {
  const { scrollY } = useScroll();
  const [atTop, setAtTop] = useState(true);
  const [track, setTrack] = useState<SpotifyTrack>(FALLBACK_TRACK);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setAtTop(latest < HIDE_SCROLL_THRESHOLD);
  });

  useEffect(() => {
    let cancelled = false;

    const loadNowPlaying = async () => {
      try {
        const nowPlayingTrack = await getNowPlaying();
        if (!cancelled) {
          setTrack(nowPlayingTrack);
        }
      } catch {
        if (!cancelled) {
          setTrack((prevTrack) => prevTrack ?? FALLBACK_TRACK);
        }
      }
    };

    const handleWindowFocus = () => {
      void loadNowPlaying();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadNowPlaying();
      }
    };

    void loadNowPlaying();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNowPlaying();
      }
    }, NOW_PLAYING_POLL_MS);

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <motion.div
      className="mx-auto mt-2 flex w-full max-w-content justify-center px-4"
      animate={{
        opacity: atTop ? 1 : 0,
        y: atTop ? 0 : -8,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{ pointerEvents: atTop ? "auto" : "none" }}
    >
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
          {track.isPlaying ? (
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
            <span className="text-primary font-medium">{track.song}</span>
            <span className="text-tertiary"> — </span>
            <span>{track.artist}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
