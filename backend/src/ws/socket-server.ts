import type { Server as HttpServer } from "node:http";
import { WebSocketServer } from "ws";
import { createConnectionHandler } from "./handlers";

/**
 * Attaches a WebSocket server to the existing HTTP server via the `upgrade`
 * event, so presence/chat share the same port as the REST API — no separate
 * process or port to manage. See `BACKEND.md` §5.1 and
 * `PRESENCE_CHAT_IMPLEMENTATION_SPEC.md` §3.
 *
 * When `allowedOrigin` is set, connections from any other `Origin` header are
 * rejected before the WS handshake completes.
 */
export function attachPresenceSocket(httpServer: HttpServer, allowedOrigin?: string): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  const handleConnection = createConnectionHandler();

  httpServer.on("upgrade", (request, socket, head) => {
    if (allowedOrigin && request.headers.origin !== allowedOrigin) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", handleConnection);

  return wss;
}
