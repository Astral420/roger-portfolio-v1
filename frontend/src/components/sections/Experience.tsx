import { motion } from 'framer-motion';
import { Award, Briefcase, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react';
import { experienceItems } from '../../data/experience';
import type { ExperienceType } from '../../types';

const easing = [0.22, 1, 0.36, 1] as const;

const TYPE_META: Record<ExperienceType, { icon: LucideIcon; label: string }> = {
  internship: { icon: Briefcase, label: 'Internship' },
  education: { icon: GraduationCap, label: 'Education' },
  freelance: { icon: Sparkles, label: 'Freelance' },
  achievement: { icon: Award, label: 'Achievement' },
};

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="relative py-28 md:py-36">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easing }}
          className="mb-16 max-w-xl"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-tertiary">Experience</span>
          <h2 id="experience-heading" className="mt-4 text-section-title font-light text-primary text-balance">
            A timeline, not a resume.
          </h2>
        </motion.div>

        <ol className="relative border-l border-border/10 pl-8 md:pl-10">
          {experienceItems.map((item, index) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: easing, delay: (index % 4) * 0.06 }}
                className="relative pb-14 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[41px] flex h-7 w-7 items-center justify-center rounded-full border border-border/12 bg-bg text-secondary md:-left-[49px]"
                >
                  <Icon size={13} strokeWidth={1.75} />
                </span>

                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-medium text-primary">{item.title}</h3>
                  <span className="text-xs uppercase tracking-wide text-tertiary">{item.period}</span>
                </div>

                <p className="mt-1 text-sm font-medium text-accent-from">{item.organization}</p>
                <p className="mt-3 max-w-2xl text-secondary leading-relaxed">{item.description}</p>

                {item.tags && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-border/10 px-3 py-1 text-xs text-tertiary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
