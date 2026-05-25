'use client';

import { useState } from 'react';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

const ZONE_W = 1.2;
const ZONE_H = 1.6;

interface DropZoneProps {
  position: [number, number, number];
  side: 'player' | 'enemy';
}

export default function DropZone({ position, side }: DropZoneProps) {
  const [highlighted, setHighlighted] = useState(false);
  const phase = useBattleStore((state) => state.phase);
  const canDrop = phase === 'awaiting_action' && side === 'player';

  return (
    <mesh
      position={position}
      onPointerEnter={() => canDrop && setHighlighted(true)}
      onPointerLeave={() => setHighlighted(false)}
    >
      <planeGeometry args={[ZONE_W, ZONE_H]} />
      <meshStandardMaterial
        color={highlighted ? 0x44aaff : 0x223366}
        transparent
        opacity={highlighted ? 0.35 : 0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const PLAYER_DROP_ZONE = {
  center: new THREE.Vector3(0, -1.2, 0),
  size: { width: ZONE_W, height: ZONE_H },
};

export const ENEMY_DROP_ZONE = {
  center: new THREE.Vector3(0, 1.8, 0),
  size: { width: ZONE_W, height: ZONE_H },
};
