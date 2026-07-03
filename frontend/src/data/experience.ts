import type { ExperienceItem } from "../types";

// Sample data — replace with your real history.
export const experienceItems: ExperienceItem[] = [
  {
    id: "exp-01",
    type: "education",
    title: "Graduated B.S. Information Technology",
    organization: "STI College Malolos",
    period: "2022-2026",
    description:
      "Shipped internal tooling for the platform team, building a Laravel + React admin dashboard that cut manual reporting time from days to minutes.",
  },
  {
    id: "exp-02",
    type: "internship",
    title: "Full Stack Developer Intern",
    organization: "SOCIA",
    period: "Feb 2026 - May 2026",
    description:
      "Focused on distributed systems and mobile development. Capstone project explored offline-first sync strategies for low-connectivity environments.",
    tags: ["Systems Design", "Mobile", "Databases"],
  },
  {
    id: "exp-03",
    type: "freelance",
    title: "Full Stack Developer",
    organization: "Independent / Contract",
    period: "2022 — Present",
    description:
      "Designed and built production apps for small businesses end-to-end — API, database schema, deployment pipeline, and cross-platform client with React Native.",
    tags: ["React Native", "Node.js", "AWS"],
  },
];
