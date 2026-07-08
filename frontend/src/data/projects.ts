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
      "C++",
      "JavaScript",
      "React",
      "TailwindCSS",
      "Google Cloud Scheduler",
    ],
    architecture:
      "ESP32-based RFID door lock, with Firebase Realtime for easy data correlation between client and hardware, running on Arduino Framework. GCP Scheduler for CRON jobs. Client runs on React for Web and Flutter for Mobile.",
    githubUrl: "https://github.com/Astral420/KnockSense",
    liveUrl: "",
    image: "/projects/knocksense.png",
    previewFit: "cover",
    previewPosition: "top",
    inProgress: false,
  },
  {
    id: "proj-02",
    number: "02",
    name: "Servify",
    description:
      "A service marketplace platform that connects clients with providers for booking, reviews, and service management.",
    role: "Backend Lead & API design",
    techStack: [
      "Express.js",
      "Javascript",
      "React",
      "PostgreSQL",
      "Docker",
      "TailwindCSS",
    ],
    architecture:
      "React/Vite frontend with an Express.js backend, PostgreSQL database, JWT-based auth, and Dockerized services for deployment and development.",
    githubUrl: "",
    image: "/projects/Servify.png",
    previewFit: "cover",
    previewPosition: "top",
  },
  {
    id: "proj-03",
    number: "03",
    name: "JobSwipe",
    description:
      "A mobile-first job matching platform that combines swipe-based candidate screening, job posting, matching, and in-app messaging with company onboarding.",
    role: "Project Manager and Backend Lead",
    techStack: [
      "React Native (Expo)",
      "TypeScript",
      "PostgreSQL",
      "MongoDB",
      "PHP",
      "Laravel",
      "Redis",
      "Laravel Horizon",
      "Laravel Reverb",
      "Docker",
      "AWS EC2",
      "Cloudflare R2",
      "Websockets",
    ],
    architecture:
      "Laravel backend with PostgreSQL for core records, and MongoDB for profile/content data, and Redis for queues, caching, and real-time messaging alongside websockets.",
    githubUrl: "",
    liveUrl: "",
    image: "/projects/JobSwipe.png",
    previewFit: "cover",
    previewPosition: "top",
  },
  {
    id: "proj-04",
    number: "04",
    name: "Trading Card Deduplication Tool",
    description:
      "Crops, deduplicates, and auto-rotates trading card scans to smoothen card entry into Card Dealer Pro.",
    role: "Solo Full Stack Developer",
    techStack: [
      "React",
      "TypeScript",
      "Shadcn",
      "Python",
      "FastAPI",
      "OpenCV",
      "PostgreSQL",
      "Celery",
      "Redis",
      "Cloudflare R2",
      "SQLAlchemy",
    ],
    architecture:
      "FastAPI handles auth, batch ingest, card review, and queue endpoints. Celery workers process extraction, cropping, hashing, and duplicate detection asynchronously. Postgres stores batches, scans, crops, users, and review state, while Redis powers the task queue. Cropped and raw images live in Cloudflare R2.",
    githubUrl: "https://github.com/roger/signal",
    liveUrl: "",
    // TODO: drop a screenshot in public/projects/ and point this at it,
    // e.g. "/projects/signal.png". Empty string falls back to the gradient
    // placeholder.
    image: "",
    inProgress: true,
  },
];
