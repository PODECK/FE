import Image from 'next/image';

import { homeMissionItems } from '@/app/(main)/home/_constants/home';

const getRewardIconSrc = (rewardText: string) => {
  if (rewardText.includes('카드팩')) {
    return '/images/pokedex/card-icon.svg';
  }

  return '/images/home/rewards/potion.svg';
};

export default function HomeMissionCard() {
  return (
    <section className="h-[280px] w-full rounded-[20px] bg-[var(--color-base-3)] px-4 pt-4 pb-2 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="shrink-0 text-lg font-extrabold text-[var(--color-base-0)]">오늘의 미션</h2>
        <span className="shrink-0 text-xs font-semibold text-[var(--color-base-1)]">초기화까지 09:28:45</span>
      </div>

      <div className="flex flex-col gap-2">
        {homeMissionItems.map((mission) => {
          const isClaimable = mission.progressRate >= 100 && !mission.isCompleted;

          const missionCardClassName = mission.isCompleted
            ? 'bg-[#FAFAFA] text-[var(--color-base-1)]'
            : isClaimable
              ? 'bg-[#FFF7E4] text-[var(--color-base-0)]'
              : 'bg-transparent text-[var(--color-base-0)]';

          const progressBarClassName = mission.isCompleted ? 'bg-[#FFD77A]' : 'bg-[#FFB21A]';

          const buttonClassName = mission.isCompleted
            ? 'bg-[#CFCFCF] text-white'
            : isClaimable
              ? 'bg-[#FFB21A] text-[var(--color-base-3)]'
              : 'bg-[#FFD77A] text-[var(--color-base-3)]';

          return (
            <article
              key={mission.id}
              className={`grid h-[62px] grid-cols-[minmax(0,1fr)_68px] items-center gap-x-3 rounded-[10px] px-3 py-2 ${missionCardClassName}`}
            >
              <div className="min-w-0">
                <p className="mb-1.5 truncate text-xs font-extrabold">
                  {mission.title} ({mission.progressText})
                </p>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#E8E8E8]">
                  <div
                    className={`h-full rounded-full ${progressBarClassName}`}
                    style={{ width: `${mission.progressRate}%` }}
                  />
                </div>
              </div>

              <div className="flex w-[68px] flex-col items-end gap-1 justify-self-end">
                <span className="flex items-center justify-end gap-1 text-[10px] font-semibold whitespace-nowrap text-[#777777]">
                  <Image
                    src={getRewardIconSrc(mission.rewardText)}
                    alt=""
                    width={13}
                    height={13}
                    className={mission.isCompleted ? 'shrink-0 grayscale' : 'shrink-0'}
                  />
                  {mission.rewardText}
                </span>

                <button
                  type="button"
                  disabled={!isClaimable}
                  className={`h-6 w-[56px] rounded-[7px] text-[10px] font-extrabold transition disabled:cursor-not-allowed ${buttonClassName}`}
                >
                  {mission.isCompleted ? '완료' : '수령하기'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
