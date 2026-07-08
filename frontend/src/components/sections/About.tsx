import { motion } from "framer-motion";
import { TechMarquee } from "./TechMarquee";

const easing = [0.22, 1, 0.36, 1] as const;

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative py-28 md:py-36"
    >
      <div className="container-content">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-16">
          {/* Left: bio */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-tertiary">
              About
            </span>
            <h2
              id="about-heading"
              className="mt-4 text-section-title font-light text-primary text-balance"
            >
              Build things that last.,{" "}
              <span className="text-secondary">Learn things that matter.</span>
            </h2>

            <div className="mt-6 space-y-4 text-secondary leading-relaxed">
              <p>
                I&apos;m a full-stack developer who enjoys turning ideas into
                reliable, scalable software. I care as much about what happens
                behind the scenes as what users see—designing clean
                architectures, building maintainable APIs, optimizing databases,
                and creating interfaces that feel intuitive.
              </p>
              <p>
                My stack includes React, React Native, Node.js, Laravel,
                TypeScript, PostgreSQL, MySQL, and other things. I enjoy solving
                problems across the entire development lifecycle, from planning
                and implementation to deployment and monitoring.
              </p>
              <p>
                Beyond writing code, I'm always looking to improve my
                craft—whether that's exploring better engineering practices,
                contributing to internal tools, mentoring fellow developers, or
                experimenting with new technologies. For me, great software
                isn't just functional; it's dependable, thoughtful, and built to
                evolve.
              </p>
            </div>
          </motion.div>

          {/* Right: tech marquee */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easing, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-5 text-xs uppercase tracking-[0.2em] text-tertiary">
              Tech I work with
            </span>
            <TechMarquee />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
