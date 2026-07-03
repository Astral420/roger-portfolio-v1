export type Theme = "dark" | "light";

export interface TechItem {
  name: string;
  icon: string; // lucide icon name, resolved in TechMarquee
}

export interface Project {
  id: string;
  number: string;
  name: string;
  description: string;
  role: string;
  techStack: string[];
  architecture: string;
  githubUrl?: string;
  liveUrl?: string;
  image: string;
}

export type ExperienceType =
  "internship" | "education" | "freelance" | "achievement";

export interface ExperienceItem {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string;
  period: string;
  description: string;
  tags?: string[];
}

export interface SpotifyTrack {
  song: string;
  artist: string;
  isPlaying: boolean;
}

export interface ChatMessage {
  id: string;
  author: "visitor" | "roger" | "system";
  text: string;
  timestamp: number;
}

export type ConnectionStatus = "connecting" | "online" | "offline";

/** A visitor's live position on the page, shared via the presence backend. */
export interface RemoteCursor {
  id: string;
  name: string;
  guestNumber: number;
  color: string;
  /** Normalized 0..1 viewport-relative coordinates, so they map across screen sizes. */
  x: number;
  y: number;
  updatedAt: number;
}
