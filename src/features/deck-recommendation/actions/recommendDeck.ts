'use server';

import { createClient } from '@/shared/lib/supabase/server';
import type { PokemonType } from '@/shared/types/pokemon';
import { RecommendRequestSchema } from '../model/schemas';
import type { RecommendResponse, RosterPokemon } from '../model/schemas';
import { filterOptimal, filterStatus, filterCounter } from '../lib/rule-engine';
import { generateRecommendation, RECOMMENDATION_MODEL } from '../lib/gemini';
import { fallbackRecommendation } from '../lib/fallback';
import {
  computeRosterHash,
  themeKey,
  getCachedRecommendation,
  setCachedRecommendation,
  checkRateLimit,
} from '../lib/cache';
import rawMovesJson from '../../../../data/moves.json';
import rawPokemonMovesJson from '../../../../data/pokemon-moves.json';

type MoveEntry = {
  id: string;
  koName: string;
  type: string;
  damageClass: string;
  power: number;
  accuracy: number;
  pp: number;
};

const movesData = rawMovesJson as Record<string, MoveEntry>;
const pokemonMovesData = rawPokemonMovesJson as Record<string, string[]>;

async function loadRoster(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<RosterPokemon[]> {
  const { data: trainerPokemons } = await supabase.from('trainer_pokemons').select('dex_id').eq('user_id', userId);

  if (!trainerPokemons || trainerPokemons.length === 0) return [];

  const dexIds = trainerPokemons.map((p: { dex_id: number }) => p.dex_id);

  const { data: species } = await supabase
    .from('pokemon_species')
    .select('dex_id, ko_name, type1_id, type2_id, base_hp, base_atk, base_def, base_spd')
    .in('dex_id', dexIds);

  if (!species) return [];

  return species.map(
    (s: {
      dex_id: number;
      ko_name: string;
      type1_id: PokemonType;
      type2_id: PokemonType | null;
      base_hp: number;
      base_atk: number;
      base_def: number;
      base_spd: number;
    }) => {
      const moveIds = pokemonMovesData[String(s.dex_id)] ?? [];
      const moves = moveIds.slice(0, 4).map((id) => {
        const m = movesData[id];
        return {
          id,
          koName: m?.koName ?? id,
          type: (m?.type ?? 'normal') as PokemonType,
          power: m && m.power > 0 ? m.power : null,
          statusEffect: m?.damageClass === 'status' ? 'status' : null,
        };
      });

      return {
        dexId: s.dex_id,
        koName: s.ko_name,
        type1: s.type1_id,
        type2: s.type2_id,
        level: 1,
        baseStatTotal: s.base_hp + s.base_atk + s.base_def + s.base_spd,
        moves,
      };
    },
  );
}

export async function recommendDeck(rawInput: unknown): Promise<RecommendResponse> {
  const parsed = RecommendRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요' };
  }
  const req = parsed.data;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: '로그인이 필요합니다' };
  }

  const roster = await loadRoster(supabase, user.id);

  if (roster.length < 3) {
    return { ok: false, message: '추천을 받으려면 최소 3마리의 포켓몬이 필요합니다' };
  }

  const [rosterHash, cacheTheme] = await Promise.all([computeRosterHash(roster), Promise.resolve(themeKey(req))]);

  const cached = await getCachedRecommendation(supabase, user.id, rosterHash, cacheTheme);
  if (cached) {
    return { ok: true, data: cached.data, cached: true, model: cached.model };
  }

  const rateLimit = await checkRateLimit(supabase, user.id);
  if (rateLimit.limited) {
    return {
      ok: false,
      message: `덱 추천은 1분에 한 번만 요청할 수 있습니다. ${rateLimit.remainingSeconds}초 후에 다시 시도해주세요.`,
    };
  }

  let candidates: RosterPokemon[];
  if (req.theme === 'status') {
    candidates = filterStatus(roster);
  } else if (req.theme === 'counter') {
    candidates = filterCounter(roster, req.counterTarget!);
  } else {
    candidates = filterOptimal(roster);
  }

  const aiResult = await generateRecommendation(req, candidates);
  const result = aiResult ?? fallbackRecommendation(req, candidates);

  if (aiResult) {
    await setCachedRecommendation(supabase, user.id, rosterHash, cacheTheme, aiResult, RECOMMENDATION_MODEL);
  }

  return { ok: true, data: result, cached: false, model: RECOMMENDATION_MODEL };
}
