import type { RecommendRequest, RecommendedDeck, RosterPokemon } from '../model/schemas';

const THEME_LABELS: Record<string, string> = {
  optimal: '최적',
  status: '상태이상',
  counter: '카운터',
};

export function fallbackRecommendation(req: RecommendRequest, candidates: RosterPokemon[]): RecommendedDeck {
  const top6 = candidates.slice(0, 6);
  const themeLabel = THEME_LABELS[req.theme] ?? req.theme;

  const deck = top6.map((p) => {
    let role: string;
    if (req.theme === 'status' && p.moves.some((m) => m.statusEffect !== null)) {
      role = '상태이상 유발';
    } else if (p.baseStatTotal >= 500) {
      role = '에이스 어태커';
    } else {
      role = '서포터';
    }

    return {
      dexId: p.dexId,
      role,
      reason: `${p.koName}은(는) 종족값 합 ${p.baseStatTotal}로 ${themeLabel} 조합에 적합합니다.`,
    };
  });

  return {
    deck,
    strategy: `${themeLabel} 전략으로, 보유 포켓몬 중 기준에 부합하는 상위 포켓몬을 우선 편성했습니다. (자동 추천)`,
  };
}
