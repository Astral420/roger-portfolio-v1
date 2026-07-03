import { motion } from 'framer-motion';
import { TechMarquee } from './TechMarquee';

const easing = [0.22, 1, 0.36, 1] as const;

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative py-28 md:py-36">
      <div className="container-content">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-16">
          {/* Left: bio */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-tertiary">About</span>
            <h2 id="about-heading" className="mt-4 text-section-title font-light text-primary text-balance">
              Engineering is the craft,{' '}
              <span className="text-secondary">the product is the proof.</span>
            </h2>

            <div className="mt-6 space-y-4 text-secondary leading-relaxed">
              <p>
                I&apos;m a full stack developer who cares as much about what happens behind the
                request as what renders on screen — schema design, caching strategy, and the
                deploy pipeline that ships it safely.
              </p>
              <p>
                My day-to-day spans React and React Native on the front end, Laravel and Node.js
                on the back end, with PostgreSQL, MySQL, and Redis handling state. I like
                systems that are boring in production and interesting to build.
              </p>
              <p>
                Outside of client work, I contribute to internal tooling, mentor junior
                developers picking up TypeScript, and occasionally win a hackathon or two.
              </p>
            </div>
          </motion.div>

          {/* Right: tech marquee */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
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
