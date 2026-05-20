'use client';

import { motion } from 'framer-motion';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import GachaCardItem from './GachaCardItem';

type Props = {
  cards: GachaCard[];
  packCount: number;
  onPullAgain: () => void;
  onClose: () => void;
};

export default function GachaResult({ cards, packCount, onPullAgain, onClose }: Props) {
  const newCount = cards.filter((c) => c.isNew).length;
  const dupCount = cards.length - newCount;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-16">
        <div className="text-center">
          <h2 className="text-[32px] font-bold" style={{ color: 'var(--color-base-0)' }}>
            획득한 카드
          </h2>
          <p className="mt-1 text-lg" style={{ color: '#666666' }}>
            신규 카드 <span className="font-bold">{newCount}</span> 장&nbsp;<span style={{ color: '#ccc' }}>|</span>
            &nbsp;중복 카드 <span className="font-bold">{dupCount}</span> 장
          </p>
        </div>

        <div className="flex gap-[15px]">
          {cards.map((card) => (
            <GachaCardItem key={card.pokemon.dexId} card={card} isRevealed={true} onClick={() => {}} />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3 py-[40px]">
        {/* 한 번 더 뽑기 버튼, 말풍선 */}
        <div className="relative flex flex-col items-center">
          {packCount > 0 && (
            <motion.div
              className="absolute bottom-full mb-2"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--color-secondary-1)' }}
              >
                남은 카드팩 {packCount}개
              </div>
              {/* 말풍선 꼬리 */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: 'calc(100% - 1px)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `6px solid var(--color-secondary-1)`,
                }}
              />
            </motion.div>
          )}
          <button
            onClick={onPullAgain}
            disabled={packCount === 0}
            className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 enabled:hover:opacity-70 disabled:opacity-40"
            style={{ width: 180, height: 65, backgroundColor: 'var(--color-primary)', color: 'var(--color-base-3)' }}
          >
            한 번 더 뽑기
          </button>
        </div>

        <button
          onClick={onClose}
          className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 hover:opacity-70"
          style={{ width: 180, height: 65, backgroundColor: 'var(--color-base-2)', color: 'var(--color-secondary-1)' }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
