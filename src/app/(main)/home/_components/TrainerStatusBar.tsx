'use client';

// 트레이너 현황 바 — 닉네임, 카드팩, 탑 진행도, 배틀 전적 표시

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Typewriter from 'typewriter-effect';

interface TrainerStatusBarProps {
  trainerName: string;
  cardPackCount: number;
  towerProgress: number;
  battleRecord: string;
}

export default function TrainerStatusBar({
  trainerName,
  cardPackCount,
  towerProgress,
  battleRecord,
}: TrainerStatusBarProps) {
  const router = useRouter();
  const [isPackGuideOpen, setIsPackGuideOpen] = useState(false);
  const hasCardPack = cardPackCount > 0;

  const handleOpenPackGuide = () => {
    if (!hasCardPack) return;
    setIsPackGuideOpen(true);
  };

  const handleMoveToPokedex = () => {
    setIsPackGuideOpen(false);
    router.push('/pokedex');
  };

  return (
    <>
      <section className="relative z-20 mx-auto flex h-16 w-[100%] items-center justify-between rounded-[15px] bg-[#444444] px-8 text-[var(--color-secondary-2)] shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-3 text-lg font-medium">
          <Typewriter
            options={{
              strings: [`안녕하세요, <strong>${trainerName}</strong> 트레이너님! 👋`],
              autoStart: true,
              loop: true,
              delay: 45,
              cursor: '',
            }}
          />
        </div>

        <div className="flex items-center gap-1 text-base text-[#EAEAEA]">
          <div className="relative">
            <button
              type="button"
              onClick={handleOpenPackGuide}
              disabled={!hasCardPack}
              className="text-[#E0E0E0] transition hover:text-white disabled:cursor-default disabled:hover:text-[#E0E0E0]"
            >
              보유 카드팩 <strong className="text-[#FFF]">{cardPackCount}</strong> 개
            </button>
            {hasCardPack && (
              <span className="absolute -top-2 -right-3 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            )}
          </div>
          <span className="pl-[3px] text-[#C0C0C0]">|</span>
          <span className="h-4 w-px bg-[#444444]" />
          <span className="text-[#E0E0E0]">
            탑 진행도 <strong className="text-[#FFF]">{towerProgress}</strong> 층
          </span>
          <span className="pl-[3px] text-[#C0C0C0]">|</span>
          <span className="h-4 bg-[#444444]" />
          <span className="text-[#E0E0E0]">
            배틀 전적 <strong className="text-[#FFF]">{battleRecord}</strong>
          </span>
        </div>
      </section>

      {isPackGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-pack-guide-title"
          onClick={() => setIsPackGuideOpen(false)}
        >
          <div
            className="relative w-full max-w-[420px] rounded-[18px] bg-white px-8 py-9 text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setIsPackGuideOpen(false)}
              className="absolute top-5 right-5 text-[#999999] transition hover:text-[#555555]"
            >
              <X size={28} strokeWidth={2} />
            </button>

            <p id="card-pack-guide-title" className="text-2xl font-extrabold text-[var(--color-base-0)]">
              새로운 카드팩을 뽑을 수 있어요!
            </p>
            <p className="mt-4 text-sm leading-6 text-[#666666]">
              도감으로 이동해 보유한 카드팩을 열고 새로운 포켓몬 카드를 확인해보세요.
            </p>

            <button
              type="button"
              onClick={handleMoveToPokedex}
              className="mt-8 h-12 w-full rounded-xl bg-[var(--color-primary)] text-base font-bold text-[var(--color-base-3)] transition hover:opacity-80"
            >
              도감으로 이동
            </button>
          </div>
        </div>
      )}
    </>
  );
}
