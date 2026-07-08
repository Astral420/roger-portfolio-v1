import type { Express } from "express";
import { apiRouter } from "./api.routes";
import { rootRouter } from "./root.routes";

export function registerRoutes(app: Express): void {
  app.use("/", rootRouter);
  app.use("/api", apiRouter);
}
