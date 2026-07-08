import { sanitizePlainText } from "../../common/lib/sanitize";

const MAX_NAME_LENGTH = 24;

/**
 * Sanitizes a client-supplied display name. Falls back to `Guest-####` when
 * the name is missing/empty after sanitization and a `guestNumber` is
 * available, per `BACKEND.md` §5.2.
 */
export function sanitizeName(rawName: unknown, guestNumber?: number): string {
  const fallback = guestNumber !== undefined ? `Guest-${guestNumber}` : "";
  const cleaned = sanitizePlainText(rawName, MAX_NAME_LENGTH);
  return cleaned || fallback;
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
