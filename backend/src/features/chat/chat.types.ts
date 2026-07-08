/** Wire shape broadcast to clients — matches `frontend/src/types/index.ts` (mapped locally). */
export interface ChatMessage {
  id: string;
  guestId: string;
  name: string;
  text: string;
  timestamp: number;
}
