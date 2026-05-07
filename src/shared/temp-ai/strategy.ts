import type { Rng } from '@/shared/lib/rng';
import type { MoveEvaluation } from '@/shared/temp-ai/battle-ai-evaluator';
import { evaluateAllMoves } from '@/shared/temp-ai/battle-ai-evaluator';
import type { AiLevel, BattlePokemon } from '@/shared/types';

// AI 기술 선택 전략
export function chooseMove(self: BattlePokemon, opponent: BattlePokemon, level: AiLevel, rng: Rng): number {
  // 사용 가능한 기술 인덱스
  const usableIndices = self.moves.map((_, i) => i).filter((i) => (self.moves[i].pp ?? 0) > 0);

  // 모든 기술 PP 소진 -> 버둥거리기(기술)
  if (usableIndices.length === 0) return -1;

  switch (level) {
    case 'easy':
      return chooseEasy(usableIndices, rng);
    case 'normal':
      return chooseNormal(self, opponent, usableIndices, rng);
  }
}

// 사용 가능한 기술 중 랜덤 선택
function chooseEasy(usableIndices: number[], rng: Rng): number {
  return usableIndices[Math.floor(rng() * usableIndices.length)];
}

// 정규 난이도 기술 선택
function chooseNormal(self: BattlePokemon, opponent: BattlePokemon, usableIndices: number[], rng: Rng): number {
  // 20% 확률로 랜덤 기술 선택
  if (rng() > 0.8) {
    return chooseEasy(usableIndices, rng);
  }

  // 80% 확률로 평가 기술 선택
  const ranked = evaluateAllMoves(self, opponent).filter((e: MoveEvaluation) => usableIndices.includes(e.moveIndex));

  if (ranked.length === 0) return chooseEasy(usableIndices, rng);

  // 평가 기술 중 가장 높은 점수 기술 선택
  return ranked[0].moveIndex;
}

/**
 * AI 포켓몬 기절 후 다음 포켓몬 인덱스 반환
 *
 * MVP 규칙:
 * - **AI는 자발적 교체 없음** 기절 시 강제 교체만
 * - 살아있는 포켓몬 중 시드 기반 랜덤 선택
 *
 * @return 교체할 팀 인덱스, -1이면 교체 불가 (패배)
 */
export function chooseForceSwap(team: BattlePokemon[], activeIndex: number, rng: Rng): number {
  const availableIndices = team.map((_, i) => i).filter((i) => i !== activeIndex && !team[i]!.fainted);

  if (availableIndices.length === 0) return -1;

  return availableIndices[Math.floor(rng() * availableIndices.length)]!;
}
