const HTML_TAG_PATTERN = /<[^>]*>/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;

/**
 * Never trust client-supplied strings (`name`, chat `text`) even though the
 * frontend also caps length — see `BACKEND.md` §7. Strips HTML tags and
 * control characters, trims, and caps to `maxLength`.
 */
export function sanitizePlainText(raw: unknown, maxLength: number): string {
  if (typeof raw !== "string") return "";

  return raw
    .replace(HTML_TAG_PATTERN, "")
    .replace(CONTROL_CHAR_PATTERN, "")
    .trim()
    .slice(0, maxLength);
}
