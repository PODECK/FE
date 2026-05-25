'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createHologramMaterial } from './CardHologramShader';

interface BattleCardProps {
  dexId: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  faceUp?: boolean;
  fainted?: boolean;
  isLegendary?: boolean;
}

const CARD_W = 0.7;
const CARD_H = 1.0;
const CARD_D = 0.01;

export default function BattleCard({
  dexId,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  faceUp = true,
  fainted = false,
  isLegendary = false,
}: BattleCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hologramMat = useRef<THREE.ShaderMaterial | null>(null);
  const [hovered, setHovered] = useState(false);

  const cardTexture = useTexture(`/images/pokemon-cards/${dexId}.png`);
  const backTexture = useTexture('/Selected=CARD_back.svg');

  const targetRotX = useRef(rotation[0]);
  const targetRotY = useRef(rotation[1]);

  useFrame((state, delta) => {
    if (hologramMat.current) {
      hologramMat.current.uniforms.uTime.value += delta;
    }

    if (!meshRef.current) return;

    if (fainted) {
      const side = position[1] < 0 ? -1 : 1;
      meshRef.current.position.y += side * 0.05;
      const mats = Array.isArray(meshRef.current.material) ? meshRef.current.material : [meshRef.current.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = Math.max(0, mat.opacity - 0.02);
      });
      return;
    }

    if (hovered) {
      const { x, y } = state.pointer;
      targetRotX.current = -y * 0.3;
      targetRotY.current = x * 0.3;
    } else {
      targetRotX.current = rotation[0];
      targetRotY.current = rotation[1];
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX.current, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY.current, 0.1);

    const targetZ = hovered ? position[2] + 0.2 : position[2];
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
  });

  const materials = useMemo(() => {
    const frontMat =
      isLegendary && faceUp
        ? createHologramMaterial(cardTexture)
        : faceUp
          ? new THREE.MeshStandardMaterial({ map: cardTexture })
          : new THREE.MeshStandardMaterial({ map: backTexture });

    return [
      new THREE.MeshStandardMaterial({ color: 0x333344 }),
      new THREE.MeshStandardMaterial({ color: 0x333344 }),
      new THREE.MeshStandardMaterial({ color: 0x333344 }),
      new THREE.MeshStandardMaterial({ color: 0x333344 }),
      frontMat,
      new THREE.MeshStandardMaterial({ map: backTexture }),
    ];
  }, [faceUp, cardTexture, backTexture, isLegendary]);

  useEffect(() => {
    if (isLegendary && faceUp && materials[4] instanceof THREE.ShaderMaterial) {
      hologramMat.current = materials[4] as THREE.ShaderMaterial;
    } else {
      hologramMat.current = null;
    }
  }, [isLegendary, faceUp, materials]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
      {materials.map((mat, i) => (
        <primitive key={i} attach={`material-${i}`} object={mat} />
      ))}
    </mesh>
  );
}
