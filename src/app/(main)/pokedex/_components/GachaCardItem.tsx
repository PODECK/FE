'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';

type Props = {
  card: GachaCard;
  isRevealed: boolean;
  onClick: () => void;
};

export default function GachaCardItem({ card, isRevealed, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative ${isRevealed ? 'pointer-events-none cursor-default' : 'cursor-pointer'}`}
      style={{ width: 120, height: 168, perspective: 1000 }}
      aria-label={`${card.pokemon.koName} 카드 ${isRevealed ? '정보' : '공개'}`}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0, y: 0 }}
        whileHover={!isRevealed ? { y: 10, transition: { duration: 0.15 } } : {}}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* 뒷면 */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg"
          style={{
            backfaceVisibility: 'hidden',
            outline: '4px solid #EBEBEB',
            backgroundColor: 'white',
          }}
        >
          <Image
            src="/images/silhouette.svg"
            alt="실루엣"
            width={80}
            height={80}
            style={{ filter: 'invert(1)', opacity: 0.1 }}
          />
        </div>

        {/* 앞면 */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            outline: `4px solid ${card.isNew ? '#FFEBC5' : '#EBEBEB'}`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <Image
              src={`/images/pokemon-cards/${card.pokemon.dexId}.png`}
              alt={card.pokemon.koName}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* 신규 / 중복 뱃지 */}
      {isRevealed && (
        <span
          className="absolute top-[-32px] right-[-3px] flex items-center justify-center rounded-full text-xs font-bold text-[var(--color-base-3)]"
          style={{ width: 40, height: 20, backgroundColor: card.isNew ? 'var(--color-primary)' : '#ccc' }}
        >
          {card.isNew ? 'NEW' : '중복'}
        </span>
      )}

      {/* 신규 카드 glow 효과 */}
      {isRevealed && card.isNew && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              '0 0 8px 2px rgba(255, 180, 29, 0.2)',
              '0 0 24px 10px rgba(255, 180, 29, 0.2)',
              '0 0 8px 2px rgba(255, 180, 29, 0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* 신규 카드 shine 효과 */}
      {isRevealed && card.isNew && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="shine" />
        </div>
      )}
    </button>
  );
}
