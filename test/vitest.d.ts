// Vitest 패키지 타입 해석 실패 시 테스트 파일 타입 검사를 보조하는 선언
type VitestTestCallback = () => void | Promise<void>;

interface VitestTestFunction {
  (name: string, callback: VitestTestCallback): void;
}

interface VitestMatchers {
  not: VitestMatchers;
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toThrow(expected?: unknown): void;
  toHaveLength(expected: number): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
}

interface VitestExpect {
  (actual: unknown): VitestMatchers;
}

declare module 'vitest' {
  export const describe: VitestTestFunction;
  export const it: VitestTestFunction;
  export const expect: VitestExpect;
}

declare module 'vitest/config' {
  export function defineConfig(config: unknown): unknown;
}
