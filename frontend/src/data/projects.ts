import type { Project } from "../types";

// Sample data — replace with your real projects and screenshots.
export const projects: Project[] = [
  {
    id: "proj-01",
    number: "01",
    name: "KnockSense",
    description:
      "A real-time faculty monitoring and attendance system with RFID door lock system.",
    role: "Project Lead and Lead Developer",
    techStack: [
      "Flutter",
      "Firebase",
      "Arduino",
      "Dart",
      "Javascript",
      "React",
      "TailwindCSS",
      "Google Cloud Scheduler",
    ],
    architecture:
      "Event-sourced ledger with a Node/Express API, Postgres for durable state, and Redis for session and settlement caching. Client uses Expo with a local SQLite mirror for offline-first reads.",
    githubUrl: "https://github.com/Astral420/KnockSense",
    liveUrl: "",
    image: "/projects/knocksense.png",
    inProgress: true,
  },
  {
    id: "proj-02",
    number: "02",
    name: "Northbeam Console",
    description:
      "Internal admin dashboard used to monitor deployments, feature flags, and system health across three microservices.",
    role: "Backend engineer & API design",
    techStack: ["Laravel", "PHP", "React", "MySQL", "Docker"],
    architecture:
      "Laravel API behind an Nginx reverse proxy, containerized with Docker Compose for local parity with staging. React dashboard consumes a versioned REST API with role-based access control.",
    githubUrl: "https://github.com/roger/northbeam-console",
    // TODO: drop a screenshot in public/projects/ and point this at it,
    // e.g. "/projects/northbeam-console.png". Empty string falls back to
    // the gradient placeholder.
    image: "",
  },
  {
    id: "proj-03",
    number: "03",
    name: "Signal",
    description:
      "A disaster-response coordination tool built in 36 hours for a regional hackathon, later adopted as a reference project.",
    role: "Team lead & full stack",
    techStack: ["React", "TypeScript", "WebSockets", "Firebase"],
    architecture:
      "Firebase Realtime Database drives live location and status updates over WebSocket-backed listeners, with a React front end optimized for low-bandwidth field conditions.",
    githubUrl: "https://github.com/roger/signal",
    liveUrl: "https://signal-devjam.example.com",
    // TODO: drop a screenshot in public/projects/ and point this at it,
    // e.g. "/projects/signal.png". Empty string falls back to the gradient
    // placeholder.
    image: "",
  },
];
