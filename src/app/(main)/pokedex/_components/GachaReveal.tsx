'use client';

import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import GachaCardItem from './GachaCardItem';

const confettiColors = ['#FFB41D', '#FFD166', '#A78BFA', '#C4B5FD', '#FF8FAB', '#5EEAD4'];

const cardReflectStyle: CSSProperties = {
  WebkitBoxReflect: 'below -10px linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0), rgba(0,0,0,0.05))',
};

type Props = {
  cards: GachaCard[];
  onComplete: () => void;
};

export default function GachaReveal({ cards, onComplete }: Props) {
  const [revealed, setRevealed] = useState<boolean[]>(Array(cards.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fireConfetti = (index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 40,
      spread: 55,
      startVelocity: 22,
      origin: { x, y },
      colors: confettiColors,
      shapes: ['square', 'circle'],
      scalar: 0.85,
      gravity: 1.1,
    });
  };

  const handleReveal = (index: number) => {
    setRevealed((prev) => prev.map((v, i) => (i === index ? true : v)));
    if (cards[index].isNew) fireConfetti(index);
  };

  const handleRevealAll = () => {
    setRevealed(Array(cards.length).fill(true));
  };

  const allRevealed = revealed.every(Boolean);

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-16">
        <div className="text-center">
          <h2 className="text-[30px] font-bold" style={{ color: 'var(--color-base-0)' }}>
            카드를 {cards.length}장 획득했어요!
          </h2>
          <p className="mt-1.5 text-lg" style={{ color: '#666666' }}>
            카드를 뒤집어 결과를 확인해보세요
          </p>
        </div>

        <div className="flex gap-[15px]">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: index * 0.08 }}
              style={revealed[index] ? cardReflectStyle : undefined}
            >
              <GachaCardItem card={card} isRevealed={revealed[index]} onClick={() => handleReveal(index)} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-[15px] py-[40px]">
        <button
          type="button"
          onClick={handleRevealAll}
          disabled={allRevealed}
          className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 enabled:hover:opacity-70 disabled:opacity-50"
          style={{ width: 180, height: 65, backgroundColor: 'var(--color-primary)', color: 'var(--color-base-3)' }}
        >
          모두 공개
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!allRevealed}
          className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 enabled:hover:opacity-70 disabled:opacity-40"
          style={{ width: 180, height: 65, backgroundColor: 'var(--color-secondary-1)', color: 'var(--color-base-3)' }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
