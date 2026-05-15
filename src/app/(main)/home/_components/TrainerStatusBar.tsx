// 트레이너 현황 바 — 닉네임, 카드팩, 탑 진행도, 배틀 전적 표시

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
  return (
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
          <span className="text-[#E0E0E0]">
            보유 카드팩 <strong className="text-[#FFF]">{cardPackCount}</strong> 개
          </span>
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
  );
}
