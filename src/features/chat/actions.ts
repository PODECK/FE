'use server';

import { createOllama } from 'ollama-ai-provider-v2';
import { streamText } from 'ai';

import { TOWER_FLOORS } from '@/shared/config/tower-floors';
import { createClient } from '@/shared/lib/supabase/server';

import type { PokemonType } from '@/shared/types/pokemon';
import type { ChatMessage } from '@/shared/stores/overlay-store';

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? 'http://localhost:11434/api';
const LLM_CHAT_MODEL = process.env.LLM_CHAT_MODEL ?? 'qwen2.5:7b';

const llm = createOllama({
  baseURL: LLM_BASE_URL,
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

  // 적 정보는 TOWER_FLOORS 설정의 pokemonPool(dex ID 배열)을 기준으로 species를 조회한다
  const floorConfig = TOWER_FLOORS.find((f) => f.floor === currentFloor);

  let enemyContext = '정보 없음';
  if (floorConfig && floorConfig.pokemonPool.length > 0) {
    const { data: enemies } = await supabase
      .from('pokemon_species')
      .select('ko_name, type1_id, type2_id, base_hp, base_atk, base_def')
      .in('dex_id', floorConfig.pokemonPool);

    if (enemies && enemies.length > 0) {
      enemyContext = enemies
        .map((row) => normalizeEnemySpecies(row))
        .filter((s): s is EnemySpecies => s !== null)
        .map((s) => {
          const types = s.type2_id ? `${s.type1_id}/${s.type2_id}` : s.type1_id;
          return `- ${s.ko_name} [${types}] (체력:${s.base_hp} 공격:${s.base_atk} 방어:${s.base_def})`;
        })
        .join('\n');
    }
  }

  const CHAT_SYSTEM_PROMPT = `너는 PODECK 게임의 무한의 탑 공략 전문 배틀 AI 조력자다.
현재 플레이어가 도전 중인 층은 [무한의 탑 ${currentFloor}층]이다.
현재 층의 적 정보는 [${enemyContext}]이다.

답변 원칙 (절대 사수):
1. 처음부터 끝까지 모든 문장을 완벽한 "한국어"로만 답변해라. 영어 단어(예: HP, Burn, Card Draw 등)를 영어 그대로 노출하지 말고 '체력', '화상 데미지', '카드 뽑기'와 같이 한글로 번역해서 말해라.
2. 친절하면서도 예리한 턴제 카드 게임 스트리머나 프로게이머처럼 말해라.
3. 가장 위협적인 적 1~2개를 기준으로 핵심 약점 타입과 조심해야 할 스펙을 짚어라.
4. 서론, 인사, 맺음말 없이 곧바로 핵심만 말해라. 각 항목은 한 문장으로 짧게 끊어라.
5. 답변은 아래 형식 그대로, 세 줄로 나눠서(각 항목 사이 줄바꿈 필수) 출력해라:
약점 타입: (내용)
위험 요소: (내용)
운영 팁: (내용)

텍스트 스타일 규칙 (필수):
- ** 기호나 # 같은 마크다운 특수문자를 절대 사용하지 마라. (예: "**약점 타입**" 대신 "약점 타입:" 처럼 순수 텍스트만 쓸 것)
- 주사위(🎲), 웃음(😄) 같은 이모지나 특수 아이콘을 절대 포함하지 말고 담백하게 글자로만 출력해라.`;

  const result = await streamText({
    model: llm(LLM_CHAT_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  return result.textStream;
}
