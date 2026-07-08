import { WebSocket } from "ws";

/** Sends a JSON frame to a single connection, silently skipping if it's not open. */
export function send(ws: WebSocket, message: unknown): void {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(message));
}

/**
 * Fans a JSON frame out to every connection in `clients`, optionally skipping
 * one guest id (typically the sender, for relays that shouldn't echo back).
 */
export function broadcast(
  clients: Map<string, WebSocket>,
  message: unknown,
  excludeId?: string,
): void {
  const json = JSON.stringify(message);

  for (const [id, ws] of clients) {
    if (id === excludeId) continue;
    if (ws.readyState === WebSocket.OPEN) ws.send(json);
  }
}
