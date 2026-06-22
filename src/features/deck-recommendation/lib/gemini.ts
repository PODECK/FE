import { generateObject } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import type { RecommendRequest, RecommendedDeck, RosterPokemon } from '../model/schemas';

const AiDeckSchema = z.object({
  title: z.string(),
  description: z.string().transform((s) => s.slice(0, 14)),
  deck: z
    .array(z.object({ dexId: z.number() }))
    .min(3)
    .max(6),
  strategy: z.string(),
});

export const RECOMMENDATION_MODEL = 'gemini-2.5-flash';

const model = google(RECOMMENDATION_MODEL);

const SYSTEM_PROMPT = `너는 PODECK라는 포켓몬 턴제 카드 배틀 게임의 덱 빌딩 전문가다.

[게임 규칙]
- 배틀은 최대 3 vs 3 (필드 1마리, 벤치에서 교체)
- 덱은 3~6마리로 구성
- 상태이상 6종: 잠듦, 혼란, 얼음, 화상, 독, 마비
- 타입 상성은 본가 포켓몬과 동일 (2배/0.5배/무효)
- STAB(자속 보정) 1.5배 적용

[추천 원칙]
- 반드시 제시된 후보 포켓몬(candidate) 중에서만 고른다. 후보에 없는 포켓몬은 절대 추천하지 않는다.
- 종족값뿐 아니라 타입 시너지, 약점 보완, 기술 구성을 종합적으로 고려한다.
- title은 덱 콘셉트를 10자 이내로 작성한다. (예: "격투 카운터덱", "상태이상 특화덱")
- description은 전략 핵심을 14자 이내로 "~하자!" 형식으로 작성한다. (예: "상태이상으로 압박하자!", "격투 타입을 제압하자!")
- strategy에는 이 덱의 전체 운영 방향을 한국어로 서술한다.`;

function themeInstruction(req: RecommendRequest): string {
  if (req.theme === 'status')
    return '아래 후보로 상태이상(잠듦·마비·화상·독 등)을 적극 활용하는 6마리 조합을 구성해줘.';
  if (req.theme === 'offensive')
    return '아래 후보로 공격력과 기술 위력을 최우선으로 한 화력 특화 6마리 조합을 구성해줘.';
  if (req.theme === 'defensive') return '아래 후보로 내구력과 방어를 최우선으로 한 탱커 중심 6마리 조합을 구성해줘.';
  if (req.theme === 'speed') return '아래 후보로 스피드를 최우선으로 한 선공·속공 특화 6마리 조합을 구성해줘.';
  if (req.theme === 'counter')
    return `아래 후보로 ${req.counterTarget} 타입을 효과적으로 카운터하는 6마리 조합을 구성해줘.`;
  return '아래 후보 중 가장 강력한 최적의 6마리 조합을 구성해줘.';
}

function serializeCandidates(candidates: RosterPokemon[]): string {
  return candidates
    .map((p) => {
      const types = p.type2 ? `${p.type1}/${p.type2}` : p.type1;
      const moves = p.moves
        .map((m) => {
          const parts = [m.koName, m.type];
          if (m.power !== null) parts.push(`위력${m.power}`);
          if (m.statusEffect !== null) parts.push(m.statusEffect);
          return `${parts[0]}(${parts.slice(1).join(',')})`;
        })
        .join(' ');
      return `#${p.dexId} ${p.koName} [${types}] Lv${p.level} 종족값합${p.baseStatTotal} 기술:${moves}`;
    })
    .join('\n');
}

export async function generateRecommendation(
  req: RecommendRequest,
  candidates: RosterPokemon[],
): Promise<RecommendedDeck | null> {
  const candidateMap = new Map(candidates.map((c) => [c.dexId, c]));
  const prompt = `${themeInstruction(req)}\n\n후보 포켓몬:\n${serializeCandidates(candidates)}`;
  const temperatures = [0.7, 0.3];

  for (const temperature of temperatures) {
    try {
      const { object } = await generateObject({
        model,
        schema: AiDeckSchema,
        system: SYSTEM_PROMPT,
        prompt,
        temperature,
      });

      const allValid = object.deck.every((p) => candidateMap.has(p.dexId));
      if (!allValid) continue;

      return {
        ...object,
        deck: object.deck.map((p) => ({
          dexId: p.dexId,
          koName: candidateMap.get(p.dexId)!.koName,
          artworkUrl: candidateMap.get(p.dexId)!.artworkUrl,
        })),
      };
    } catch {
      continue;
    }
  }

  return null;
}
