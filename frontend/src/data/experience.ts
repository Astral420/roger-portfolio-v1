import type { ExperienceItem } from "../types";

// Sample data — replace with your real history.
export const experienceItems: ExperienceItem[] = [
  {
    id: "exp-01",
    type: "education",
    title: "Graduated B.S. Information Technology",
    organization: "STI College Malolos",
    period: "June 2026",
    description: "Graduated with a GWA of 1.55",
  },
  {
    id: "exp-02",
    type: "internship",
    title: "Full Stack Developer Intern",
    organization: "SOCIA",
    period: "Feb 2026 - May 2026",
    description:
      "Learned scalable system design through projects and production-level deployments. Also contributed to UI/UX design decisions.",
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
    tags: ["Flutter", "Arduino", "Firebase", "React", "Hardware & Electronics"],
  },
];
