import { recommendHomeDecks } from '@/features/deck-recommendation/actions/recommendDeck';

import AiDeckRecommendContent from './AiDeckRecommendContent';
import HomeSidebarPanel from './HomeSidebarPanel';

export default async function AiDeckRecommendPanel() {
  const { optimal: result1, status: result2 } = await recommendHomeDecks();

  return (
    <HomeSidebarPanel title="AI 추천 덱" badge="DECK ASSIST" className="min-h-[445px]">
      <AiDeckRecommendContent initial1={result1} initial2={result2} />
    </HomeSidebarPanel>
  );
}
