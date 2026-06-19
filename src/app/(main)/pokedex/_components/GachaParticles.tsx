'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const colors = ['#FFB41D', '#FFD166', '#A78BFA', '#C4B5FD', '#FF8FAB', '#5EEAD4'];

export default function GachaParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    instanceRef.current = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const id = setTimeout(() => {
      const fire = instanceRef.current;
      if (!fire) return;
      fire({
        particleCount: 14,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.2 },
        colors: colors,
        shapes: ['square', 'circle'],
        gravity: 0.9,
        scalar: 1.4,
        drift: 0.2,
      });
      fire({
        particleCount: 14,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.2 },
        colors: colors,
        shapes: ['square', 'circle'],
        gravity: 0.9,
        scalar: 1.4,
        drift: -0.2,
      });
    }, 50);

    return () => {
      clearTimeout(id);
      instanceRef.current?.reset();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
