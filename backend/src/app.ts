import cors from "cors";
import express from "express";
import { env } from "./common/config/env";
import { errorHandler } from "./common/middleware/error-handler";
import { notFoundHandler } from "./common/middleware/not-found-handler";
import { registerRoutes } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors(
      env.allowedOrigin
        ? {
            origin: env.allowedOrigin,
          }
        : undefined,
    ),
  );
  app.use(express.json());

  registerRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
