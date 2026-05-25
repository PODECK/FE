'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

export default function HitEffect() {
  const attackEffect = useBattleStore((state) => state.attackEffect);
  const meshRef = useRef<THREE.Mesh>(null);
  const age = useRef(0);

  useEffect(() => {
    age.current = 0;
  }, [attackEffect]);

  useFrame((_, delta) => {
    if (!meshRef.current || !attackEffect) return;
    age.current += delta;

    const opacity = Math.max(0, 1 - age.current * 4);
    const scale = 1 + age.current * 3;
    meshRef.current.scale.setScalar(scale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  if (!attackEffect) return null;

  const hitX = attackEffect.attackerSide === 'player' ? 0.5 : -0.5;
  const hitY = attackEffect.attackerSide === 'player' ? 1.8 : -1.2;

  return (
    <mesh ref={meshRef} position={[hitX, hitY, 0.3]}>
      <circleGeometry args={[0.25, 16]} />
      <meshBasicMaterial color={0xffffff} transparent opacity={1} />
    </mesh>
  );
}
