import { describe, it, expect } from 'vitest';
import { buildAiDeck, MockPokemonDataSource } from '@/shared/temp-ai/deck-builder';
import { getFloorConfig } from '@/shared/config/tower-floors';
import { createRng } from '@/shared/lib/rng';
import { InvariantError } from '@/shared/lib/invariant';

describe('buildAiDeck', () => {
  it('같은 시드면 같은 덱을 생성한다 (결정론성)', () => {
    const floor = getFloorConfig(1);
    const deck1 = buildAiDeck(floor, createRng(42));
    const deck2 = buildAiDeck(floor, createRng(42));

    expect(deck1.map((p) => p.dexId)).toEqual(deck2.map((p) => p.dexId));
    expect(deck1.map((p) => p.level)).toEqual(deck2.map((p) => p.level));
  });

  it('다른 시드면 다른 덱을 생성한다', () => {
    const floor = getFloorConfig(1);
    const deck1 = buildAiDeck(floor, createRng(1));
    const deck2 = buildAiDeck(floor, createRng(2));

    // 완전히 같을 확률은 매우 낮음
    const same = deck1.every((p, i) => p.dexId === deck2[i]?.dexId);
    expect(same).toBe(false);
  });

  it('덱 사이즈는 최대 6마리다', () => {
    const floor = getFloorConfig(1);
    const deck = buildAiDeck(floor, createRng(1));
    expect(deck.length).toBeLessThanOrEqual(6);
    expect(deck.length).toBeGreaterThanOrEqual(3);
  });

  it('레벨은 levelRange 범위 안에 있다', () => {
    const floor = getFloorConfig(1);
    const [min, max] = floor.levelRange;
    const deck = buildAiDeck(floor, createRng(1));

    deck.forEach((p) => {
      expect(p.level).toBeGreaterThanOrEqual(min);
      expect(p.level).toBeLessThanOrEqual(max);
    });
  });

  it('pokemonPool이 3마리 미만이면 InvariantError를 던진다', () => {
    const invalidFloor = {
      ...getFloorConfig(1),
      pokemonPool: [1, 2],
    };

    expect(() => buildAiDeck(invalidFloor as any, createRng(1))).toThrow(InvariantError);
  });

  it('각 포켓몬은 고유한 instanceId를 갖는다', () => {
    const floor = getFloorConfig(1);
    const deck = buildAiDeck(floor, createRng(1));
    const ids = deck.map((p) => p.instanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('moves 배열은 공유 참조가 아니다 (깊은 복사)', () => {
    const floor = getFloorConfig(1);
    const deck = buildAiDeck(floor, createRng(1));

    // 첫 번째 포켓몬 PP 수정
    deck[0]!.moves[0]!.pp = 0;

    // 두 번째 포켓몬 PP는 영향받지 않아야 함
    expect(deck[1]!.moves[0]!.pp).toBeGreaterThan(0);
  });
});

describe('MockPokemonDataSource', () => {
  it('counter 기반으로 고유한 instanceId를 생성한다', () => {
    const source = new MockPokemonDataSource();
    const p1 = source.getPokemon(1, 5);
    const p2 = source.getPokemon(1, 5);

    expect(p1.instanceId).not.toBe(p2.instanceId);
  });

  it('레벨이 HP에 반영된다', () => {
    const source = new MockPokemonDataSource();
    const low = source.getPokemon(1, 5);
    const high = source.getPokemon(1, 20);

    expect(high.maxHp).toBeGreaterThan(low.maxHp);
  });

  it('currentHp와 maxHp가 동일하다 (배틀 시작 전 풀피)', () => {
    const source = new MockPokemonDataSource();
    const p = source.getPokemon(1, 10);

    expect(p.currentHp).toBe(p.maxHp);
  });
});
