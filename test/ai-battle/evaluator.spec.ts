import { MOCK_BULBASAUR, MOCK_CHARMANDER } from '@/shared/temp-ai/__mocks__/mock-pokemon';
import { evaluateAllMoves, evaluateMove } from '@/shared/temp-ai/battle-ai-evaluator';
import { describe, expect, it } from 'vitest';
import type { PokemonType } from '@/shared/types/pokemon';

describe('evaluateMove', () => {
  it('PP가 0인 기술은 isUsable: false를 반환', () => {
    const exhaustedMove = {
      ...MOCK_CHARMANDER.moves[0]!,
      pp: 0,
    };
    const attacker = {
      ...MOCK_CHARMANDER,
      moves: [exhaustedMove, ...MOCK_CHARMANDER.moves.slice(1)],
    };
    const result = evaluateMove(exhaustedMove, attacker, MOCK_BULBASAUR);
    expect(result.isUsable).toBe(false);
    expect(result.score).toBe(-1);
  });

  it('변화기(power 0)는 score: 1을 반환', () => {
    const statusMove = MOCK_CHARMANDER.moves.find((m) => m.damageClass === 'status')!;
    const result = evaluateMove(statusMove, MOCK_CHARMANDER, MOCK_BULBASAUR);

    expect(result.score).toBe(1);
    expect(result.isUsable).toBe(true);
  });

  it('무효 타입(effectiveness 0)은 score: 0을 반환', () => {
    const normalMove = MOCK_CHARMANDER.moves.find((m) => m.type === 'normal' && m.power > 0)!;
    const ghostTypes: PokemonType[] = ['ghost'];
    const ghostPokemon = { ...MOCK_BULBASAUR, types: ghostTypes };

    const result = evaluateMove(normalMove, MOCK_CHARMANDER, ghostPokemon);

    expect(result.effectiveness).toBe(0);
    expect(result.score).toBe(0);
  });

  it('불꽃 기술 vs 풀타입 effectiveness: 2.0', () => {
    const fireMove = MOCK_CHARMANDER.moves.find((m) => m.type === 'fire' && m.power > 0)!;

    const result = evaluateMove(fireMove, MOCK_CHARMANDER, MOCK_BULBASAUR);

    expect(result.effectiveness).toBe(2.0);
    expect(result.score).toBeGreaterThan(0);
  });

  it('STAB(자속)이 적용된 기술은 더 높은 점수', () => {
    const fireMove = MOCK_CHARMANDER.moves.find((m) => m.type === 'fire' && m.power > 0)!;
    const normalMove = {
      ...fireMove,
      type: 'normal' as const,
      id: 'normal-move',
    };
    const withStab = evaluateMove(fireMove, MOCK_CHARMANDER, MOCK_BULBASAUR);
    const withoutStab = evaluateMove(normalMove, MOCK_CHARMANDER, MOCK_BULBASAUR);

    expect(withStab.score).toBeGreaterThan(withoutStab.score);
  });
});

describe('evaluateAllMoves', () => {
  it('점수 내림차순으로 정렬된 배열 반환', () => {
    const ranked = evaluateAllMoves(MOCK_CHARMANDER, MOCK_BULBASAUR);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i]!.score).toBeGreaterThanOrEqual(ranked[i + 1]!.score);
    }
  });

  it('불꽃 기술이 1순위로 평가 (불꽃 vs 풀: 2배 상성)', () => {
    const ranked = evaluateAllMoves(MOCK_CHARMANDER, MOCK_BULBASAUR);
    const best = ranked.find((e) => e.isUsable)!;
    expect(best.move.type).toBe('fire');
  });

  it('4개 기술 전부 평가 (파이리: 4개 기술)', () => {
    const ranked = evaluateAllMoves(MOCK_BULBASAUR, MOCK_CHARMANDER);
    expect(ranked).toHaveLength(4);
  });
});
