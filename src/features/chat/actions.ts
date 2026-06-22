'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { typeLabelMap } from '@/app/(main)/(start)/build-deck/_constants/pokemon-type';
import { filterByType, filterTowerCounter } from '@/features/deck-recommendation/lib/rule-engine';
import { buildRoster, loadOwnedRoster } from '@/features/deck-recommendation/lib/roster';
import { createClient } from '@/shared/lib/supabase/server';

import type { RosterPokemon } from '@/features/deck-recommendation/model/schemas';
import type { PokemonType } from '@/shared/types/pokemon';
import type { ChatMessage } from '@/shared/stores/overlay-store';

import { TYPE_CHART } from '../../../data/type-chart';

// 챗봇 LLM은 Gemini를 사용한다. 키는 GOOGLE_GENERATIVE_AI_API_KEY 환경변수에서 자동 주입된다.
const LLM_CHAT_MODEL = process.env.LLM_CHAT_MODEL ?? 'gemini-2.5-flash';

// gemini-2.5-flash의 추론(thinking) 토큰을 끈다. 단답형 공략 응답에 불필요한 지연·비용을 줄인다.
const NO_THINKING = { google: { thinkingConfig: { thinkingBudget: 0 } } } as const;

type EnemySpecies = {
  ko_name: string;
  type1_id: PokemonType;
  type2_id: PokemonType | null;
  base_hp: number;
  base_atk: number;
  base_def: number;
};

// Supabase 중첩 select는 단일 관계를 객체 또는 배열로 추론할 수 있어 정규화한다
function normalizeEnemySpecies(value: unknown): EnemySpecies | null {
  const species = Array.isArray(value) ? (value[0] as unknown) : value;
  if (species && typeof species === 'object' && 'ko_name' in species) {
    return species as EnemySpecies;
  }
  return null;
}

// 유저가 정한 AI 추천 카운터 덱을 실제 DB에 맞게 1:N 트랜잭션으로 저장
export async function copyCounterDeckToUser(dexIds: number[]) {
  if (!dexIds || dexIds.length === 0) return { success: false, error: '카드 ID 목록이 비어있습니다.' };

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: '인증되지 않은 사용자입니다.' };

  // 추천 덱은 dex_id(종)를 들고 있지만 deck_numbers는 instance_id(보유 개체)를 받는다.
  // 보유 포켓몬 중 해당 dex_id를 가진 인스턴스를 찾아 dex_id -> instance_id로 변환한다.
  const wantedDexIds = [...new Set(dexIds)].slice(0, DECK_SIZE);

  const { data: owned, error: ownedError } = await supabase
    .from('owned_pokemon')
    .select('instance_id, dex_id, level')
    .eq('user_id', user.id)
    .in('dex_id', wantedDexIds);

  if (ownedError) {
    console.error('보유 포켓몬 조회 실패:', ownedError);
    return { success: false, error: '보유 포켓몬을 불러오지 못했습니다.' };
  }

  // dex_id별로 레벨이 가장 높은 인스턴스 1개를 선택한다 (같은 인스턴스 중복 편성 방지).
  const bestByDex = new Map<number, { instance_id: string; level: number }>();
  for (const p of (owned ?? []) as { instance_id: string; dex_id: number; level: number }[]) {
    const cur = bestByDex.get(p.dex_id);
    if (!cur || p.level > cur.level) bestByDex.set(p.dex_id, { instance_id: p.instance_id, level: p.level });
  }

  const instanceIds = wantedDexIds
    .map((dexId) => bestByDex.get(dexId)?.instance_id)
    .filter((id): id is string => Boolean(id));

  if (instanceIds.length === 0) {
    return { success: false, error: '추천 덱에 넣을 수 있는 보유 포켓몬이 없습니다.' };
  }

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({ user_id: user.id, is_active: false })
    .select('id')
    .single();

  if (deckError || !deck) {
    console.error('Decks Insert 실패:', deckError);
    return { success: false, error: '덱 생성에 실패했습니다.' };
  }

  // position은 같은 덱 안에서 중복 불가 -> 0부터 순서대로 부여
  const insertRows = instanceIds.map((instanceId, index) => ({
    deck_id: deck.id,
    instance_id: instanceId,
    position: index,
  }));

  const { error: numbersError } = await supabase.from('deck_numbers').insert(insertRows);

  if (numbersError) {
    console.error('Deck Numbers Insert 실패:', numbersError);
    await supabase.from('decks').delete().eq('id', deck.id);

    if (numbersError.code === '23503') {
      return { success: false, error: '실제로 소유하지 않은 카드가 포함되어 있습니다.' };
    }
    return { success: false, error: '덱의 포켓몬 상세 구성 저장에 실패했습니다.' };
  }

  // 복사한 덱을 활성 덱으로 전환한다 (유저당 활성 덱은 하나).
  // 덱 편성(deck_numbers)이 끝난 뒤 전환해야 미완성 덱이 활성화되지 않는다.
  await supabase.from('decks').update({ is_active: false }).eq('user_id', user.id).neq('id', deck.id);
  const { error: activateError } = await supabase.from('decks').update({ is_active: true }).eq('id', deck.id);
  if (activateError) {
    // 복사 자체는 성공했으므로 활성화 실패는 로깅만 한다.
    console.error('덱 활성화 실패:', activateError);
  }

  return { success: true, deckId: deck.id, message: '덱이 성공적으로 복사되었습니다.' };
}

export type EntryDeckPokemon = {
  dexId: number;
  koName: string;
  artworkUrl: string;
  type1: PokemonType;
  type2: PokemonType | null;
};

export type EntryDeckResult = { ok: true; deck: EntryDeckPokemon[] } | { ok: false; message: string };

// 유저가 등록한 6마리 엔트리 덱(pokedex_entries)을 등록 순서대로 불러온다
export async function loadEntryDeck(): Promise<EntryDeckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: '로그인이 필요합니다' };

  const { data: entries } = await supabase
    .from('pokedex_entries')
    .select('dex_id')
    .eq('user_id', user.id)
    .order('discovered_at', { ascending: true });

  if (!entries || entries.length === 0) {
    return { ok: false, message: '등록된 덱이 없습니다. 도감에서 6마리를 먼저 등록해 주세요.' };
  }

  const dexIds = [...new Set(entries.map((e: { dex_id: number }) => e.dex_id))];

  const { data: species } = await supabase
    .from('pokemon_species')
    .select('dex_id, ko_name, artwork_url, type1_id, type2_id')
    .in('dex_id', dexIds);

  if (!species || species.length === 0) {
    return { ok: false, message: '덱 정보를 불러오지 못했습니다' };
  }

  const byId = new Map(
    species.map(
      (s: {
        dex_id: number;
        ko_name: string;
        artwork_url: string | null;
        type1_id: PokemonType;
        type2_id: PokemonType | null;
      }) => [s.dex_id, s] as const,
    ),
  );

  const deck = dexIds
    .map((id) => byId.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      dexId: s.dex_id,
      koName: s.ko_name,
      artworkUrl: s.artwork_url ?? '',
      type1: s.type1_id,
      type2: s.type2_id,
    }));

  return { ok: true, deck };
}

const DECK_SIZE = 6;

export type DeckSuggestion =
  | { ok: true; deck: { dexId: number; koName: string; artworkUrl: string }[]; explanation: string }
  | { ok: false; message: string };

function toDeckSlots(roster: RosterPokemon[]) {
  return roster.slice(0, DECK_SIZE).map((p) => ({ dexId: p.dexId, koName: p.koName, artworkUrl: p.artworkUrl }));
}

// 현재 층 적 dex_id 목록을 DB(tower_floors.pokemon_pool)에서 읽는다
async function getFloorEnemyDexIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  floor: number,
): Promise<number[]> {
  const { data } = await supabase.from('tower_floors').select('pokemon_pool').eq('floor', floor).maybeSingle();
  const pool = (data?.pokemon_pool ?? null) as { enemies?: { dexId: number }[] } | null;
  if (!pool?.enemies) return [];
  return [...new Set(pool.enemies.map((e) => e.dexId).filter((id): id is number => typeof id === 'number'))];
}

// 현재 층의 적 타입 집합을 DB 로스터에서 도출한다
async function getFloorEnemyTypes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  floor: number,
): Promise<PokemonType[]> {
  const dexIds = await getFloorEnemyDexIds(supabase, floor);
  if (dexIds.length === 0) return [];

  const { data: species } = await supabase.from('pokemon_species').select('type1_id, type2_id').in('dex_id', dexIds);

  if (!species) return [];

  const types = new Set<PokemonType>();
  for (const s of species as { type1_id: PokemonType; type2_id: PokemonType | null }[]) {
    types.add(s.type1_id);
    if (s.type2_id) types.add(s.type2_id);
  }
  return [...types];
}

const EXPLAIN_SYSTEM_PROMPT = `너는 PODECK 무한의 탑 공략 조력자다. 주어진 덱과 상황을 바탕으로 추천 근거를 한국어로 2~3문장 안에 짧게 설명해라.
규칙: 한국어만 사용하고 영어 단어·마크다운(**, #)·이모지를 절대 쓰지 마라. 포켓몬 타입은 반드시 한글(불꽃, 물, 독 등)로 표기해라. 타입 상성을 중심으로 왜 이 구성이 유리한지만 담백하게 말하고, 각 문장은 줄바꿈으로 구분해라.`;

// 확정된 덱에 대한 짧은 설명만 LLM으로 생성한다 (덱 선정 자체는 결정론)
async function explainDeck(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google(LLM_CHAT_MODEL),
      system: EXPLAIN_SYSTEM_PROMPT,
      prompt,
      providerOptions: NO_THINKING,
    });
    return text
      .replace(/\*\*/g, '')
      .replace(/([.!?])\s+/g, '$1\n')
      .trim();
  } catch (error) {
    console.error('덱 설명 생성 실패:', error);
    return '';
  }
}

// 객관식 1. 현재 층을 카운터하는 덱 (보유 포켓몬 전체에서 선발)
export async function recommendCounterDeck(currentFloor: number): Promise<DeckSuggestion> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: '로그인이 필요합니다' };

  const roster = await loadOwnedRoster(supabase, user.id);
  if (roster.length < 3) return { ok: false, message: '추천을 받으려면 보유 포켓몬이 최소 3마리 필요합니다' };

  const enemyTypes = await getFloorEnemyTypes(supabase, currentFloor);
  const ranked = await filterTowerCounter(roster, enemyTypes);
  const deck = toDeckSlots(ranked);

  const enemyLabel = enemyTypes.length > 0 ? enemyTypes.map((t) => typeLabelMap[t] ?? t).join(', ') : '정보 없음';
  const explanation = await explainDeck(
    `현재 ${currentFloor}층 적 타입: [${enemyLabel}]. 추천 카운터 덱: ${deck.map((d) => d.koName).join(', ')}. 이 덱이 왜 이 층에 유리한지 설명해줘.`,
  );

  return { ok: true, deck, explanation };
}

// 객관식 2. 특정 타입으로 구성된 덱 (보유 포켓몬 중 해당 타입)
export async function recommendTypeDeck(type: PokemonType): Promise<DeckSuggestion> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: '로그인이 필요합니다' };

  const roster = await loadOwnedRoster(supabase, user.id);
  const candidates = filterByType(roster, type);
  if (candidates.length === 0) return { ok: false, message: '해당 타입의 보유 포켓몬이 없습니다' };

  const deck = toDeckSlots(candidates);
  const explanation = await explainDeck(
    `${typeLabelMap[type] ?? type} 타입으로 구성한 덱: ${deck.map((d) => d.koName).join(', ')}. 이 타입 덱의 강점과 운영 방향을 설명해줘.`,
  );

  return { ok: true, deck, explanation };
}

// 객관식 3. 내 등록 덱(pokedex_entries)이 현재 층에 통할지 결정론으로 분석한다 (0토큰)
export async function analyzeEntryDeck(currentFloor: number): Promise<DeckSuggestion> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: '로그인이 필요합니다' };

  const { data: entries } = await supabase
    .from('pokedex_entries')
    .select('dex_id')
    .eq('user_id', user.id)
    .order('discovered_at', { ascending: true });

  if (!entries || entries.length === 0) {
    return { ok: false, message: '등록된 덱이 없습니다. 도감에서 6마리를 먼저 등록해 주세요.' };
  }

  const roster = await buildRoster(
    supabase,
    entries.map((e: { dex_id: number }) => e.dex_id),
  );
  const enemyTypes = await getFloorEnemyTypes(supabase, currentFloor);

  const advantaged: string[] = [];
  const weak: string[] = [];
  for (const p of roster) {
    const hasSuperEffectiveMove = p.moves.some(
      (m) => m.power !== null && enemyTypes.some((et) => (TYPE_CHART[m.type]?.[et] ?? 1) >= 2),
    );
    const isVulnerable = enemyTypes.some(
      (et) => (TYPE_CHART[et]?.[p.type1] ?? 1) >= 2 || (p.type2 ? (TYPE_CHART[et]?.[p.type2] ?? 1) >= 2 : false),
    );
    if (hasSuperEffectiveMove && !isVulnerable) advantaged.push(p.koName);
    else if (isVulnerable && !hasSuperEffectiveMove) weak.push(p.koName);
  }

  const enemyLabel = enemyTypes.length > 0 ? enemyTypes.map((t) => typeLabelMap[t] ?? t).join(', ') : '정보 없음';
  const lines = [
    `현재 ${currentFloor}층 적 타입: ${enemyLabel}`,
    advantaged.length > 0 ? `유리한 카드: ${advantaged.join(', ')}` : '뚜렷하게 유리한 카드: 없음',
    weak.length > 0 ? `불리한 카드: ${weak.join(', ')}` : '불리한 카드: 없음',
  ];

  return { ok: true, deck: toDeckSlots(roster), explanation: lines.join('\n') };
}

export type ChatResponse = { ok: true; content: string } | { ok: false; message: string };

// 채팅 응답 생성(비스트리밍).
// textStream(async iterable)을 Server Action 경계 밖으로 반환하면 무한 pending이 발생하므로
// 전체 응답을 받아 한 번에 돌려준다.
export async function generateChatResponse(messages: ChatMessage[], currentFloor: number): Promise<ChatResponse> {
  const supabase = await createClient();

  // 적 정보는 DB(tower_floors.pokemon_pool)의 dex ID를 기준으로 species를 조회한다
  const enemyDexIds = await getFloorEnemyDexIds(supabase, currentFloor);

  let enemyContext = '정보 없음';
  if (enemyDexIds.length > 0) {
    const { data: enemies } = await supabase
      .from('pokemon_species')
      .select('ko_name, type1_id, type2_id, base_hp, base_atk, base_def')
      .in('dex_id', enemyDexIds);

    if (enemies && enemies.length > 0) {
      enemyContext = enemies
        .map((row) => normalizeEnemySpecies(row))
        .filter((s): s is EnemySpecies => s !== null)
        .map((s) => {
          const t1 = typeLabelMap[s.type1_id] ?? s.type1_id;
          const types = s.type2_id ? `${t1}/${typeLabelMap[s.type2_id] ?? s.type2_id}` : t1;
          return `- ${s.ko_name} [${types}] (체력:${s.base_hp} 공격:${s.base_atk} 방어:${s.base_def})`;
        })
        .join('\n');
    }
  }

  const CHAT_SYSTEM_PROMPT = `너는 PODECK 게임의 무한의 탑 공략 전문 배틀 AI 조력자다.
현재 플레이어가 도전 중인 층은 [무한의 탑 ${currentFloor}층]이다.
현재 층의 적 로스터(이름 / 타입 / 능력치)는 다음과 같다:
${enemyContext}

답변 원칙:
1. 무엇보다 사용자의 질문에 직접 답해라. 위에 주어진 적 로스터 정보 안에서만 답하고, 없는 정보는 절대 지어내지 마라.
2. 사용자가 적 목록·이름·타입·능력치를 물으면, 위 로스터의 포켓몬 이름과 타입을 한 줄에 하나씩 그대로 나열해라.
3. 사용자가 공략·카운터·전략을 물을 때만 아래 형식으로 답해라(각 항목 줄바꿈 필수):
약점 타입: (내용)
위험 요소: (내용)
운영 팁: (내용)
4. 친절하지만 장황하지 않게, 서론·맺음말 없이 핵심만 짧게 답하고 각 문장은 줄바꿈으로 구분해라.

스타일 규칙(필수):
- 모든 문장을 완벽한 한국어로만 써라. 영어 단어(HP, Burn 등)는 '체력', '화상'처럼 한글로 바꾸고, 포켓몬 타입도 반드시 한글(불꽃, 물, 노말 등)로 표기해라.
- 마크다운 기호(**, #)나 이모지를 절대 쓰지 말고 담백한 글자로만 출력해라.`;

  try {
    const { text } = await generateText({
      model: google(LLM_CHAT_MODEL),
      system: CHAT_SYSTEM_PROMPT,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      providerOptions: NO_THINKING,
    });

    return { ok: true, content: text.replace(/\*\*/g, '').trim() };
  } catch (error) {
    console.error('채팅 응답 생성 실패:', error);
    return { ok: false, message: '죄송합니다. 통신 오류가 발생했습니다. 다시 시도해 주세요.' };
  }
}
