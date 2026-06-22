import { describe, it, expect } from 'vitest';
import { createRng } from '@/shared/lib/rng';
import { MOCK_BULBASAUR, MOCK_CHARMANDER, MOCK_AI_TEAM } from '@/shared/temp-ai/__mocks__/mock-pokemon';
import { chooseMove, chooseForceSwap } from '@/shared/temp-ai/strategy';

describe('chooseMove', () => {
  it('같은 시드는 항상 같은 기술을 선택한다 (결정론성)', () => {
    const move1 = chooseMove(MOCK_BULBASAUR, MOCK_CHARMANDER, 'easy', createRng(42));
    const move2 = chooseMove(MOCK_BULBASAUR, MOCK_CHARMANDER, 'easy', createRng(42));
    expect(move1).toBe(move2);
  });

  it('모든 PP가 소진되면 -1을 반환한다 (버둥거리기)', () => {
    const exhausted = {
      ...MOCK_BULBASAUR,
      moves: MOCK_BULBASAUR.moves.map((m) => ({ ...m, pp: 0 })),
    };
    expect(chooseMove(exhausted, MOCK_CHARMANDER, 'easy', createRng(1))).toBe(-1);
    expect(chooseMove(exhausted, MOCK_CHARMANDER, 'normal', createRng(1))).toBe(-1);
  });

  it('반환값은 0~3 범위의 유효한 인덱스다', () => {
    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const result = chooseMove(MOCK_BULBASAUR, MOCK_CHARMANDER, 'easy', rng);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(3);
    }
  });

  it('PP가 0인 기술 인덱스는 선택하지 않는다', () => {
    const firstExhausted = {
      ...MOCK_BULBASAUR,
      moves: MOCK_BULBASAUR.moves.map((m, i) => ({ ...m, pp: i === 0 ? 0 : m.pp })),
    };

    const rng = createRng(1);
    for (let i = 0; i < 50; i++) {
      const result = chooseMove(firstExhausted, MOCK_CHARMANDER, 'easy', rng);
      expect(result).not.toBe(0);
    }
  });

  describe('Normal 난이도', () => {
    it('높은 점수 기술을 대부분 선택한다 (80% 이상)', () => {
      let bestCount = 0;
      const totalTrials = 1000;

      // Normal AI: 파이리 vs 이상해씨 → 불꽃 기술(index 0)이 최고 점수
      for (let i = 0; i < totalTrials; i++) {
        const rng = createRng(i);
        const result = chooseMove(MOCK_CHARMANDER, MOCK_BULBASAUR, 'normal', rng);
        if (result === 0) bestCount++; // 불꽃세례
      }

      // 80% 이상 최적 기술 선택
      expect(bestCount / totalTrials).toBeGreaterThan(0.7);
    });
  });
});

describe('chooseForceSwap', () => {
  it('기절한 포켓몬은 선택하지 않는다', () => {
    const faintedTeam = MOCK_AI_TEAM.map((p, i) => (i === 0 ? { ...p, fainted: true } : p));
    const result = chooseForceSwap(faintedTeam, 0, createRng(1));
    expect(faintedTeam[result]?.fainted).toBe(false);
  });

  it('현재 출전 중인 포켓몬은 선택하지 않는다', () => {
    const result = chooseForceSwap(MOCK_AI_TEAM, 0, createRng(1));
    expect(result).not.toBe(0);
  });

  it('교체 가능한 포켓몬이 없으면 -1을 반환한다', () => {
    const allFainted = MOCK_AI_TEAM.map((p, i) => (i === 0 ? p : { ...p, fainted: true }));
    expect(chooseForceSwap(allFainted, 0, createRng(1))).toBe(-1);
  });

  it('같은 시드면 같은 교체 대상을 선택한다 (결정론성)', () => {
    const r1 = chooseForceSwap(MOCK_AI_TEAM, 0, createRng(42));
    const r2 = chooseForceSwap(MOCK_AI_TEAM, 0, createRng(42));
    expect(r1).toBe(r2);
  });

  it('반환값은 유효한 팀 인덱스다', () => {
    const result = chooseForceSwap(MOCK_AI_TEAM, 0, createRng(1));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(MOCK_AI_TEAM.length);
  });
});
