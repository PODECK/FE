'use client';

import { useEffect, useState, useTransition } from 'react';

import { RotateCcw } from 'lucide-react';

import { recommendHomeDecks } from '@/features/deck-recommendation/actions/recommendDeck';
import AiDeckCard from '@/features/deck-recommendation/_components/AiDeckCard';
import type { RecommendResponse } from '@/features/deck-recommendation/model/schemas';
import { cn } from '@/shared/lib/cn';

const COOLDOWN_SECONDS = 60;
const COOLDOWN_KEY = 'deck-recommend-cooldown-expires';

function getRemainingCooldown(): number {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return 0;
    const remaining = Math.ceil((Number(raw) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

interface AiDeckRecommendContentProps {
  initialResults: [RecommendResponse, RecommendResponse];
}

export default function AiDeckRecommendContent({ initialResults }: AiDeckRecommendContentProps) {
  const [results, setResults] = useState<[RecommendResponse, RecommendResponse]>(initialResults);
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const remaining = getRemainingCooldown();
    setTimeout(() => {
      setCooldown(remaining);
    }, 0);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleRefresh() {
    startTransition(async () => {
      const { decks } = await recommendHomeDecks();
      setResults(decks);
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_SECONDS * 1000));
      setCooldown(COOLDOWN_SECONDS);
    });
  }

  const isDisabled = isPending || cooldown > 0;
  const [first, second] = results;
  const allFailed = !first.ok && !second.ok;

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {first.ok && <AiDeckCard title={first.data.title} description={first.data.description} deck={first.data.deck} />}
      {second.ok && (
        <AiDeckCard title={second.data.title} description={second.data.description} deck={second.data.deck} />
      )}
      {allFailed && <p className="text-base-1 text-center text-sm">{first.message}</p>}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isDisabled}
        className="text-base-1 mt-1 flex w-full cursor-pointer items-center justify-start gap-1 tracking-tight transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
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
