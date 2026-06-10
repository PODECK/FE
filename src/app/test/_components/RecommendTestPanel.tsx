'use client';

import { useState, useTransition } from 'react';
import { testRecommendDeck } from '../actions/testRecommendDeck';
import type { RecommendResponse } from '@/features/deck-recommendation/model/schemas';
import type { PokemonType } from '@/shared/types/pokemon';

const THEMES = ['optimal', 'status', 'counter'] as const;
type Theme = (typeof THEMES)[number];

const COUNTER_TARGETS: PokemonType[] = [
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
  'normal',
];

export default function RecommendTestPanel() {
  const [theme, setTheme] = useState<Theme>('optimal');
  const [counterTarget, setCounterTarget] = useState<PokemonType>('fire');
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const input = theme === 'counter' ? { theme, counterTarget } : { theme };
    startTransition(async () => {
      const res = await testRecommendDeck(input);
      setResult(res);
    });
  }

  return (
    <div className="min-h-dvh bg-gray-950 p-8 text-white">
      <h1 className="mb-6 text-2xl font-bold">덱 추천 AI — 테스트</h1>

      {/* 테마 선택 */}
      <div className="mb-4 flex gap-2">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              theme === t ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 카운터 타겟 */}
      {theme === 'counter' && (
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">카운터 타겟 타입</label>
          <select
            value={counterTarget}
            onChange={(e) => setCounterTarget(e.target.value as PokemonType)}
            className="rounded bg-gray-800 px-3 py-2 text-sm text-white"
          >
            {COUNTER_TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 실행 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mb-8 rounded bg-green-600 px-6 py-3 font-bold hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? '추천 중...' : '추천 받기'}
      </button>

      {/* 결과 */}
      {result && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
          {!result.ok ? (
            <p className="text-red-400">❌ {result.message}</p>
          ) : (
            <>
              <div className="mb-3 flex gap-4 text-xs text-gray-400">
                <span>model: {result.model}</span>
                <span>cached: {String(result.cached)}</span>
              </div>
              <p className="mb-4 rounded bg-gray-800 p-3 text-sm text-gray-200">{result.data.strategy}</p>
              <div className="grid gap-3">
                {result.data.deck.map((p) => (
                  <div key={p.dexId} className="rounded border border-gray-700 bg-gray-800 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-yellow-400">#{p.dexId}</span>
                      <span className="text-sm text-gray-200">{p.koName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
