import { createApp } from "./app";
import { env } from "./common/config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Backend server listening on port ${env.port}`);
});
