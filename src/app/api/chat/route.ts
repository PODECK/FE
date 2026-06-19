import { NextResponse } from 'next/server';
import z from 'zod';

import { createClient } from '@/shared/lib/supabase/server';

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? 'http://localhost:11434/api';
const LLM_DECK_MODEL = process.env.LLM_DECK_MODEL ?? 'qwen2.5:7b';
const LLM_API_KEY = process.env.LLM_API_KEY;

const RequestSchema = z.object({
  floorNumber: z.number().min(1).max(999),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: '유효하지 않은 층수입니다.' }, { status: 400 });

    const { floorNumber } = parsed.data;

    const [floorRes, enemyPokemonRes, userPokemonRes, typeChartRes] = await Promise.all([
      supabase.from('tower_floors').select('id').eq('floor_number', floorNumber).single(),
      supabase.from('tower_floor_pokemon').select('pokemon_id, name, type').eq('floor_number', floorNumber),
      supabase.from('owned_pokemons').select('id, pokemon_id, name, type').eq('trainer_id', user.id),
      supabase.from('type_charts').select('*'),
    ]);

    if (floorRes.error || !floorRes.data) {
      return NextResponse.json({ error: '해당 층을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (userPokemonRes.error) {
      console.error('보유 포켓몬 조회 실패:', userPokemonRes.error);
      return NextResponse.json({ error: '보유 포켓몬을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    if (enemyPokemonRes.error) {
      console.error('적 포켓몬 조회 실패:', enemyPokemonRes.error);
    }
    if (typeChartRes.error) {
      console.error('타입 상성 조회 실패:', typeChartRes.error);
    }

    const enemyDecks = enemyPokemonRes.data ?? [];
    const myDecks = userPokemonRes.data ?? [];
    const typeChart = typeChartRes.data ?? [];

    const ollamaResponse = await fetch(`${LLM_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LLM_API_KEY ? { Authorization: `Bearer ${LLM_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: LLM_DECK_MODEL,
        messages: [
          {
            role: 'system',
            content: `너는 포켓몬 카드 배틀 전문가 및 턴제 전략 AI다.\n
목표는 제공된 데이터를 완벽히 분석하여 유저가 상대 팀을 이길 수 있는 최적의 카운터 덱을 '순수 JSON'으로만 추천하는 것이다.

[제공된 데이터 입력]
- my_pool: 유저가 소유한 포켓몬 목록 (객체 배열: id, level, base_hp, base_atk, base_def, speed, type1_id, type2_id)
- enemy_team: 상대 팀 포켓몬 목록 (객체 배열)
- type_chart: 타입 상성 계수 데이터

[덱 빌딩 필수 원칙]
1. 추천 카드 개수: 최대 6장. 만약 my_pool의 전체 카드 수가 6장 미만이라면, my_pool에 존재하는 모든 카드를 추천하라.
2. 카드 검증 (절대 규칙): "cards" 배열에 들어가는 모든 숫자는 반드시 제공된 my_pool 안에 실제로 존재하는 포켓몬의 'id'여야만 한다. 없는 id를 발명하거나 추측하지 마라.
3. 밸런스: 상대 팀 전체를 받아치기 가장 좋은 조합을 구성하되, 한 가지 타입으로만 덱이 과도하게 몰리지 않도록 밸런스를 안배하라.

[우선순위 및 가중치]
상대를 이길 카드를 고를 때 다음 순서대로 가중치를 두어 계산하라:
1 순위: type_chart 기준 enemy_team의 약점을 찌르는 '타입 상성 우위'
2 순위: 종합 종족값 수치 (체력 + 공격 + 방어)
3 순위: 레벨(level)이 높은 카드
4 순위: 공격력(base_atk) 및 스피드(speed)가 높은 카드

[출력 및 코멘트 규칙]
- "comment"는 완벽한 '한국어'로만 작성하라. 영어 및 마크다운 기호(**, # 등), 이모지를 절대 사용하지 마라.
- 코멘트에는 핵심 카운터 타입 상성, 이 덱이 유리한 이유, 운영 방향성을 3~5문장으로 요약하여 담아라.
- 출력 형식은 오직 아래 명시된 JSON만 허용한다.

[출력 포맷 - 반환할 엄격한 JSON 구조]
{
  "comment": "여기에 타입 상성 조언과 운영 팁을 줄글로 작성 (특수문자 및 이모지 금지)",
  "cards": [1, 2, 3]
}

주의: 마크다운 코드 블록('''json ... ''')을 포함한 그 어떤 설명, 인사말, 후문도 추가하지 말고, 오직 중괄호 '{' 로 시작해서 '}' 로 끝나는 순수한 JSON 데이터만 반환하라.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              my_pool: myDecks,
              enemy_team: enemyDecks,
              type_chart: typeChart,
            }),
          },
        ],
        format: 'json',
        stream: true,
      }),
    });

    if (!ollamaResponse.body) throw new Error('Ollama 응답이 없습니다.');

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter((line) => line.trim() !== '');

          for (const line of lines) {
            try {
              const parsedJson = JSON.parse(line);
              if (parsedJson.message?.content) {
                controller.enqueue(encoder.encode(parsedJson.message.content));
              }
            } catch (error) {
              console.error('JSON 파싱 오류:', error);
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('덱 추천 스트림 처리 실패:', error instanceof Error ? error.message : '알 수 없는 오류');
    return NextResponse.json({ error: '덱 추천 응답 생성에 실패했습니다.' }, { status: 500 });
  }
}
