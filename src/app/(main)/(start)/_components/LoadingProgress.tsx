import WalkingSprite from './WalkingSprite';
type LoadingProgressProps = {
  progress: number; // 현재 로딩 진행률
  message: string; // 로딩바 하단에 위차할 문구
};

const MAX_PROGRESS = 100;

export default function LoadingProgress({ progress, message }: LoadingProgressProps) {
  const progressPercentage = Math.min(progress, MAX_PROGRESS); // 혹시 100이 넘어가더라도 최대 100까지만

  return (
    <section className="relative z-10 flex flex-col items-center">
      {/* 로딩바와 퍼센트 텍스트를 감싸는 영역 */}
      <div className="relative mb-1 flex items-center">
        {/* 로딩바 전체 영역 */}
        <div className="relative h-4 w-[360px] overflow-visible">
          <div className="h-full overflow-hidden rounded-full bg-[var(--color-base-3)] shadow-[inset_0_0_4px_rgba(0,0,0,0.18)]">
            <div
              className="h-full rounded-full bg-[#F6B400] transition-[width] duration-[25ms] ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-[#7b7b7b62] shadow-2xl" />
          <div
            className="absolute -top-12 -translate-x-1/2 transition-[left] duration-[25ms] ease-linear"
            style={{ left: `${progressPercentage}%` }}
          >
            <WalkingSprite />
          </div>
        </div>

        <strong className="ml-4 font-['NeoDunggeunmo'] text-3xl font-bold text-neutral-800">
          {progressPercentage}%
        </strong>
      </div>

      <p className="font-['NeoDunggeunmo'] text-lg text-neutral-500">{message}</p>
    </section>
  );
}
