import type { ExperienceItem } from "../types";

// Sample data — replace with your real history.
export const experienceItems: ExperienceItem[] = [
  {
    id: "exp-01",
    type: "education",
    title: "Graduated B.S. Information Technology",
    organization: "STI College Malolos",
    period: "June 2026",
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
    tags: ["System Design", "Full Stack Development", "Databases"],
  },
  {
    id: "exp-03",
    type: "education",
    title: "Project Lead and Developer (Thesis)",
    organization: "STI College Malolos",
    period: "Feb 2025 - Oct 2025",
    description:
      "Built KnockSense, an IoT based web & mobile system that acts as a faculty smart lock, attendance and scheduling system.",
    tags: ["React Native", "Arduino", "Firebase", "React"],
  },
];
