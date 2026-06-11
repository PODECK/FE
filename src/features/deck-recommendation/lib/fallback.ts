import type { RecommendRequest, RecommendedDeck, RosterPokemon } from '../model/schemas';

const THEME_LABELS: Record<string, string> = {
  optimal: '최적',
  status: '상태이상',
  counter: '카운터',
};

export function fallbackRecommendation(req: RecommendRequest, candidates: RosterPokemon[]): RecommendedDeck {
  const top6 = candidates.slice(0, 6);
  const themeLabel = THEME_LABELS[req.theme] ?? req.theme;

  const deck = top6.map((p) => ({
    dexId: p.dexId,
    koName: p.koName,
    artworkUrl: p.artworkUrl,
  }));

  return {
    title: `${themeLabel} 추천덱`,
    description: `${themeLabel} 전략으로 이겨보자!`,
    deck,
    strategy: `${themeLabel} 전략으로, 보유 포켓몬 중 기준에 부합하는 상위 포켓몬을 우선 편성했습니다. (자동 추천)`,
  };
}
