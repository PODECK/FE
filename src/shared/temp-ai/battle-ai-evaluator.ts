import type { BattleMove, BattlePokemon } from '@/shared/types';
import { getTypeEffectiveness } from '../../../data/type-chart';

export interface MoveEvaluation {
  moveIndex: number;
  move: BattleMove;
  score: number;
  expectedDamage: number;
  effectiveness: number;
  isUsable: boolean;
}

// 기술 1개의 평가 결과 반환
export function evaluateMove(move: BattleMove, attacker: BattlePokemon, defender: BattlePokemon): MoveEvaluation {
  const moveIndex = attacker.moves.indexOf(move);
  const isUsable = move.pp > 0;

  if (!isUsable) {
    return { moveIndex, move, score: -1, expectedDamage: 0, effectiveness: 1, isUsable: false };
  }

  // 변화기
  if (move.damageClass === 'status' || move.power === 0) {
    return { moveIndex, move, score: 1, expectedDamage: 0, effectiveness: 1, isUsable: true };
  }

  // 타입 상성
  const effectiveness = getTypeEffectiveness(move.type, defender.types);

  // 무효 기술
  if (effectiveness === 0) {
    return { moveIndex, move, score: 0, expectedDamage: 0, effectiveness: 0, isUsable: false };
  }

  // 자속 보정 (ex. 전기 타입 포켓몬은 전기 기술 위력이 올라감)
  const stabBonus = attacker.types.includes(move.type) ? 1.5 : 1.0;

  // 명중률
  const hitChance = move.accuracy === 0 ? 1 : move.accuracy / 100;

  // 공격/방어 스탯 선택
  const A = move.damageClass === 'physical' ? attacker.stats.attack : attacker.stats.specialAttack;
  const D = move.damageClass === 'physical' ? defender.stats.defense : defender.stats.specialDefense;

  // 4세대 공식 데미지 계산 (평균 랜덤 보정 0.925)
  const baseDamage = Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * move.power * (A / D)) / 50) + 2;

  const expectedDamage = baseDamage * stabBonus * effectiveness * 0.925 * hitChance;
  const score = expectedDamage;

  return { moveIndex, move, score, expectedDamage, effectiveness, isUsable: true };
}

// 모든 기술 평가 후 정렬
export function evaluateAllMoves(attacker: BattlePokemon, defender: BattlePokemon): MoveEvaluation[] {
  return attacker.moves.map((move) => evaluateMove(move, attacker, defender)).sort((a, b) => b.score - a.score);
}
