import { Suspense, useEffect, useState } from "react";
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

function CanvasLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-border/15 border-t-accent-from animate-spin" />
    </div>
  );
}

/** Lazy-loaded 3D avatar canvas. Keeps R3F/Three out of the main bundle. */
export default function AvatarCanvas() {
  const pointer = usePointerPosition();
  const reducedMotion = useReducedMotionPreference();
  const isVisible = useIsDocumentVisible();

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          performance={{ min: 0.5 }}
          // Fully stop rendering/animating while the tab is hidden or the
          // window is unfocused, instead of letting a huge accumulated delta
          // fire the moment the tab regains focus (which made the model spin).
          frameloop={isVisible ? "always" : "never"}
        >
          <AvatarScene
            pointer={{ nx: pointer.nx, ny: pointer.ny }}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
