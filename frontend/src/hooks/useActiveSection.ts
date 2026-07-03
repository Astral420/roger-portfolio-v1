import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently "active" for nav-highlighting purposes.
 *
 * This intentionally avoids IntersectionObserver ratio comparisons: a section
 * that's taller than the viewport (e.g. Projects, which stacks several sticky
 * cards) only ever occupies a tiny fraction of its own bounding box on screen,
 * so it would never win a ratio-based comparison against shorter sections and
 * would never get highlighted. Instead we track a fixed "probe" line near the
 * top of the viewport and pick the last section whose top has scrolled past it.
 */
export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const probeRatio = 0.3;

    const computeActive = () => {
      const probeY = window.innerHeight * probeRatio;
      let current = elements[0].id;

      for (const el of elements) {
        if (el.getBoundingClientRect().top <= probeY) {
          current = el.id;
        }
      }

      return current;
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setActiveId(computeActive());
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [sectionIds]);

  return activeId;
}
