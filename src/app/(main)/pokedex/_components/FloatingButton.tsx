'use client';

import { motion } from 'framer-motion';
import { BotIcon, Layers } from 'lucide-react';

import ChatbotModal from '@/features/chat/ChatbotModal';
import { cn } from '@/shared/lib/cn';
import { useOverlayStore } from '@/shared/stores/overlay-store';

import CardGachaModal from './CardGachaModal';

type Props = {
  mode: 'card' | 'chatbot';
  cardPackCount?: number;
  currentFloor?: number;
  ownedCount?: number;
  totalCount?: number;
};

export default function FloatingButton({
  mode,
  cardPackCount = 0,
  currentFloor = 1,
  ownedCount = 0,
  totalCount = 0,
}: Props) {
  const { isChatOpen } = useOverlayStore((state) => state);
  const { toggleChat, openGacha } = useOverlayStore((state) => state.actions);
  return (
    <>
      {mode === 'card' && <CardButton cardPackCount={cardPackCount ?? 0} onClick={openGacha} />}
      {mode === 'chatbot' && <ChatbotButton onClick={() => toggleChat(currentFloor)} isChatOpen={isChatOpen} />}

      {isChatOpen && <ChatbotModal />}
      <CardGachaModal packCount={cardPackCount ?? 0} ownedCount={ownedCount} totalCount={totalCount} />
    </>
  );
}

function CardButton({ cardPackCount, onClick }: { cardPackCount: number; onClick: () => void }) {
  const isEmpty = cardPackCount === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-10 bottom-10 flex cursor-pointer flex-col items-center gap-2"
      style={{ zIndex: 40 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        {/* 회전 광선 — 카드팩 있을 때만 */}
        {!isEmpty && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              background:
                'repeating-conic-gradient(rgba(255, 180, 29, 0.35) 0deg, transparent 5deg, transparent 15deg, rgba(255, 180, 29, 0.35) 15deg)',
              maskImage: 'radial-gradient(circle, transparent 33px, black 40px)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 33px, black 40px)',
            }}
          />
        )}

        {/* 원형 버튼 */}
        <div
          className="relative flex items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-80"
          style={{
            width: 64,
            height: 64,
            backgroundColor: isEmpty ? '#AAAAAA' : 'var(--color-primary)',
            boxShadow: isEmpty ? '0 4px 16px rgba(0,0,0,0.15)' : '0 4px 16px rgba(255, 180, 29, 0.5)',
          }}
        >
          {/* 카드팩 개수 뱃지 */}
          <div
            className="absolute flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              minWidth: 26,
              height: 18,
              padding: '0 5px',
              backgroundColor: 'white',
              color: isEmpty ? '#AAAAAA' : 'var(--color-primary)',
              top: -4,
              right: -10,
            }}
          >
            {cardPackCount}회
          </div>

          {isEmpty ? (
            <Layers size={30} color="white" />
          ) : (
            <motion.div
              animate={{ y: [0, -4, 0, -2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.0, ease: 'easeOut' }}
            >
              <Layers size={30} color="white" />
            </motion.div>
          )}
        </div>
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
      type="button"
      onClick={onClick}
      data-tour-id="ai-chat"
      className="fixed right-10 bottom-10 flex cursor-pointer flex-col items-center gap-2"
      style={{ zIndex: 40 }}
    >
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: isChatOpen ? 'var(--color-primary)' : 'var(--color-base-3)',
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
