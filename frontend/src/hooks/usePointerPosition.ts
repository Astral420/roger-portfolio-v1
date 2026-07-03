import { useEffect, useState } from 'react';

interface PointerPosition {
  x: number;
  y: number;
  /** Position normalized to -1..1, useful for 3D look-at / parallax. */
  nx: number;
  ny: number;
}

const CENTER: PointerPosition = { x: 0, y: 0, nx: 0, ny: 0 };

export function usePointerPosition() {
  const [position, setPosition] = useState<PointerPosition>(CENTER);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      setPosition({ x: event.clientX, y: event.clientY, nx, ny });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return position;
}
