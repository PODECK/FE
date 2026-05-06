/**
 * 배틀 엔진 불변 조건 검증 헬퍼
 *
 * 1. playerLives는 절대 증가하지 않음
 * 2. fainted === true면, phase는 awaitng_swap 또는 ended
 * 3. 동일 시드 -> 동일 결과 (결정론성, rng 주입으로 보장)
 * */
export class InvariantError extends Error {
  constructor(
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(`[Invariant] ${code}${context ? ` | ${JSON.stringify(context)}` : ''}`);
    this.name = 'InvariantError';
  }
}

// 가드 함수
export function invariant(condition: unknown, code: string, context?: Record<string, unknown>): asserts condition {
  if (!condition) {
    throw new InvariantError(code, context);
  }
}

// 현재 phase와 예상 phase가 일치하는지 검증
export function assertPhase(currentPhase: string, expectedPhase: string, eventType: string): void {
  invariant(currentPhase === expectedPhase, `ILLEGAL_ACTION`, {
    currentPhase,
    expectedPhase,
    eventType,
  });
}

// 배열 인덱스가 범위 내에 있는지 검증 후 값 반환
export function assertArrayIndex<T>(array: T[], index: number, code: string): T {
  invariant(index >= 0 && index < array.length, code, {
    arrayLength: array.length,
    index,
  });
  return array[index] as T;
}

// 값이 null/undefined가 아님을 검증 후 반환
export function assertDefined<T>(value: T | null | undefined, code: string, context?: Record<string, unknown>): T {
  invariant(value !== null && value !== undefined, code, context);
  return value;
}
