import { recommendHomeDecks } from '@/features/deck-recommendation/actions/recommendDeck';

import AiDeckRecommendContent from './AiDeckRecommendContent';
import HomeSidebarPanel from './HomeSidebarPanel';

export default async function AiDeckRecommendPanel() {
  const { decks } = await recommendHomeDecks();

  return (
    <HomeSidebarPanel title="AI 추천 덱" badge="DECK ASSIST" className="min-h-138.75">
      <AiDeckRecommendContent initialResults={decks} />
    </HomeSidebarPanel>
  );
}
