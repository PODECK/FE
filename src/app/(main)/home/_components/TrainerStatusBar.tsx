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
    <section className="relative z-20 mx-auto flex h-16 w-[100%] items-center justify-between rounded-lg bg-[#444444] px-8 text-[var(--color-secondary-2)] shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
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

      <div className="flex items-center gap-5 text-base text-[#EAEAEA]">
        <div className="relative">
          {/* <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-md">
            열 수 있는 카드팩이 있어요!
          </span> */}
          <span>보유 카드팩 {cardPackCount} 개</span>
        </div>
        <span>|</span>
        <span className="h-4 w-px bg-[#444444]" />
        <span>탑 진행도 {towerProgress} 층</span>
        <span>|</span>
        <span className="h-4 w-px bg-[#444444]" />
        <span>배틀 전적 {battleRecord}</span>
      </div>
    </section>
  );
}
