import { createClient } from '@/shared/lib/supabase/server';
import { NextResponse } from 'next/server';
import z from 'zod';

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

    const [floorRes, enmyPokemonRes, userPokemonRes, typeChartRes] = await Promise.all([
      supabase.from('tower_floors').select('id').eq('floor_number', floorNumber).single().throwOnError(),
      supabase
        .from('tower_floor_pokemon')
        .select('pokemon_id, name, type')
        .eq('floor_number', floorNumber)
        .throwOnError(),
      supabase
        .from('owned_pokemons')
        .select('id, pokemon_id, name, type')
        .eq('trainer_id', user.id)
        .single()
        .throwOnError(),
      supabase.from('type_charts').select('*').throwOnError(),
    ]);

    if (!floorRes.data) return NextResponse.json({ error: '해당 층을 찾을 수 없습니다.' }, { status: 404 });

    const enemyDecks = enmyPokemonRes.data || [];
    const myDecks = userPokemonRes.data || [];
    const typeChart = typeChartRes.data || [];

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [
          {
            role: 'system',
            content: `너는 포켓몬 카드 배틀 전문가다.
목표는 유저가 무한의 탑을 클리어할 수 있도록, 제공된 데이터만 사용해 최적의 카운터 덱을 추천하는 것이다.

입력 데이터:
- my_pool: 유저가 실제로 보유한 포켓몬 목록
- enemy_team: 상대 팀 포켓몬 목록
- type_chart: 타입 상성표

게임 규칙:
- 유저는 최대 6마리의 포켓몬을 덱으로 가져갈 수 있다.
- 실제 추천 카드 수는 3~6장이다.
- my_pool에 6장 미만만 있으면 가진 수만큼만 추천한다.
- 필드에는 한 번에 1~3마리까지 세팅 가능하다.

절대 규칙:
1. cards에는 반드시 my_pool 안에 실제로 존재하는 id만 넣어라.
2. my_pool에 없는 id를 생성하거나 추측하거나 변형하지 마라.
3. 판단에 필요한 정보가 부족하면 추측하지 말고, 제공된 데이터 안에서만 최선의 선택을 하라.
4. 반드시 type_chart를 참고해 enemy_team의 타입에 유리한 포켓몬을 우선 고려하라.
5. 출력은 반드시 순수 JSON만 반환하라.
6. JSON 외의 설명, 마크다운, 코드블록, 주석, 서문, 후문을 절대 추가하지 마라.

덱 선정 우선순위:
1. 종족값
2. 포켓몬 카운터 타입 상성
3. 레벨
4. 공격력
5. 스피드

덱 선정 세부 원칙:
- enemy_team 전체를 상대하기 좋은 조합을 구성하라.
- 특정 적 하나만 카운터치는 조합보다, 여러 적을 안정적으로 상대할 수 있는 조합을 우선한다.
- 같은 타입만 과도하게 몰리지 않도록 가능한 범위에서 밸런스를 고려하라.
- 추천 카드 수는 min(6, my_pool의 카드 수)로 한다. 단, my_pool은 최소 3장 이상이라고 가정한다.

comment 작성 규칙:
- 왜 이 카드들이 enemy_team에 유리한지 설명하라.
- 어떤 타입 상성을 노렸는지 설명하라.
- 핵심 시너지와 운영 방향을 3~5문장으로 설명하라.

반드시 아래 형식의 JSON 객체만 반환하라:
{
  "comment": "string",
  "cards": [1, 2, 3, 4, 5, 6]
}`,
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
    console.error('데이터베이스 병렬 조회 실패:', error instanceof Error ? error.message : '알 수 없는 오류');
    return NextResponse.json({ error: '배틀 데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
