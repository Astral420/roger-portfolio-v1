import { getLenisInstance } from "./lenisInstance";

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lenis = getLenisInstance();

  const focusEl = () => {
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  if (lenis) {
    lenis.scrollTo(el, {
      immediate: prefersReduced,
      onComplete: focusEl,
    });
    return;
  }

  el.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });

  // Move focus for keyboard/screen-reader users after the scroll settles.
  window.setTimeout(focusEl, prefersReduced ? 0 : 400);
}
