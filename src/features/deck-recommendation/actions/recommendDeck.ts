'use server';

import { createClient } from '@/shared/lib/supabase/server';
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
import { loadOwnedRoster } from '../lib/roster';
import { generateRecommendation, RECOMMENDATION_MODEL } from '../lib/gemini';
import { fallbackRecommendation } from '../lib/fallback';
import {
  computeRosterHash,
  themeKey,
  getCachedRecommendation,
  setCachedRecommendation,
  checkRateLimit,
} from '../lib/cache';

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

  const roster = await loadOwnedRoster(supabase, user.id);

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
    candidates = await filterCounter(roster, req.counterTarget!);
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
  decks: [RecommendResponse, RecommendResponse];
};

const HOME_THEMES = ['optimal', 'status', 'offensive', 'defensive', 'speed'] as const;
type HomeTheme = (typeof HOME_THEMES)[number];

const FILTER_MAP: Record<HomeTheme, (r: RosterPokemon[]) => RosterPokemon[]> = {
  optimal: filterOptimal,
  status: filterStatus,
  offensive: filterOffensive,
  defensive: filterDefensive,
  speed: filterSpeed,
};

function pickRandomThemes(): [HomeTheme, HomeTheme] {
  const shuffled = [...HOME_THEMES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

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
  const candidates = FILTER_MAP[theme](roster);
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

// 홈 화면에서 사용하는 덱 추천 함수 — 매 요청마다 랜덤 2개 테마를 선택한다
export async function recommendHomeDecks(): Promise<HomeDecksResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const err: RecommendResponse = { ok: false, message: '로그인이 필요합니다' };
  if (!user) return { decks: [err, err] };

  const roster = await loadOwnedRoster(supabase, user.id);

  if (roster.length < 3) {
    const e: RecommendResponse = { ok: false, message: '추천을 받으려면 최소 3마리의 포켓몬이 필요합니다' };
    return { decks: [e, e] };
  }

  const rosterHash = await computeRosterHash(roster);
  const [themeA, themeB] = pickRandomThemes();

  const [cachedA, cachedB] = await Promise.all([
    getCachedRecommendation(supabase, user.id, rosterHash, themeA),
    getCachedRecommendation(supabase, user.id, rosterHash, themeB),
  ]);

  const hasCacheMiss = !cachedA || !cachedB;
  if (hasCacheMiss) {
    const rateLimit = await checkRateLimit(supabase, user.id);
    if (rateLimit.limited) {
      const rateLimitErr: RecommendResponse = {
        ok: false,
        message: `덱 추천은 1분에 한 번만 요청할 수 있습니다. ${rateLimit.remainingSeconds}초 후에 다시 시도해주세요.`,
      };
      const toRes = (c: { data: RecommendedDeck; model: string } | null): RecommendResponse =>
        c ? { ok: true, data: trimDesc(c.data), cached: true, model: c.model } : rateLimitErr;
      return { decks: [toRes(cachedA), toRes(cachedB)] };
    }
  }

  // Sequential to avoid rate-limit race condition on parallel cold starts
  const deckA = await resolveHomeTheme(supabase, user.id, rosterHash, roster, themeA, cachedA);
  const deckB = await resolveHomeTheme(supabase, user.id, rosterHash, roster, themeB, cachedB);

  return { decks: [deckA, deckB] };
}
