'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import BattleField from './BattleField';
import PlayerDeckZone from './zones/PlayerDeckZone';
import EnemyDeckZone from './zones/EnemyDeckZone';
import DropZone from './zones/DropZone';
import AttackParticles from './effects/AttackParticles';

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
        <DropZone position={[0, -1.2, 0]} side="player" />
        <DropZone position={[0, 1.8, 0]} side="enemy" />
        <AttackParticles />
      </Suspense>
    </Canvas>
  );
}
