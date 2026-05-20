'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import GachaCardItem from './GachaCardItem';

type Props = {
  cards: GachaCard[];
  onComplete: () => void;
};

export default function GachaReveal({ cards, onComplete }: Props) {
  const [revealed, setRevealed] = useState<boolean[]>(Array(cards.length).fill(false));

  const handleReveal = (index: number) => {
    setRevealed((prev) => prev.map((v, i) => (i === index ? true : v)));
  };

  const handleRevealAll = () => {
    setRevealed(Array(cards.length).fill(true));
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-16">
        <div className="text-center">
          <h2 className="text-[32px] font-bold" style={{ color: 'var(--color-base-0)' }}>
            획득한 카드
          </h2>
          <p className="mt-1 text-lg" style={{ color: '#666666' }}>
            카드를 눌러 결과를 확인하세요
          </p>
        </div>

        <div className="flex gap-[15px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.pokemon.dexId}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: index * 0.08 }}
            >
              <GachaCardItem card={card} isRevealed={revealed[index]} onClick={() => handleReveal(index)} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-[15px] py-[40px]">
        <button
          onClick={handleRevealAll}
          disabled={revealed.every(Boolean)}
          className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 enabled:hover:opacity-70 disabled:opacity-50"
          style={{ width: 180, height: 65, backgroundColor: 'var(--color-primary)', color: 'var(--color-base-3)' }}
        >
          모두 공개
        </button>
        <button
          onClick={onComplete}
          className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 hover:opacity-70"
          style={{ width: 180, height: 65, backgroundColor: 'var(--color-secondary-1)', color: 'var(--color-base-3)' }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
