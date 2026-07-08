import type Lenis from 'lenis';

/**
 * Module-level handle to the active Lenis instance (if smooth scrolling is
 * enabled). Lets plain utility functions like `scrollToSection` drive the
 * smooth scroller without needing to be React components themselves.
 */
let activeLenis: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  activeLenis = instance;
}

export function getLenisInstance(): Lenis | null {
  return activeLenis;
}
