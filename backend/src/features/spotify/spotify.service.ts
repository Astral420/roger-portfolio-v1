import { env } from "../../common/config/env";
import { HttpError } from "../../common/errors/http-error";
import type { NowPlayingTrack } from "../../common/types/spotify";
import { mapSpotifyNowPlaying } from "./spotify.mapper";
import { SpotifyClient } from "./spotify.client";

export class SpotifyService {
  constructor(private readonly spotifyClient = new SpotifyClient()) {}

  getAuthorizationUrl(state?: string): string {
    if (!env.spotify.enabled || !env.spotify.credentials) {
      throw new HttpError(
        503,
        "Spotify integration is not configured on the server.",
        "SPOTIFY_NOT_CONFIGURED",
      );
    }

    const params = new URLSearchParams({
      client_id: env.spotify.credentials.clientId,
      response_type: "code",
      redirect_uri: env.spotify.oauth.redirectUri,
      scope: env.spotify.oauth.scopes.join(" "),
      show_dialog: env.spotify.oauth.showDialog ? "true" : "false",
    });

    if (state) {
      params.set("state", state);
    }

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeAuthorizationCode(code: string) {
    if (!env.spotify.enabled || !env.spotify.credentials) {
      throw new HttpError(
        503,
        "Spotify integration is not configured on the server.",
        "SPOTIFY_NOT_CONFIGURED",
      );
    }

    return this.spotifyClient.exchangeAuthorizationCode(
      env.spotify.credentials,
      code,
      env.spotify.oauth.redirectUri,
    );
  }

  async getNowPlayingTrack(): Promise<NowPlayingTrack> {
    if (
      !env.spotify.enabled ||
      !env.spotify.credentials ||
      !env.spotify.refreshToken
    ) {
      throw new HttpError(
        503,
        "Spotify now playing is not configured. Set SPOTIFY_REFRESH_TOKEN.",
        "SPOTIFY_NOT_CONFIGURED",
      );
    }

    const accessToken = await this.spotifyClient.getAccessToken(
      {
        ...env.spotify.credentials,
        refreshToken: env.spotify.refreshToken,
      },
    );
    const nowPlayingPayload = await this.spotifyClient.getNowPlaying(accessToken);

    return mapSpotifyNowPlaying(nowPlayingPayload);
  }
}

export const spotifyService = new SpotifyService();
