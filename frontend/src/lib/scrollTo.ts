export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });

  // Move focus for keyboard/screen-reader users after the scroll settles.
  window.setTimeout(() => {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, prefersReduced ? 0 : 400);
}
