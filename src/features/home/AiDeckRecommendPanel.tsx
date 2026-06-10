import { recommendDeck } from '@/features/deck-recommendation/actions/recommendDeck';

import AiDeckRecommendContent from './AiDeckRecommendContent';
import HomeSidebarPanel from './HomeSidebarPanel';

export default async function AiDeckRecommendPanel() {
  const [result1, result2] = await Promise.all([
    recommendDeck({ theme: 'optimal' }),
    recommendDeck({ theme: 'status' }),
  ]);

  return (
    <HomeSidebarPanel title="AI 추천 덱" badge="DECK ASSIST" className="min-h-138.75">
      <AiDeckRecommendContent initial1={result1} initial2={result2} />
    </HomeSidebarPanel>
  );
}
