import type { RequestHandler } from "express";
import { env } from "../../common/config/env";

export const getHealth: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    spotifyConfigured: env.spotify.enabled,
  });
};
