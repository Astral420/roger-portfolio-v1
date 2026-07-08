import { createApp } from "./app";
import { env } from "./common/config/env";
import { attachPresenceSocket } from "./ws/socket-server";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Backend server listening on port ${env.port}`);
});

attachPresenceSocket(server, env.allowedOrigin);
