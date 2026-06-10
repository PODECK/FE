'use client';

import { useState, useTransition } from 'react';

import { recommendDeck } from '@/features/deck-recommendation/actions/recommendDeck';
import AiDeckCard from '@/features/deck-recommendation/_components/AiDeckCard';
import type { RecommendResponse } from '@/features/deck-recommendation/model/schemas';

interface AiDeckRecommendContentProps {
  initial1: RecommendResponse;
  initial2: RecommendResponse;
}

export default function AiDeckRecommendContent({ initial1, initial2 }: AiDeckRecommendContentProps) {
  const [result1, setResult1] = useState(initial1);
  const [result2, setResult2] = useState(initial2);
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      const [r1, r2] = await Promise.all([recommendDeck({ theme: 'optimal' }), recommendDeck({ theme: 'status' })]);
      setResult1(r1);
      setResult2(r2);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {result1.ok && (
        <AiDeckCard
          title={result1.data.title}
          description={result1.data.description}
          slotCount={result1.data.deck.length}
        />
      )}
      {result2.ok && (
        <AiDeckCard
          title={result2.data.title}
          description={result2.data.description}
          slotCount={result2.data.deck.length}
        />
      )}
      {!result1.ok && !result2.ok && <p className="text-base-1 text-center text-sm">{result1.message}</p>}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        className="text-primary mx-auto flex items-center gap-1 text-xs font-semibold tracking-tight transition-opacity disabled:opacity-40"
      >
        {isPending ? '추천 중...' : '새로운 덱 추천 받기'}
      </button>
    </div>
  );
}
