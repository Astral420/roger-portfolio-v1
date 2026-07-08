import type {
  NowPlayingTrack,
  SpotifyNowPlayingPayload,
} from "../../common/types/spotify";

const NOT_PLAYING_TRACK: NowPlayingTrack = {
  song: "Not playing",
  artist: "Spotify",
  isPlaying: false,
};

export function mapSpotifyNowPlaying(
  payload: SpotifyNowPlayingPayload | null,
): NowPlayingTrack {
  if (!payload || !payload.is_playing || !payload.item) {
    return NOT_PLAYING_TRACK;
  }

  const artistNames = payload.item.artists
    .map((artist) => artist.name)
    .filter(Boolean)
    .join(", ");

  return {
    song: payload.item.name || "Unknown track",
    artist: artistNames || "Unknown artist",
    isPlaying: true,
  };
}
