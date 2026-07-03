import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Circle } from 'lucide-react';
import { siteConfig } from '../../data/site';
import { scrollToSection } from '../../lib/scrollTo';
import { Button, LinkButton } from '../ui/Button';

const AvatarCanvas = lazy(() => import('../three/AvatarCanvas'));

const easing = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-[92vh] items-center pt-32 pb-16 md:pt-36"
    >
      <div className="container-content grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-8">
        {/* Copy */}
        <div className="order-2 md:order-1">
          {siteConfig.availableForWork && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easing }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/10 bg-primary/[0.03] px-3.5 py-1.5 text-xs text-secondary"
            >
              <Circle size={7} fill="#22c55e" strokeWidth={0} className="animate-pulse" />
              Available for work
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing, delay: 0.05 }}
            className="text-hero font-light text-primary text-balance"
          >
            Hi, I&apos;m{' '}
            <span className="bg-accent-gradient bg-clip-text text-transparent font-normal">
              {siteConfig.name}.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing, delay: 0.15 }}
            className="mt-6 max-w-lg text-lg text-secondary md:text-xl"
          >
            <span className="text-primary font-medium">{siteConfig.role}.</span>
            <br />
            {siteConfig.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button onClick={() => scrollToSection('projects')}>
              View Projects
              <ArrowUpRight size={15} strokeWidth={2} />
            </Button>
            <LinkButton href={`mailto:${siteConfig.email}`} variant="ghost">
              Get in Touch
            </LinkButton>
          </motion.div>
        </div>

        {/* 3D Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: easing, delay: 0.1 }}
          className="order-1 mx-auto aspect-square w-full max-w-[420px] md:order-2"
        >
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-border/15 border-t-accent-from animate-spin" />
              </div>
            }
          >
            <AvatarCanvas />
          </Suspense>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToSection('about')}
        aria-label="Scroll to About section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-tertiary md:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={14} />
        </motion.span>
      </motion.button>
    </section>
  );
}
