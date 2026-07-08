import { api } from "./api";
import type { SpotifyTrack } from "../types";

export async function getNowPlaying() {
  return api<SpotifyTrack>("/spotify/now-playing");
}
