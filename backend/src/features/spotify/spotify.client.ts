import type {
  SpotifyAppCredentials,
  SpotifyCredentials,
} from "../../common/config/env";
import { HttpError } from "../../common/errors/http-error";
import type { SpotifyNowPlayingPayload } from "../../common/types/spotify";

export interface SpotifyTokenPayload {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export class SpotifyClient {
  private readonly accountsUrl = "https://accounts.spotify.com/api/token";
  private readonly nowPlayingUrl =
    "https://api.spotify.com/v1/me/player/currently-playing";

  async exchangeAuthorizationCode(
    credentials: SpotifyAppCredentials,
    code: string,
    redirectUri: string,
  ): Promise<SpotifyTokenPayload> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await this.fetchWithSpotifyErrors(this.accountsUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.createBasicAuth(credentials)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const payload = (await this.parseJson(response)) as SpotifyTokenPayload;

    if (!response.ok) {
      throw new HttpError(
        502,
        "Failed to exchange Spotify authorization code.",
        "SPOTIFY_AUTH_CODE_EXCHANGE_FAILED",
        { status: response.status },
      );
    }

    if (!payload.access_token || !payload.refresh_token) {
      throw new HttpError(
        502,
        "Spotify auth code exchange did not return required tokens.",
        "SPOTIFY_AUTH_CODE_INVALID_RESPONSE",
      );
    }

    return payload;
  }

  async getAccessToken(credentials: SpotifyCredentials): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credentials.refreshToken,
    });

    const response = await this.fetchWithSpotifyErrors(this.accountsUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.createBasicAuth(credentials)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const payload = (await this.parseJson(response)) as SpotifyTokenPayload;

    if (!response.ok) {
      throw new HttpError(
        502,
        "Failed to refresh Spotify access token.",
        "SPOTIFY_TOKEN_REFRESH_FAILED",
        { status: response.status },
      );
    }

    if (!payload.access_token) {
      throw new HttpError(
        502,
        "Spotify token response did not include an access token.",
        "SPOTIFY_TOKEN_INVALID_RESPONSE",
      );
    }

    return payload.access_token;
  }

  async getNowPlaying(
    accessToken: string,
  ): Promise<SpotifyNowPlayingPayload | null> {
    const response = await this.fetchWithSpotifyErrors(
      `${this.nowPlayingUrl}?additional_types=track`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new HttpError(
        502,
        "Failed to retrieve Spotify now playing data.",
        "SPOTIFY_NOW_PLAYING_REQUEST_FAILED",
        { status: response.status },
      );
    }

    const payload = (await this.parseJson(
      response,
    )) as SpotifyNowPlayingPayload;

    if (typeof payload?.is_playing !== "boolean") {
      throw new HttpError(
        502,
        "Spotify now playing response is malformed.",
        "SPOTIFY_NOW_PLAYING_INVALID_RESPONSE",
      );
    }

    return payload;
  }

  private createBasicAuth(credentials: SpotifyAppCredentials): string {
    return Buffer.from(
      `${credentials.clientId}:${credentials.clientSecret}`,
    ).toString("base64");
  }

  private async parseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HttpError(
          502,
          "Spotify response could not be parsed as JSON.",
          "SPOTIFY_INVALID_JSON",
        );
      }

      throw error;
    }
  }

  private async fetchWithSpotifyErrors(
    input: RequestInfo | URL,
    init: RequestInit,
  ): Promise<Response> {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new HttpError(
          502,
          "Unable to reach Spotify API.",
          "SPOTIFY_NETWORK_ERROR",
        );
      }

      throw error;
    }
  }
}
