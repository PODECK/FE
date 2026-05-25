'use client';

import { Html } from '@react-three/drei';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  position: [number, number, number];
}

export default function HealthBar({ currentHp, maxHp, position }: HealthBarProps) {
  const ratio = Math.max(0, Math.min(1, currentHp / maxHp));
  const color = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';

  return (
    <Html position={position} center>
      <div style={{ width: 80, pointerEvents: 'none' }}>
        <div style={{ background: '#2d2d44', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${ratio * 100}%`,
              height: '100%',
              background: color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: 9,
            textAlign: 'center',
            marginTop: 2,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {currentHp} / {maxHp}
        </div>
      </div>
    </Html>
  );
}
