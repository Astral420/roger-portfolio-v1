/**
 * Sliding-window rate limiter keyed by an arbitrary string (typically a
 * guest id). Used as defense-in-depth against abusive clients — see
 * `BACKEND.md` §7 — in addition to whatever the frontend already throttles.
 */
export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the action is allowed, recording it if so. */
  allow(key: string): boolean {
    const now = Date.now();
    const existing = this.hits.get(key) ?? [];
    const recent = existing.filter((timestamp) => now - timestamp < this.windowMs);

    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  cleanup(key: string): void {
    this.hits.delete(key);
  }
}
