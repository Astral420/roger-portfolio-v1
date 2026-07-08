import { Router } from "express";
import {
  getNowPlaying,
  spotifyAuthCallback,
  startSpotifyAuth,
} from "./spotify.controller";

export const spotifyRouter = Router();

spotifyRouter.get("/auth/start", startSpotifyAuth);
spotifyRouter.get("/auth/callback", spotifyAuthCallback);
spotifyRouter.get("/now-playing", getNowPlaying);
