import type { SpotifyTrack } from "../types";

// Replace with your real details.
export const siteConfig = {
  name: "Roger",
  role: "Full Stack Developer",
  tagline: "Building scalable web & mobile applications.",
  email: "dyrogerfredrick@gmail.com",
  github: "https://github.com/Astral420",
  linkedin: "https://www.linkedin.com/in/roger-dy",
  availableForWork: true,
  // "owner/repo" for this portfolio's own GitHub repo, used for the nav bar star count.
  // Update this if the repo lives somewhere else.
  githubRepo: "Astral420/roger-portfolio",
};

// Placeholder — wire up to the Spotify "Now Playing" API later.
export const nowPlaying: SpotifyTrack = {
  song: "Midnight City",
  artist: "M83",
  isPlaying: true,
};

export const navLinks = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;
