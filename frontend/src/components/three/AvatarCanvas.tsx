import { Suspense, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { AvatarScene } from "./AvatarScene";
import { usePointerPosition } from "../../hooks/usePointerPosition";
import { useReducedMotionPreference } from "../../hooks/useReducedMotion";

/** Tracks document visibility so the R3F render loop can pause while the tab is hidden. */
function useIsDocumentVisible() {
  const [visible, setVisible] = useState(
    () => document.visibilityState === "visible",
  );

  useEffect(() => {
    const onVisibilityChange = () =>
      setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return visible;
}

/** Tracks whether the canvas is near the viewport so WebGL can fully pause off-screen. */
function useIsElementInViewport(ref: RefObject<Element | null>) {
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      {
        root: null,
        // Start rendering slightly before the avatar enters the viewport.
        rootMargin: "160px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inViewport;
}


function CanvasLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-border/15 border-t-accent-from animate-spin" />
    </div>
  );
}

/** Lazy-loaded 3D avatar canvas. Keeps R3F/Three out of the main bundle. */
export default function AvatarCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = usePointerPosition();
  const reducedMotion = useReducedMotionPreference();
  const isDocumentVisible = useIsDocumentVisible();
  const isInViewport = useIsElementInViewport(containerRef);
  const shouldRender = isDocumentVisible && isInViewport;

  return (
    <div ref={containerRef} className="relative h-full w-full" aria-hidden="true">
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          performance={{ min: 0.5 }}
          // Demand-render while visible, and fully stop when hidden/off-screen.
          // AvatarScene invalidates each visible frame to keep the subtle idle
          // animation alive without spending GPU time after the hero scrolls away.
          frameloop={shouldRender ? "demand" : "never"}
        >
          <AvatarScene
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
