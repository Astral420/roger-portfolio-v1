import { useEffect, useState } from "react";

const CACHE_PREFIX = "roger-portfolio-gh-stars:";
// GitHub's unauthenticated REST API allows 60 requests/hour per IP — cache
// results so repeat visits (and re-renders) don't burn through that budget.
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CachedStars {
  count: number;
  fetchedAt: number;
}

function readCache(repo: string): CachedStars | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + repo);
    return raw ? (JSON.parse(raw) as CachedStars) : null;
  } catch {
    return null;
  }
}

function writeCache(repo: string, count: number) {
  try {
    window.localStorage.setItem(
      CACHE_PREFIX + repo,
      JSON.stringify({ count, fetchedAt: Date.now() } satisfies CachedStars),
    );
  } catch {
    // Ignore storage errors (private browsing, quota, etc.) — caching is best-effort.
  }
}

/**
 * Fetches a public GitHub repo's star count via the unauthenticated REST API.
 * Returns `null` until the first successful fetch (or cache hit) resolves.
 */
export function useGithubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(() => readCache(repo)?.count ?? null);

  useEffect(() => {
    const cached = readCache(repo);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setStars(cached.count);
      return;
    }

    let cancelled = false;

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { stargazers_count?: number }) => {
        if (cancelled || typeof data.stargazers_count !== "number") return;
        setStars(data.stargazers_count);
        writeCache(repo, data.stargazers_count);
      })
      .catch(() => {
        // Fail quietly — keep showing the cached/last-known value, if any.
      });

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return stars;
}
