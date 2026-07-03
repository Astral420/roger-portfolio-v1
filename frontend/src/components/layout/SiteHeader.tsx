import { Navbar } from './Navbar';
import { SpotifyBar } from './SpotifyBar';

/** Fixed header stack: floating navbar with the Spotify strip docked directly beneath it. */
export function SiteHeader() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <Navbar />
      <SpotifyBar />
    </header>
  );
}
