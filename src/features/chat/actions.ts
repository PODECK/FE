'use server';

import { createOllama } from 'ollama-ai-provider-v2';
import { streamText } from 'ai';

import { createClient } from '@/shared/lib/supabase/server';

import type { PokemonType } from '@/shared/types/pokemon';
import type { ChatMessage } from '@/shared/stores/overlay-store';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api';
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? 'llama3';

const ollama = createOllama({
  baseURL: OLLAMA_BASE_URL,
});

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

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({ user_id: user.id, is_active: false })
    .select('id')
    .single();

  if (deckError || !deck) {
    console.error('Decks Insert 실패:', deckError);
    return { success: false, error: '덱 생성에 실패했습니다.' };
  }

  const insertRows = dexIds.slice(0, 6).map((dexId, index) => ({
    deck_id: deck.id,
    user_id: user.id,
    dex_id: dexId,
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
  return { success: true, deckId: deck.id, message: '카운터 덱이 성공적으로 복사되었습니다.' };
}

// 채팅 스트리밍 응답 생성
export async function streamChatResponse(messages: ChatMessage[], currentFloor: number) {
  const supabase = await createClient();

  const { data: enemies } = await supabase
    .from('tower_floors_pokemon')
    .select('dex_id, pokemon_species(ko_name, type1_id, type2_id, base_hp, base_atk, base_def)')
    .eq('floor', currentFloor);

  let enemyContext = '정보 없음';
  if (enemies && enemies.length > 0) {
    enemyContext = enemies
      .map((e) => normalizeEnemySpecies(e.pokemon_species))
      .filter((s): s is EnemySpecies => s !== null)
      .map((s) => {
        const types = s.type2_id ? `${s.type1_id}/${s.type2_id}` : s.type1_id;
        return `- ${s.ko_name} [${types}] (체력:${s.base_hp} 공격:${s.base_atk} 방어:${s.base_def})`;
      })
      .join('\n');
  }

  const CHAT_SYSTEM_PROMPT = `너는 PODECK 게임의 무한의 탑 공략 전문 배틀 AI 조력자다.
현재 플레이어가 도전 중인 층은 [무한의 탑 ${currentFloor}층]이다.
현재 층의 적 정보는 [${enemyContext}]이다.

답변 원칙:
1. 친절하면서도 예리한 턴제 카드 게임 스트리머나 프로게이머처럼 말해라.
2. 반드시 제공된 적 정보만 근거로 전략을 말해라. 추측이나 환각은 금지다.
3. 가장 위협적인 적 1~2개를 기준으로 핵심 약점 타입과 조심해야 할 스펙을 짚어라.
4. 너무 길게 말하지 말고 3~4줄 내외로 콤팩트하게 답해라.
5. 답변은 다음 3개 요소를 포함해라: 약점 타입, 위험 요소, 운영 팁.`;

  const result = await streamText({
    model: ollama(OLLAMA_CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  return result.textStream;
}
