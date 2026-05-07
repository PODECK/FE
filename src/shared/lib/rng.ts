export type Rng = () => number;

// 랜덤 시드 기반 RNG 생성
export function createRng(seed: number): Rng {
  let s = seed >>> 0;

  // mulberry32 알고리즘
  return function (): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// 현재 시간 기반 시드 생성
export function generateSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// fisher yates 셔플 알고리즘
export function shuffle<T>(rng: Rng, array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

// 확률 (0.0 ~ 1.0) 체크
export function chance(rng: Rng, probability: number): boolean {
  if (probability <= 0) return false;
  if (probability >= 1) return true;

  return rng() < probability;
}

// 4세대 데미지 랜덤 보정값 반환 (0.85 ~ 1.00)
export function damageRoll(rng: Rng): number {
  return (Math.floor(rng() * 16) + 85) / 100;
}
