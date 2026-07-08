import { Router } from "express";
import { healthRouter } from "../features/health/health.routes";

export const rootRouter = Router();

rootRouter.use("/health", healthRouter);
