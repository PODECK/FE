'use client';

import Image from 'next/image';

type Props = {
  cardPackCount: number;
  onClick: () => void;
};

export default function FloatingButton({ cardPackCount, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed right-10 bottom-10 flex cursor-pointer flex-col items-center gap-2"
      style={{ zIndex: 40 }}
    >
      {/* 원형 버튼 */}
      <div
        className="relative flex items-center justify-center rounded-full transition-shadow duration-300"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 180, 29, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        {/* 카드팩 개수 뱃지 */}
        <div
          className="absolute flex items-center justify-center rounded-full text-xs font-bold text-white"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: cardPackCount === 0 ? 'var(--color-base-1)' : 'var(--color-primary)',
            top: '-5px',
            right: '-5px',
          }}
        >
          {cardPackCount}회
        </div>

        {/* 카드 아이콘 */}
        <Image src="/images/pokedex/card-icon.svg" alt="카드 뽑기" width={28} height={28} unoptimized />
      </div>

      {/* 라벨 */}
      <span className="text-sm font-bold" style={{ color: 'var(--color-base-0)' }}>
        카드 뽑기
      </span>
    </button>
  );
}
