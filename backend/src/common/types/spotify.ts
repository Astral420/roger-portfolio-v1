export interface NowPlayingTrack {
  song: string;
  artist: string;
  isPlaying: boolean;
}

export interface SpotifyArtistPayload {
  name: string;
}

export interface SpotifyItemPayload {
  name: string;
  artists: SpotifyArtistPayload[];
}

export interface SpotifyNowPlayingPayload {
  is_playing: boolean;
  item: SpotifyItemPayload | null;
}
