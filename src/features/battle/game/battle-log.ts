// 배틀 로그 문장 생성 및 React HUD 전달 유틸리티
import type { BattleMove, BattlePokemon } from '@/shared/types/pokemon';

export type BattleSide = 'player' | 'opponent';

export function dispatchBattleLog(message: string): void {
  window.dispatchEvent(new CustomEvent('battle:log', { detail: { message } }));
}

export function createAttackLogMessage(side: BattleSide, attacker: BattlePokemon, move: BattleMove): string {
  const owner = side === 'player' ? '플레이어' : '도전자';
  const subjectParticle = hasKoreanFinalConsonant(attacker.koName) ? '이' : '가';
  return `${owner}의 ${attacker.koName}${subjectParticle} ${move.koName}로 공격!`;
}

function hasKoreanFinalConsonant(value: string): boolean {
  const lastChar = value.trim().at(-1);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0);
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;
  if (code < hangulStart || code > hangulEnd) return false;

  return (code - hangulStart) % 28 !== 0;
}
