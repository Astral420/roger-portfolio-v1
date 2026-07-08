import type { RequestHandler } from "express";
import { HttpError } from "../../common/errors/http-error";
import { spotifyService } from "./spotify.service";

export const startSpotifyAuth: RequestHandler = (req, res) => {
  const state = typeof req.query.state === "string" ? req.query.state : undefined;
  const authorizationUrl = spotifyService.getAuthorizationUrl(state);

  res.redirect(302, authorizationUrl);
};

export const spotifyAuthCallback: RequestHandler = async (req, res) => {
  const error = req.query.error;
  if (typeof error === "string") {
    throw new HttpError(400, `Spotify authorization failed: ${error}.`, "SPOTIFY_AUTH_FAILED");
  }

  const code = req.query.code;
  if (typeof code !== "string" || !code.trim()) {
    throw new HttpError(
      400,
      "Spotify callback did not include an authorization code.",
      "SPOTIFY_AUTH_CODE_MISSING",
    );
  }

  const tokens = await spotifyService.exchangeAuthorizationCode(code);

  res.set("Cache-Control", "no-store");
  res.status(200).json({
    message:
      "Spotify authorization complete. Copy refreshToken into SPOTIFY_REFRESH_TOKEN in backend .env.",
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
    scope: tokens.scope,
    tokenType: tokens.token_type,
  });
};

export const getNowPlaying: RequestHandler = async (_req, res) => {
  const track = await spotifyService.getNowPlayingTrack();

  res.status(200).json(track);
};
