import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import { siteConfig } from "../../data/site";
import { GithubMark, LinkedinMark } from "../ui/BrandIcons";

const easing = [0.22, 1, 0.36, 1] as const;

const links = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "@Astral420",
    href: siteConfig.github,
    icon: GithubMark,
  },
  {
    label: "LinkedIn",
    value: "in/roger-dy",
    href: siteConfig.linkedin,
    icon: LinkedinMark,
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative py-28 md:py-36"
    >
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easing }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-tertiary">
            Contact
          </span>
          <h2
            id="contact-heading"
            className="mt-4 text-section-title font-light text-primary text-balance"
          >
            Let&apos;s build something.
          </h2>
          <p className="mt-4 text-secondary">
            Open to freelance work, collaborations, and interesting problems.
          </p>

          <ul className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            {links.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: easing, delay: i * 0.08 }}
                >
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http") ? "noreferrer" : undefined
                    }
                    className="group flex items-center justify-between gap-6 rounded-2xl border border-border/10 px-5 py-4 text-left transition-all duration-300 ease-premium hover:border-border/25 hover:bg-primary/[0.03] sm:flex-col sm:items-start sm:gap-8"
                  >
                    <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-tertiary">
                      <Icon size={14} /> {link.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                      {link.value}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
