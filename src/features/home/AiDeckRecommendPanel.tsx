import { Suspense } from 'react';

import { recommendHomeDecks } from '@/features/deck-recommendation/actions/recommendDeck';

import AiDeckRecommendContent from './AiDeckRecommendContent';
import AiDeckRecommendSkeleton from './AiDeckRecommendSkeleton';
import HomeSidebarPanel from './HomeSidebarPanel';

async function AiDeckRecommendLoader() {
  const { decks } = await recommendHomeDecks();
  return <AiDeckRecommendContent initialResults={decks} />;
}

export default function AiDeckRecommendPanel() {
  return (
    <HomeSidebarPanel title="AI 추천 덱" badge="DECK ASSIST" className="min-h-138.75">
      <Suspense fallback={<AiDeckRecommendSkeleton />}>
        <AiDeckRecommendLoader />
      </Suspense>
    </HomeSidebarPanel>
  );
}
