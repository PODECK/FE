'use client';

import { Canvas } from '@react-three/fiber';

export default function BattleCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
    </Canvas>
  );
}
