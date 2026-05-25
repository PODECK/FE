'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import BattleField from './BattleField';
import PlayerDeckZone from './zones/PlayerDeckZone';
import EnemyDeckZone from './zones/EnemyDeckZone';
import DropZone from './zones/DropZone';
import AttackParticles from './effects/AttackParticles';
import HitEffect from './effects/HitEffect';
import ScreenShake from './effects/ScreenShake';
import BattleCamera from './camera/BattleCamera';

export default function BattleCanvas() {
  return (
    <Canvas className="absolute inset-0" gl={{ antialias: true, alpha: true }}>
      <BattleCamera />
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <BattleField />
        <PlayerDeckZone />
        <EnemyDeckZone />
        <DropZone position={[0, -1.2, 0]} side="player" />
        <DropZone position={[0, 1.8, 0]} side="enemy" />
        <AttackParticles />
        <HitEffect />
      </Suspense>
      <ScreenShake />
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
