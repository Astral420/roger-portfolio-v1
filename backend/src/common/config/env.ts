import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "test" | "production";

export interface SpotifyAppCredentials {
  clientId: string;
  clientSecret: string;
}

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface AppEnv {
  nodeEnv: NodeEnv;
  port: number;
  allowedOrigin?: string;
  spotify: {
    enabled: boolean;
    credentials?: SpotifyAppCredentials;
    refreshToken?: string;
    oauth: {
      redirectUri: string;
      scopes: string[];
      showDialog: boolean;
    };
  };
}

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  if (!value) {
    return undefined;
  }

  return value;
}

function parseNodeEnv(): NodeEnv {
  const value = readOptionalEnv("NODE_ENV") ?? "development";
  const validNodeEnvs: NodeEnv[] = ["development", "test", "production"];

  if (!validNodeEnvs.includes(value as NodeEnv)) {
    throw new Error(
      "NODE_ENV must be one of: development, test, production.",
    );
  }

  return value as NodeEnv;
}

function parsePort(): number {
  const rawPort = readOptionalEnv("PORT");

  if (!rawPort) {
    return 8080;
  }

  const parsedPort = Number.parseInt(rawPort, 10);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    throw new Error("PORT must be a valid TCP port number (1-65535).");
  }

  return parsedPort;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error("SPOTIFY_SHOW_DIALOG must be 'true' or 'false'.");
}

function parseSpotifyScopes(rawScopes: string | undefined): string[] {
  if (!rawScopes) {
    return ["user-read-currently-playing", "user-read-playback-state"];
  }

  const scopes = rawScopes
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (scopes.length === 0) {
    throw new Error("SPOTIFY_SCOPES must contain at least one scope.");
  }

  return scopes;
}

function parseSpotifyConfig(port: number): AppEnv["spotify"] {
  const clientId = readOptionalEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = readOptionalEnv("SPOTIFY_CLIENT_SECRET");
  const refreshToken = readOptionalEnv("SPOTIFY_REFRESH_TOKEN");
  const redirectUri =
    readOptionalEnv("SPOTIFY_REDIRECT_URI") ??
    `http://127.0.0.1:${port}/api/spotify/auth/callback`;
  const scopes = parseSpotifyScopes(readOptionalEnv("SPOTIFY_SCOPES"));
  const showDialog = parseBoolean(readOptionalEnv("SPOTIFY_SHOW_DIALOG"), true);

  const hasAnySpotifyVar = [clientId, clientSecret, refreshToken].some(Boolean);

  if (!hasAnySpotifyVar) {
    return {
      enabled: false,
      oauth: {
        redirectUri,
        scopes,
        showDialog,
      },
    };
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      "Spotify auth config is incomplete. Provide SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.",
    );
  }

  return {
    enabled: true,
    credentials: {
      clientId,
      clientSecret,
    },
    ...(refreshToken ? { refreshToken } : {}),
    oauth: {
      redirectUri,
      scopes,
      showDialog,
    },
  };
}

const allowedOrigin = readOptionalEnv("ALLOWED_ORIGIN");
const port = parsePort();

export const env: AppEnv = {
  nodeEnv: parseNodeEnv(),
  port,
  spotify: parseSpotifyConfig(port),
  ...(allowedOrigin ? { allowedOrigin } : {}),
};
