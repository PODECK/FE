'use client';

import ChatbotModal from '@/features/chat/ChatbotModal';
import { cn } from '@/shared/lib/cn';
import { useOverlayStore } from '@/shared/stores/overlayStore';
import { BotIcon } from 'lucide-react';
import Image from 'next/image';
import CardGachaModal from './CardGachaModal';

type Props = {
  mode: 'card' | 'chatbot';
  cardPackCount?: number;
  currentFloor?: number;
};

export default function FloatingButton({ mode, cardPackCount = 0, currentFloor = 1 }: Props) {
  const { isChatOpen } = useOverlayStore((state) => state);
  const { toggleChat, openGacha } = useOverlayStore((state) => state.actions);
  return (
    <>
      {mode === 'card' && <CardButton cardPackCount={cardPackCount ?? 0} onClick={openGacha} />}
      {mode === 'chatbot' && <ChatbotButton onClick={() => toggleChat(currentFloor)} isChatOpen={isChatOpen} />}

      {isChatOpen && <ChatbotModal />}
      <CardGachaModal packCount={cardPackCount ?? 0} />
    </>
  );
}

function CardButton({ cardPackCount, onClick }: { cardPackCount: number; onClick: () => void }) {
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

function ChatbotButton({ onClick, isChatOpen }: { onClick: () => void; isChatOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-10 bottom-10 flex cursor-pointer flex-col items-center gap-2"
      style={{ zIndex: 40 }}
    >
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: isChatOpen ? '#ffb41d' : '#fff',
          boxShadow: isChatOpen ? '0 0 15px rgba(255, 180, 29, 0.6)' : '0 4px 12px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={(e) => {
          if (!isChatOpen) e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 180, 29, 0.4)';
        }}
        onMouseLeave={(e) => {
          if (!isChatOpen) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <BotIcon className={cn('size-6', isChatOpen ? 'text-base-3' : 'text-base-0')} />
      </div>
    </button>
  );
}
