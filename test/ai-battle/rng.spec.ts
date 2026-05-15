import { chance, createRng, damageRoll, generateSeed, randomInt, shuffle } from '@/shared/lib/rng';
import { describe, it, expect } from 'vitest';

describe('createRng', () => {
  it('같은 시드는 항상 같은 첫 번째 값을 반환', () => {
    expect(createRng(42)()).toBe(createRng(42)());
  });

  it('다른 시드는 다른 값을 반환', () => {
    expect(createRng(42)()).not.toBe(createRng(43)());
  });

  it('[0, 1) 범위의 값을 반환', () => {
    const rng = createRng(99);
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('generateSeed', () => {
  it('양의 정수 반환', () => {
    const seed = generateSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
  });
});

describe('randomInt', () => {
  it('min ~ max 범위의 정수 반환', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const value = randomInt(rng, 1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('min === max면 항상 min을 반환', () => {
    const rng = createRng(1);
    expect(randomInt(rng, 5, 5)).toBe(5);
  });
});

describe('shuffle', () => {
  it('원본 배열을 변경하지 않음', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(createRng(1), arr);
    expect(arr).toEqual(copy);
  });

  it('반환 배열은 원본과 동일한 요소를 갖고 있음', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(createRng(1), arr);
    expect(result.sort()).toEqual([...arr].sort());
  });

  it('같은 시드면 같은 순서로 섞임', () => {
    const arr = [1, 2, 3, 4, 5];
    const result1 = shuffle(createRng(42), arr);
    const result2 = shuffle(createRng(42), arr);
    expect(result1).toEqual(result2);
  });
});

describe('chance', () => {
  it('0이면 항상 false를 반환', () => {
    const rng = createRng(1);
    expect(chance(rng, 0)).toBe(false);
  });

  it('1이면 항상 true를 반환', () => {
    const rng = createRng(1);
    expect(chance(rng, 1)).toBe(true);
  });

  it('0.5이면 50% 확률로 true를 반환', () => {
    const rng = createRng(42);
    let trueCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (chance(rng, 0.5)) trueCount++;
    }
    expect(trueCount).toBeGreaterThan(400);
    expect(trueCount).toBeLessThan(600);
  });
});

describe('damageRoll', () => {
  it('4세대 이산값(0.85~1.00) 범위를 반환', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const value = damageRoll(rng);
      expect(value).toBeGreaterThanOrEqual(0.85);
      expect(value).toBeLessThanOrEqual(1.0);
    }
  });

  it('소수점 2자리 이산값(0.850~1.000) 범위를 반환', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const value = damageRoll(rng);
      expect(Math.round(value * 100) % 1).toBe(0);
    }
  });

  it('같은 시드면 같은 결과 반환', () => {
    expect(damageRoll(createRng(42))).toBe(damageRoll(createRng(42)));
  });
});
