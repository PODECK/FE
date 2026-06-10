import { z } from 'zod';
import { PokemonType } from '@/shared/types/pokemon';

export const RECOMMENDATION_THEMES = ['optimal', 'status', 'counter'] as const;

export const RosterMoveSchema = z.object({
  id: z.string(),
  koName: z.string(),
  type: PokemonType,
  power: z.number().nullable(),
  statusEffect: z.string().nullable(),
});

export const RosterPokemonSchema = z.object({
  dexId: z.number(),
  koName: z.string(),
  type1: PokemonType,
  type2: PokemonType.nullable(),
  level: z.number(),
  baseStatTotal: z.number(),
  moves: z.array(RosterMoveSchema),
});

export const RecommendRequestSchema = z
  .object({
    theme: z.enum(RECOMMENDATION_THEMES),
    counterTarget: PokemonType.optional(),
  })
  .refine((data) => data.theme !== 'counter' || data.counterTarget !== undefined, {
    message: 'counter 테마에는 counterTarget이 필요합니다',
    path: ['counterTarget'],
  });

export const RecommendedDeckSchema = z.object({
  title: z.string(),
  description: z.string(),
  deck: z
    .array(
      z.object({
        dexId: z.number(),
        role: z.string(),
        reason: z.string(),
      }),
    )
    .min(3)
    .max(6),
  strategy: z.string(),
});

export type RosterMove = z.infer<typeof RosterMoveSchema>;
export type RosterPokemon = z.infer<typeof RosterPokemonSchema>;
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
export type RecommendedDeck = z.infer<typeof RecommendedDeckSchema>;
export type RecommendResponse =
  | { ok: true; data: RecommendedDeck; cached: boolean; model: string }
  | { ok: false; message: string };
