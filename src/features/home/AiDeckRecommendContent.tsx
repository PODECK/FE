'use client';

import { useEffect, useState, useTransition } from 'react';

import { RotateCcw } from 'lucide-react';

import { recommendHomeDecks } from '@/features/deck-recommendation/actions/recommendDeck';
import AiDeckCard from '@/features/deck-recommendation/_components/AiDeckCard';
import type { RecommendResponse } from '@/features/deck-recommendation/model/schemas';
import { cn } from '@/shared/lib/cn';

const COOLDOWN_SECONDS = 60;

interface AiDeckRecommendContentProps {
  initial1: RecommendResponse;
  initial2: RecommendResponse;
}

export default function AiDeckRecommendContent({ initial1, initial2 }: AiDeckRecommendContentProps) {
  const [result1, setResult1] = useState(initial1);
  const [result2, setResult2] = useState(initial2);
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleRefresh() {
    startTransition(async () => {
      const { optimal, status } = await recommendHomeDecks();
      setResult1(optimal);
      setResult2(status);
      setCooldown(COOLDOWN_SECONDS);
    });
  }

  const isDisabled = isPending || cooldown > 0;

  return (
    <div className="mt-4 flex flex-col gap-3.75">
      {result1.ok && (
        <AiDeckCard title={result1.data.title} description={result1.data.description} deck={result1.data.deck} />
      )}
      {result2.ok && (
        <AiDeckCard title={result2.data.title} description={result2.data.description} deck={result2.data.deck} />
      )}
      {!result1.ok && !result2.ok && <p className="text-base-1 text-center text-sm">{result1.message}</p>}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isDisabled}
        className="text-base-1 flex w-full items-center justify-start gap-1 tracking-tight transition-opacity disabled:opacity-40"
      >
        <RotateCcw
          className={cn('size-4 shrink-0', isPending && 'animate-[spin_1s_linear_infinite_reverse]')}
          strokeWidth={2.5}
        />
        <span className="shrink-0 text-sm font-semibold">
          {isPending ? '추천 중...' : cooldown > 0 ? `${cooldown}초 후 재추천 가능` : '새로운 덱 추천 받기'}
        </span>
      </button>
    </div>
  );
}
