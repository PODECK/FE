// 배틀 기술 데미지 계산 순수 함수

import { getTypeEffectiveness } from '../../../../data/type-chart';

import type { BattleMove, BattlePokemon } from '@/shared/types/pokemon';

export function calculateMoveDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  roll: number,
): number {
  if (move.power === 0 || move.damageClass === 'status') return 0;

  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  if (effectiveness === 0) return 0;

  const attack = move.damageClass === 'physical' ? attacker.stats.attack : attacker.stats.specialAttack;
  const defense = move.damageClass === 'physical' ? defender.stats.defense : defender.stats.specialDefense;
  const base = Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * move.power * (attack / defense)) / 50) + 2;
  const stab = attacker.types.includes(move.type) ? 1.5 : 1.0;

  return Math.max(1, Math.floor(base * stab * effectiveness * roll));
}

export function calculateStruggleDamage(attacker: BattlePokemon, defender: BattlePokemon, roll: number): number {
  const base =
    Math.floor(
      (Math.floor((2 * attacker.level) / 5 + 2) * 50 * (attacker.stats.attack / defender.stats.defense)) / 50,
    ) + 2;
  return Math.max(1, Math.floor(base * roll));
}
