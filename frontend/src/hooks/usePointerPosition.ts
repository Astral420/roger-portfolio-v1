import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

export interface PointerPosition {
  x: number;
  y: number;
  /** Position normalized to -1..1, useful for 3D look-at / parallax. */
  nx: number;
  ny: number;
}

export type PointerPositionRef = MutableRefObject<PointerPosition>;

const CENTER: PointerPosition = { x: 0, y: 0, nx: 0, ny: 0 };

export function usePointerPosition(): PointerPositionRef {
  const positionRef = useRef<PointerPosition>(CENTER);
  const frameRef = useRef<number | null>(null);
  const nextPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      nextPositionRef.current = { x: event.clientX, y: event.clientY };

      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;

        const nextPosition = nextPositionRef.current;
        if (!nextPosition) return;

        const nx = (nextPosition.x / window.innerWidth) * 2 - 1;
        const ny = (nextPosition.y / window.innerHeight) * 2 - 1;
        positionRef.current = { x: nextPosition.x, y: nextPosition.y, nx, ny };
      });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return positionRef;
}
