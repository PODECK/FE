'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import BattleCard from '../card/BattleCard';
import { useBattleStore } from '@/shared/stores/battleStore';

const FAN_RADIUS = 4.0;
const FAN_CY = 6.0;
const MAX_ANGLE_DEG = 40;

function calcEnemyFanPos(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, FAN_CY - FAN_RADIUS, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = -MAX_ANGLE_DEG / 2 + step * index + 90;
  const rad = THREE.MathUtils.degToRad(deg);
  return [Math.cos(rad) * FAN_RADIUS, FAN_CY + Math.sin(rad) * FAN_RADIUS, index * 0.01];
}

function calcEnemyFanRotation(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, 0, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = MAX_ANGLE_DEG / 2 - step * index;
  return [0, 0, THREE.MathUtils.degToRad(deg)];
}

export default function EnemyDeckZone() {
  const enemyTeam = useBattleStore((state) => state.enemyTeam);
  const alive = enemyTeam.filter((p) => !p.fainted);

  const cards = useMemo(
    () =>
      alive.map((pokemon, i) => ({
        pokemon,
        position: calcEnemyFanPos(i, alive.length) as [number, number, number],
        rotation: calcEnemyFanRotation(i, alive.length) as [number, number, number],
      })),
    [alive],
  );

  return (
    <>
      {cards.map(({ pokemon, position, rotation }) => (
        <BattleCard key={pokemon.dexId} dexId={pokemon.dexId} position={position} rotation={rotation} faceUp={false} />
      ))}
    </>
  );
}
