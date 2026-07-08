import { Router } from "express";
import { healthRouter } from "../features/health/health.routes";
import { spotifyRouter } from "../features/spotify/spotify.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/spotify", spotifyRouter);
