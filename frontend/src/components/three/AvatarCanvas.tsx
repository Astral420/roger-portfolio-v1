import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AvatarScene } from './AvatarScene';
import { usePointerPosition } from '../../hooks/usePointerPosition';
import { useReducedMotionPreference } from '../../hooks/useReducedMotion';

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

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          performance={{ min: 0.5 }}
        >
          <AvatarScene pointer={{ nx: pointer.nx, ny: pointer.ny }} reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
}
