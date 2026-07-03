import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin gradient bar pinned to the very top edge, tracking scroll position. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-accent-gradient"
      style={{ scaleX }}
    />
  );
}
