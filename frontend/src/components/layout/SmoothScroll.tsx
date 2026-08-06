import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import type { ReactNode } from 'react';
import { useReducedMotionPreference } from '../../hooks/useReducedMotion';
import { setLenisInstance } from '../../lib/lenisInstance';

function isSafariBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const vendor = navigator.vendor;

  return (
    vendor.includes("Apple") &&
    /Safari/i.test(ua) &&
    !/(Chrome|Chromium|CriOS|FxiOS|Edg|EdgiOS|OPR|OPiOS|Android)/i.test(ua)
  );
}

/** Registers the live Lenis instance so non-React helpers (scrollToSection) can drive it. */
function LenisRegistrar() {
  const lenis = useLenis();

  useEffect(() => {
    setLenisInstance(lenis ?? null);
    return () => setLenisInstance(null);
  }, [lenis]);

  return null;
}

/**
 * Wraps the app with Lenis smooth scrolling, mounted on the document root so
 * native behaviors (position: sticky, anchor links, scrollbars) keep working.
 * Falls back to plain native scrolling when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const shouldUseNativeScroll = reducedMotion || isSafariBrowser();

  if (shouldUseNativeScroll) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      <LenisRegistrar />
      {children}
    </ReactLenis>
  );
}
