import { createApp } from "./app";
import { env } from "./common/config/env";
import { attachPresenceSocket } from "./ws/socket-server";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Backend server listening on port ${env.port}`);
});

const wss = attachPresenceSocket(server, env.allowedOrigin);

/**
 * Graceful shutdown on SIGTERM (sent by Render before instance replacement).
 * Closing the WebSocketServer first sends a WS close frame to every connected
 * client, which fires their `onclose` handler immediately so they start
 * reconnecting \u2014 rather than waiting for a TCP timeout after a hard kill.
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM received \u2014 shutting down gracefully");

  wss.close(() => {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  // Safety valve: force exit if graceful shutdown hangs past Render's window.
  setTimeout(() => {
    console.error("Graceful shutdown timed out \u2014 forcing exit");
    process.exit(1);
  }, 25_000).unref();
});

