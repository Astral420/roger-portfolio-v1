import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../../data/projects";
import type { Project } from "../../types";
import { GithubMark } from "../ui/BrandIcons";
import { useFeatureFlags } from "../../contexts/FeatureFlagContext";

const easing = [0.22, 1, 0.36, 1] as const;

/**
 * Browser-chrome frame around a project preview. Renders the real screenshot
 * from `project.image` (an absolute path served out of `public/`, e.g.
 * `/projects/knocksense.png`) when one is set and loads successfully;
 * otherwise falls back to an abstract gradient placeholder.
 */
function ProjectPreview({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(project.image) && !imageFailed;

  const gradients = [
    "from-[#6366F1]/25 via-[#3B82F6]/10 to-transparent",
    "from-[#3B82F6]/25 via-[#6366F1]/10 to-transparent",
    "from-[#6366F1]/20 via-[#8B5CF6]/10 to-transparent",
  ];

  return (
    <div className="relative flex aspect-[4/3] w-full flex-col overflow-hidden rounded-xl border border-border/10 bg-bg-elevated">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border/8 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-tertiary/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-tertiary/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-tertiary/30" />
        <span className="ml-3 truncate rounded-full bg-primary/[0.04] px-3 py-1 text-[10px] text-tertiary">
          {project.liveUrl ?? `${project.name.toLowerCase()}.app`}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {hasImage ? (
          <img
            src={project.image}
            alt={`${project.name} screenshot`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            className={`relative h-full w-full bg-gradient-to-br ${gradients[index % gradients.length]}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-6xl font-thin text-primary/10 select-none">
                {project.number}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"],
  });

  const isLast = index === total - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.55]);

  // The sticky/stacking effect works by relying on the *following* card's
  // sticky container to eventually cover and release this one. The last
  // card has nothing after it to do that, so making it sticky here would
  // leave it permanently pinned under the header, overlapping the Contact
  // section as the page scrolls past. It renders in normal flow instead,
  // settling into its final resting position once scrolled into view.
  return (
    <div
      ref={cardRef}
      className={isLast ? "relative" : "sticky top-20 md:top-24"}
      style={{ zIndex: index + 1 }}
    >
      <motion.div
        style={{ scale, opacity }}
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: easing }}
        className="rounded-2xl border border-border/10 bg-bg p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] md:p-10"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {/* Engineering info */}
          <div className="flex flex-col">
            <span className="font-mono text-sm text-accent-from">
              {project.number}
            </span>
            <h3 className="mt-3 text-2xl font-medium text-primary md:text-3xl">
              {project.name}
            </h3>
            <p className="mt-4 text-secondary leading-relaxed">
              {project.description}
            </p>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-tertiary">
                  Role
                </dt>
                <dd className="mt-1 text-secondary">{project.role}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-tertiary">
                  Architecture
                </dt>
                <dd className="mt-1 leading-relaxed text-secondary">
                  {project.architecture}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-tertiary">
                  Stack
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border/10 px-3 py-1 text-xs text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/12 px-4 py-2 text-sm text-primary transition-colors duration-300 hover:border-border/25"
                >
                  <GithubMark size={14} /> Code
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.04] px-4 py-2 text-sm text-primary transition-colors duration-300 hover:bg-primary/[0.08]"
                >
                  Live demo <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center">
            <ProjectPreview project={project} index={index} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Projects() {
  const { isProjectEnabled } = useFeatureFlags();
  const visibleProjects = projects.filter((project) =>
    isProjectEnabled(project.id),
  );

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative py-28 md:py-36"
    >
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easing }}
          className="mb-16 max-w-xl"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-tertiary">
            Projects
          </span>
          <h2
            id="projects-heading"
            className="mt-4 text-section-title font-light text-primary text-balance"
          >
            Selected work.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-24 pb-24 md:gap-32">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={visibleProjects.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
