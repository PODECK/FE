import { z } from 'zod';

// 도감 엔트리
export const DexEntry = z.object({
  dexId: z.number().int().min(1).max(493),
  discovered: z.boolean().default(false), // 획득 여부
});

// 소유 중인 포켓몬
export const OwnedPokemon = z.object({
  instanceId: z.string(),
  dexId: z.number().int().min(1).max(493),
  level: z.number().int().min(1).max(100),
  obtainedAt: z.number(), // 획득 시간 (Date.now())
});

// 배틀에 가져갈 포켓몬
export const ActiveDeck = z.object({
  instanceIds: z
    .array(z.string())
    .min(3, '포켓몬이 3마리 이상 필요합니다.')
    .max(6, '포켓몬이 6마리 이하여야 합니다.')
    .refine((ids) => new Set(ids).size === ids.length, '중복된 포켓몬이 있습니다.'),
});

// 카드팩 뽑기 결과
export const PackPullResult = z.object({
  dexId: z.number().int().min(1).max(493),
  isNew: z.boolean(),
  isOwned: z.boolean(),
});

// 카드팩에서 카드 5장 뽑기 결과
export const PackOpenResult = z.object({
  cards: z.array(PackPullResult).length(5),
  newCount: z.number().int().min(0).max(5),
  ownedCount: z.number().int().min(0).max(5),
});

// 게임 통계
export const GameStats = z.object({
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
});

// 게임 영속 데이터
export const GamePersistState = z.object({
  nickname: z.string().nullable(),
  dex: z.record(z.string(), DexEntry),
  inventory: z.array(OwnedPokemon), // 소유 중인 포켓몬 배열
  activeDeckIds: z.array(z.string()), // 배틀에 가져갈 포켓몬 ID 배열
  packInventory: z.number().int().min(0).default(0),
  stats: GameStats,
  settings: z.object({
    bgmVolume: z.number().min(0).max(100).default(50),
  }),
});

export type DexEntry = z.infer<typeof DexEntry>;
export type OwnedPokemon = z.infer<typeof OwnedPokemon>;
export type Inventory = OwnedPokemon[];
export type ActiveDeck = z.infer<typeof ActiveDeck>;
export type PackPullResult = z.infer<typeof PackPullResult>;
export type PackOpenResult = z.infer<typeof PackOpenResult>;
export type GameStats = z.infer<typeof GameStats>;
export type GamePersistState = z.infer<typeof GamePersistState>;
