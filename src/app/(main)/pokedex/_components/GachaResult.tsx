'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { GachaCard } from '@/app/(main)/pokedex/_lib/cardGacha';
import GachaCardItem from './GachaCardItem';
import GachaParticles from './GachaParticles';

const cardReflectStyle: CSSProperties = {
  WebkitBoxReflect: 'below -10px linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0), rgba(0,0,0,0.05))',
};

type Props = {
  cards: GachaCard[];
  packCount: number;
  ownedCountBefore: number;
  ownedCountAfter: number;
  totalCount: number;
  onPullAgain: () => void;
  onClose: () => void;
};

export default function GachaResult({
  cards,
  packCount,
  ownedCountBefore,
  ownedCountAfter,
  totalCount,
  onPullAgain,
  onClose,
}: Props) {
  const newCount = cards.filter((c) => c.isNew).length;
  const dupCount = cards.length - newCount;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-16">
        <GachaParticles />
        <div className="relative z-[1] flex flex-col items-center gap-5">
          <h2 className="text-[30px] font-bold" style={{ color: 'var(--color-base-0)' }}>
            획득한 카드를 도감에 등록했어요
          </h2>
          {/* 상태 바 */}
          <div
            className="flex items-center gap-2.5 rounded-full px-5 py-2 text-sm"
            style={{ border: '1.5px solid #EBEBEB', backgroundColor: 'var(--color-base-3)' }}
          >
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              NEW
            </span>
            <span className="font-bold" style={{ color: 'var(--color-secondary-1)' }}>
              {newCount}장
            </span>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: '#ccc' }}>
              중복
            </span>
            <span className="font-bold" style={{ color: 'var(--color-secondary-1)' }}>
              {dupCount}장
            </span>
            <span style={{ color: '#ddd' }}>|</span>
            <span style={{ color: '#666' }}>도감 진행도</span>
            <span>
              <span className="font-bold" style={{ color: 'var(--color-secondary-1)' }}>
                {ownedCountBefore}
              </span>
              <span className="font-bold" style={{ color: 'var(--color-secondary-1)' }}>
                {' '}
                / {totalCount}
              </span>
            </span>
            <ArrowRight size={14} style={{ color: 'var(--color-base-1)' }} />
            <span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>
                {ownedCountAfter}
              </span>
              <span className="font-bold" style={{ color: 'var(--color-secondary-1)' }}>
                {' '}
                / {totalCount}
              </span>
            </span>
            {newCount > 0 && (
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                (+{newCount})
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[1] flex gap-[15px]">
          {cards.map((card, index) => (
            <div key={index} style={cardReflectStyle}>
              <GachaCardItem card={card} isRevealed={true} onClick={() => {}} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-[5] flex justify-center gap-3 py-[40px]">
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
            type="button"
            onClick={onPullAgain}
            disabled={packCount === 0}
            className="cursor-pointer rounded-xl text-lg font-bold transition-opacity duration-200 enabled:hover:opacity-70 disabled:opacity-40"
            style={{ width: 180, height: 65, backgroundColor: 'var(--color-primary)', color: 'var(--color-base-3)' }}
          >
            한 번 더 뽑기
          </button>
        </div>

        <button
          type="button"
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
