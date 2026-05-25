'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

interface ParticlePreset {
  color: string;
  count: number;
  spread: number;
}

const ATTACK_PARTICLES: Record<string, ParticlePreset> = {
  fire: { color: '#FF4500', count: 80, spread: 0.8 },
  water: { color: '#1E90FF', count: 60, spread: 0.6 },
  electric: { color: '#FFD700', count: 100, spread: 1.2 },
  grass: { color: '#32CD32', count: 50, spread: 0.5 },
  psychic: { color: '#FF69B4', count: 70, spread: 1.0 },
  rock: { color: '#A0522D', count: 55, spread: 0.7 },
  ice: { color: '#00BFFF', count: 65, spread: 0.8 },
  fighting: { color: '#FF6347', count: 60, spread: 0.6 },
  poison: { color: '#9400D3', count: 55, spread: 0.6 },
  ground: { color: '#DAA520', count: 50, spread: 0.7 },
  flying: { color: '#87CEEB', count: 60, spread: 1.0 },
  bug: { color: '#6B8E23', count: 50, spread: 0.5 },
  ghost: { color: '#483D8B', count: 70, spread: 0.9 },
  steel: { color: '#C0C0C0', count: 55, spread: 0.5 },
  dragon: { color: '#6A0DAD', count: 90, spread: 1.1 },
  dark: { color: '#2F4F4F', count: 60, spread: 0.8 },
  fairy: { color: '#FFB6C1', count: 65, spread: 0.9 },
  normal: { color: '#D3D3D3', count: 45, spread: 0.5 },
};

const DEFAULT_PRESET: ParticlePreset = { color: '#FFFFFF', count: 50, spread: 0.7 };

const ParticleCloud = ({ preset, origin, color }: { preset: ParticlePreset; origin: THREE.Vector3; color: string }) => {
  const count = preset.count;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const velocitiesRef = useRef<number[] | null>(null);

  const age = useRef(0);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  // Initialize velocities only once using useEffect
  useEffect(() => {
    if (velocitiesRef.current == null) {
      const v: number[] = [];
      for (let i = 0; i < count; i++) {
        v.push(
          (Math.random() - 0.5) * preset.spread * 2,
          (Math.random() - 0.5) * preset.spread * 2,
          (Math.random() - 0.5) * preset.spread,
        );
      }
      velocitiesRef.current = v;
    }
  }, [count, preset.spread]);

  useFrame((_, delta) => {
    age.current += delta;
    if (!geoRef.current || !velocitiesRef.current) return;
    const pos = geoRef.current.attributes.position as THREE.BufferAttribute;
    const velocities = velocitiesRef.current;
    for (let i = 0; i < count; i++) {
      const t = age.current;
      pos.setXYZ(
        i,
        origin.x + velocities[i * 3]! * t,
        origin.y + velocities[i * 3 + 1]! * t - 0.5 * t * t,
        origin.z + velocities[i * 3 + 2]! * t,
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
};

export default function AttackParticles() {
  const attackEffect = useBattleStore((state) => state.attackEffect);
  const clearAttackEffect = useBattleStore((state) => state.clearAttackEffect);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!attackEffect) return;
    timerRef.current = setTimeout(() => clearAttackEffect(), 1200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [attackEffect, clearAttackEffect]);

  if (!attackEffect) return null;

  const preset = ATTACK_PARTICLES[attackEffect.pokemonType] ?? DEFAULT_PRESET;
  const origin = new THREE.Vector3(
    attackEffect.attackerSide === 'player' ? -0.5 : 0.5,
    attackEffect.attackerSide === 'player' ? -1.0 : 1.0,
    0.5,
  );

  return <ParticleCloud preset={preset} origin={origin} color={preset.color} />;
}
