'use server';

import { createClient } from '@/shared/lib/supabase/server';
import type { PokemonType } from '@/shared/types/pokemon';
import { RecommendRequestSchema } from '../model/schemas';
import type { RecommendedDeck, RecommendResponse, RosterPokemon } from '../model/schemas';
import {
  filterOptimal,
  filterStatus,
  filterOffensive,
  filterDefensive,
  filterSpeed,
  filterCounter,
} from '../lib/rule-engine';
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
        baseAtk: s.base_atk,
        baseSpd: s.base_spd,
        baseStatTotal: s.base_hp + s.base_atk + s.base_def + s.base_spd,
        moves,
      };
    },
  );
}

function trimDesc(deck: RecommendedDeck): RecommendedDeck {
  return deck.description.length <= 14 ? deck : { ...deck, description: deck.description.slice(0, 14) };
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
    return { ok: true, data: trimDesc(cached.data), cached: true, model: cached.model };
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
  } else if (req.theme === 'offensive') {
    candidates = filterOffensive(roster);
  } else if (req.theme === 'defensive') {
    candidates = filterDefensive(roster);
  } else if (req.theme === 'speed') {
    candidates = filterSpeed(roster);
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
  offensive: RecommendResponse;
  defensive: RecommendResponse;
  speed: RecommendResponse;
};

const HOME_THEMES = ['optimal', 'status', 'offensive', 'defensive', 'speed'] as const;
type HomeTheme = (typeof HOME_THEMES)[number];

async function resolveHomeTheme(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  rosterHash: string,
  roster: RosterPokemon[],
  theme: HomeTheme,
  cached: { data: RecommendedDeck; model: string } | null,
): Promise<RecommendResponse> {
  if (cached) {
    return { ok: true, data: trimDesc(cached.data), cached: true, model: cached.model };
  }
  const filterMap: Record<HomeTheme, (r: RosterPokemon[]) => RosterPokemon[]> = {
    optimal: filterOptimal,
    status: filterStatus,
    offensive: filterOffensive,
    defensive: filterDefensive,
    speed: filterSpeed,
  };
  const candidates = filterMap[theme](roster);
  const aiResult = await generateRecommendation({ theme }, candidates);
  const data = aiResult ?? fallbackRecommendation({ theme }, candidates);
  await setCachedRecommendation(
    supabase,
    userId,
    rosterHash,
    theme,
    data,
    aiResult ? RECOMMENDATION_MODEL : 'fallback',
  );
  return { ok: true, data, cached: false, model: RECOMMENDATION_MODEL };
}

// 홈 화면에서 사용하는 덱 추천 함수
export async function recommendHomeDecks(): Promise<HomeDecksResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err: RecommendResponse = { ok: false, message: '로그인이 필요합니다' };
    return { optimal: err, status: err, offensive: err, defensive: err, speed: err };
  }

  const roster = await loadRoster(supabase, user.id);

  if (roster.length < 3) {
    const err: RecommendResponse = { ok: false, message: '추천을 받으려면 최소 3마리의 포켓몬이 필요합니다' };
    return { optimal: err, status: err, offensive: err, defensive: err, speed: err };
  }

  const rosterHash = await computeRosterHash(roster);

  const caches = await Promise.all(
    HOME_THEMES.map((theme) => getCachedRecommendation(supabase, user.id, rosterHash, theme)),
  );
  const [cachedOptimal, cachedStatus, cachedOffensive, cachedDefensive, cachedSpeed] = caches;

  if (caches.every(Boolean)) {
    return {
      optimal: { ok: true, data: trimDesc(cachedOptimal!.data), cached: true, model: cachedOptimal!.model },
      status: { ok: true, data: trimDesc(cachedStatus!.data), cached: true, model: cachedStatus!.model },
      offensive: { ok: true, data: trimDesc(cachedOffensive!.data), cached: true, model: cachedOffensive!.model },
      defensive: { ok: true, data: trimDesc(cachedDefensive!.data), cached: true, model: cachedDefensive!.model },
      speed: { ok: true, data: trimDesc(cachedSpeed!.data), cached: true, model: cachedSpeed!.model },
    };
  }

  const rateLimit = await checkRateLimit(supabase, user.id);
  if (rateLimit.limited) {
    const err: RecommendResponse = {
      ok: false,
      message: `덱 추천은 1분에 한 번만 요청할 수 있습니다. ${rateLimit.remainingSeconds}초 후에 다시 시도해주세요.`,
    };
    const toRes = (c: { data: RecommendedDeck; model: string } | null): RecommendResponse =>
      c ? { ok: true, data: trimDesc(c.data), cached: true, model: c.model } : err;
    return {
      optimal: toRes(cachedOptimal),
      status: toRes(cachedStatus),
      offensive: toRes(cachedOffensive),
      defensive: toRes(cachedDefensive),
      speed: toRes(cachedSpeed),
    };
  }

  // Sequential Gemini calls to prevent rate-limit race condition on parallel cold starts
  const [optimal, status, offensive, defensive, speed] = await HOME_THEMES.reduce(
    async (acc, theme, i) => {
      const results = await acc;
      results.push(await resolveHomeTheme(supabase, user.id, rosterHash, roster, theme, caches[i]));
      return results;
    },
    Promise.resolve([] as RecommendResponse[]),
  );

  return { optimal, status, offensive, defensive, speed };
}
