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
  const { data: trainerPokemons } = await supabase.from('owned_pokemon').select('dex_id').eq('user_id', userId);

  if (!trainerPokemons || trainerPokemons.length === 0) return [];

  // 같은 종을 여러 마리 보유할 수 있으므로 dex_id 중복 제거
  const dexIds = [...new Set(trainerPokemons.map((p: { dex_id: number }) => p.dex_id))];

  const { data: species } = await supabase
    .from('pokemon_species')
    .select('dex_id, ko_name, artwork_url, type1_id, type2_id, base_hp, base_atk, base_def, base_spd')
    .in('dex_id', dexIds);

  if (!species) return [];

  return species.map(
    (s: {
      dex_id: number;
      ko_name: string;
      artwork_url: string | null;
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
        artworkUrl: s.artwork_url ?? '',
        type1: s.type1_id,
        type2: s.type2_id,
        level: 1,
        baseStatTotal: s.base_hp + s.base_atk + s.base_def + s.base_spd,
        moves,
      };
    },
  );
}

// AI API 호출용 덱 추천 함수
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

  await setCachedRecommendation(
    supabase,
    user.id,
    rosterHash,
    cacheTheme,
    result,
    aiResult ? RECOMMENDATION_MODEL : 'fallback',
  );

  return { ok: true, data: result, cached: false, model: RECOMMENDATION_MODEL };
}

export type HomeDecksResponse = {
  optimal: RecommendResponse;
  status: RecommendResponse;
};

// 홈 화면에서 사용하는 덱 추천 함수
export async function recommendHomeDecks(): Promise<HomeDecksResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err: RecommendResponse = { ok: false, message: '로그인이 필요합니다' };
    return { optimal: err, status: err };
  }

  const roster = await loadRoster(supabase, user.id);

  if (roster.length < 3) {
    const err: RecommendResponse = { ok: false, message: '추천을 받으려면 최소 3마리의 포켓몬이 필요합니다' };
    return { optimal: err, status: err };
  }

  const rosterHash = await computeRosterHash(roster);

  const [cachedOptimal, cachedStatus] = await Promise.all([
    getCachedRecommendation(supabase, user.id, rosterHash, 'optimal'),
    getCachedRecommendation(supabase, user.id, rosterHash, 'status'),
  ]);

  if (cachedOptimal && cachedStatus) {
    return {
      optimal: { ok: true, data: cachedOptimal.data, cached: true, model: cachedOptimal.model },
      status: { ok: true, data: cachedStatus.data, cached: true, model: cachedStatus.model },
    };
  }

  const rateLimit = await checkRateLimit(supabase, user.id);
  if (rateLimit.limited) {
    const err: RecommendResponse = {
      ok: false,
      message: `덱 추천은 1분에 한 번만 요청할 수 있습니다. ${rateLimit.remainingSeconds}초 후에 다시 시도해주세요.`,
    };
    return {
      optimal: cachedOptimal ? { ok: true, data: cachedOptimal.data, cached: true, model: cachedOptimal.model } : err,
      status: cachedStatus ? { ok: true, data: cachedStatus.data, cached: true, model: cachedStatus.model } : err,
    };
  }

  // Sequential Gemini calls to prevent rate-limit race condition on parallel cold starts
  let optimalResult: RecommendResponse;
  if (cachedOptimal) {
    optimalResult = { ok: true, data: cachedOptimal.data, cached: true, model: cachedOptimal.model };
  } else {
    const candidates = filterOptimal(roster);
    const aiResult = await generateRecommendation({ theme: 'optimal' }, candidates);
    const data = aiResult ?? fallbackRecommendation({ theme: 'optimal' }, candidates);
    await setCachedRecommendation(
      supabase,
      user.id,
      rosterHash,
      'optimal',
      data,
      aiResult ? RECOMMENDATION_MODEL : 'fallback',
    );
    optimalResult = { ok: true, data, cached: false, model: RECOMMENDATION_MODEL };
  }

  let statusResult: RecommendResponse;
  if (cachedStatus) {
    statusResult = { ok: true, data: cachedStatus.data, cached: true, model: cachedStatus.model };
  } else {
    const candidates = filterStatus(roster);
    const aiResult = await generateRecommendation({ theme: 'status' }, candidates);
    const data = aiResult ?? fallbackRecommendation({ theme: 'status' }, candidates);
    await setCachedRecommendation(
      supabase,
      user.id,
      rosterHash,
      'status',
      data,
      aiResult ? RECOMMENDATION_MODEL : 'fallback',
    );
    statusResult = { ok: true, data, cached: false, model: RECOMMENDATION_MODEL };
  }

  return { optimal: optimalResult, status: statusResult };
}
