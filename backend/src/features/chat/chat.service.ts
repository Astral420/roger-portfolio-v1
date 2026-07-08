import { sanitizePlainText } from "../../common/lib/sanitize";

const MAX_MESSAGE_LENGTH = 500;

/** Sanitizes a client-supplied chat message body: strips tags/control chars, caps length. */
export function sanitizeChatText(rawText: unknown): string {
  return sanitizePlainText(rawText, MAX_MESSAGE_LENGTH);
}
