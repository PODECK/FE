'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';

type Props = {
  card: GachaCard;
  isRevealed: boolean;
  onClick: () => void;
};

export default function GachaCardItem({ card, isRevealed, onClick }: Props) {
  const [flipComplete, setFlipComplete] = useState(false);

  useEffect(() => {
    if (!isRevealed) return;
    const timer = setTimeout(() => setFlipComplete(true), 750);
    return () => clearTimeout(timer);
  }, [isRevealed]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative ${isRevealed ? 'pointer-events-none cursor-default' : 'cursor-pointer'}`}
      style={{ width: 112, height: 168, perspective: 1000, zIndex: isRevealed ? 10 : undefined }}
      aria-label={`${card.pokemon.koName} 카드 ${isRevealed ? '정보' : '공개'}`}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        whileHover={!isRevealed ? { y: 10, transition: { duration: 0.15 } } : {}}
        transition={{ rotateY: { duration: 0.7, ease: 'easeInOut' } }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* 뒷면 */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg"
          style={{ backfaceVisibility: 'hidden', outline: '4px solid #EBEBEB', backgroundColor: 'var(--color-base-3)' }}
        >
          <Image
            src="/images/shared/silhouette.svg"
            alt="실루엣"
            width={80}
            height={80}
            style={{ filter: 'invert(1)', opacity: 0.1 }}
          />
        </div>

        {/* 앞면 */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <motion.div
            className="absolute inset-0 rounded-lg"
            initial={{ filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' }}
            animate={
              flipComplete
                ? card.isNew
                  ? {
                      filter: [
                        'drop-shadow(0 0 6px rgba(255, 180, 29, 0.25))',
                        'drop-shadow(0 0 22px rgba(255, 180, 29, 0.6))',
                        'drop-shadow(0 0 6px rgba(255, 180, 29, 0.25))',
                      ],
                    }
                  : { filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.3))' }
                : { filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' }
            }
            transition={{
              duration: flipComplete ? 2 : 0.6,
              repeat: flipComplete && card.isNew ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <Image
                src={`/images/pokemon-cards/${card.pokemon.dexId}.png`}
                alt={card.pokemon.koName}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 신규 / 중복 뱃지 */}
      {isRevealed && (
        <span
          className="absolute top-[-26px] right-[5px] flex items-center justify-center rounded-full text-xs font-bold text-[var(--color-base-3)]"
          style={{ width: 40, height: 20, backgroundColor: card.isNew ? 'var(--color-primary)' : '#ccc' }}
        >
          {card.isNew ? 'NEW' : '중복'}
        </span>
      )}

      {/* 신규 카드 shine 효과 */}
      {flipComplete && card.isNew && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="shine" />
        </div>
      )}
    </button>
  );
}
