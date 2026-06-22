import { z } from 'zod';

// 포켓몬 타입
export const PokemonType = z.enum([
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]);

// 기술 타입 (물리, 특수, 상태)
export const DamageClass = z.enum(['physical', 'special', 'status']);

// 기술 정보
export const BattleMove = z.object({
  id: z.string(), // PokeAPI 기술 고유 아이디
  koName: z.string(),
  type: PokemonType,
  damageClass: DamageClass,
  power: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  pp: z.number().int().positive(),
  maxPp: z.number().int().positive(),
});

// 포켓몬 기본 능력치
export const BaseStats = z.object({
  hp: z.number().int().positive(),
  attack: z.number().int().positive(),
  defense: z.number().int().positive(),
  specialAttack: z.number().int().positive(),
  specialDefense: z.number().int().positive(),
  speed: z.number().int().positive(),
});

// 배틀 중 포켓몬 상태
export const BattlePokemon = z.object({
  instanceId: z.string(), // 소유 카드 인스턴스 ID
  dexId: z.number().int().min(1).max(493), // 포켓몬 데이터베이스 고유 아이디
  koName: z.string(),
  level: z.number().int().min(1).max(100),
  types: z.array(PokemonType).min(1).max(2),
  currentHp: z.number().int().min(0),
  maxHp: z.number().int().positive(),
  stats: BaseStats,
  moves: z.array(BattleMove).length(4), // 4개 고정 기술
  fainted: z.boolean().default(false),
  spriteUrl: z.string().url(), // 포켓몬 스프라이트 이미지 URL
});

// 데미지 결과
export const DamageResult = z.object({
  damage: z.number().int().min(0),
  effectiveness: z.number().min(0).max(4), // 0, 0.5, 1, 2, 4
  isMiss: z.boolean(),
});

// 도감용 정적 포켓몬 데이터 (data/pokemon.json 스키마)
export const PokemonData = z.object({
  dexId: z.number().int().min(1).max(493),
  koName: z.string(),
  enName: z.string(),
  types: z.array(PokemonType).min(1).max(2),
  baseStats: BaseStats,
  spriteUrl: z.string(), // url or 상대 경로
  artworkUrl: z.string(),
  generation: z.number().int().min(1).max(4),
  evolutionStage: z.number().int().min(1).max(3), // 1: 1세대, 2: 2세대, 3: 3세대
  evolvesFromDexId: z.number().int().nullable(), // 진화 전 포켓몬 dexId
  evolvesAtFloor: z.number().int().nullable(), // 몇 층 클리어 시 진화 (없으면 null)

  // 도감 카드 상세 정보
  category: z.string(),
  height: z.number(),
  weight: z.number(),
  flavorText: z.string(),
  ability: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

// 기술 정적 데이터 (data/moves.json 스키마)
export const MoveData = z.object({
  id: z.string(),
  koName: z.string(),
  enName: z.string(),
  type: PokemonType,
  damageClass: DamageClass,
  power: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  pp: z.number().int().positive(),
});

// infer types
export type PokemonType = z.infer<typeof PokemonType>;
export type DamageClass = z.infer<typeof DamageClass>;
export type BattleMove = z.infer<typeof BattleMove>;
export type BaseStats = z.infer<typeof BaseStats>;
export type BattlePokemon = z.infer<typeof BattlePokemon>;
export type DamageResult = z.infer<typeof DamageResult>;
export type PokemonData = z.infer<typeof PokemonData>;
export type MoveData = z.infer<typeof MoveData>;
