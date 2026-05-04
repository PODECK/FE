import { z } from 'zod';

// ai 난이도 (MVP에서는 2단계만)
export const AiLevel = z.enum(['easy', 'normal']);

// 층별 AI 구성 (tower floor 함수 하드코딩 스키마)
export const FloorConfig = z.object({
  floor: z.number().int().min(1).max(10),
  challengerName: z.string(),
  concept: z.string(), // 컨셉 테마 명칭
  aiLevel: AiLevel,
  pokemonPool: z.array(z.number().int().min(1).max(493)).min(6), // 6마리 풀
  levelRange: z.tuple([z.number().int().min(1), z.number().int().max(100)]),
  packReward: z.number().int().min(1),
});

// 무한의 탑 진행도 (영속 저장)
export const TowerProgress = z.object({
  currentFloor: z.number().int().min(1).max(10),
  maxClearedFloor: z.number().int().min(1).max(10).default(0), // 현재는 10층이 최대
  playerLives: z.number().int().min(0).max(4).default(4), // 플레이어 목숨
});

export const TowerClearResult = z.object({
  floor: z.number().int(),
  isVictory: z.boolean(),
  isSurrendered: z.boolean(),
  packReward: z.number().int().min(0),
  livesRemaining: z.number().int().min(0).max(4),
  isReset: z.boolean(), // 라이프 0으로 진행도 초기화 여부
});

export type AiLevel = z.infer<typeof AiLevel>;
export type FloorConfig = z.infer<typeof FloorConfig>;
export type TowerProgress = z.infer<typeof TowerProgress>;
export type TowerClearResult = z.infer<typeof TowerClearResult>;
