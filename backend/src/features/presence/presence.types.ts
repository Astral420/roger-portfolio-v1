/** Server-side record of a connected guest, keyed by guest id. */
export interface PresenceRecord {
  id: string;
  guestNumber: number;
  name: string;
  color: string;
  /** Normalized 0..1 viewport coordinates. */
  x: number;
  y: number;
  lastSeen: number;
}

/** Wire shape broadcast to clients — matches `frontend/src/types/index.ts` `RemoteCursor`. */
export interface RemoteCursor {
  id: string;
  name: string;
  guestNumber: number;
  color: string;
  x: number;
  y: number;
  updatedAt: number;
}
