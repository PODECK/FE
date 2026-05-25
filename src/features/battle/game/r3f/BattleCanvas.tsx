'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import BattleField from './BattleField';
import PlayerDeckZone from './zones/PlayerDeckZone';
import EnemyDeckZone from './zones/EnemyDeckZone';

export default function BattleCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <BattleField />
        <PlayerDeckZone />
        <EnemyDeckZone />
      </Suspense>
    </Canvas>
  );
}
