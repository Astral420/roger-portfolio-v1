export type Theme = "dark" | "light";

export interface TechItem {
  name: string;
  icon: string; // react-icons component name (Si* or FaAws), resolved in TechMarquee
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
  /** How the screenshot should fit the fixed project preview frame. */
  previewFit?: "contain" | "cover";
  /** Vertical anchor used when previewFit is "cover". */
  previewPosition?: "center" | "top";
  /** True if this project is actively being worked on right now. */
  inProgress?: boolean;
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
  /** "guest" covers any other visitor's message — see `name` for who sent it. */
  author: "visitor" | "guest" | "system";
  /** Display name of the sender; set for "guest" messages, omitted for your own/system. */
  name?: string;
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
  /** Normalized 0..1 document/page coordinates, so cursors stay in the same section across visitors. */
  x: number;
  y: number;
  updatedAt: number;
}
