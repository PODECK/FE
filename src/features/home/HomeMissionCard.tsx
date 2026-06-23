import Image from 'next/image';

import { claimDailyMissionReward } from '@/features/mission/actions/dailyMissionActions';
import type { DailyMissionView } from '@/entities/mission/model/types';
import DailyMissionResetTimer from '@/features/mission/components/DailyMissionResetTimer';

const getRewardIconSrc = (rewardText: string) => {
  if (rewardText.includes('카드팩')) {
    return '/images/home/mission/dex.svg';
  }

  return '/images/home/rewards/potion.svg';
};

type HomeMissionCardProps = {
  missions: DailyMissionView[];
};

export default function HomeMissionCard({ missions }: HomeMissionCardProps) {
  return (
    <section className="h-[280px] w-full rounded-[20px] bg-[var(--color-base-3)] px-4 pt-5 pb-2 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base-0 shrink-0 text-base leading-[1.4] font-bold tracking-[-0.4px]">오늘의 미션</h2>
        <DailyMissionResetTimer />
      </div>

      <div className="flex flex-col gap-2">
        {missions.map((mission) => {
          const isClaimable = mission.progressRate >= 100 && !mission.isCompleted;

          const missionCardClassName = mission.isCompleted
            ? 'bg-[#FAFAFA] text-[var(--color-base-1)]'
            : isClaimable
              ? 'bg-[#FFF7E4] text-[var(--color-base-0)]'
              : 'bg-transparent text-[var(--color-base-0)]';

          const progressBarClassName = mission.isCompleted ? 'bg-[#FFD77A]' : 'bg-[#FFB21A]';

          const buttonClassName = mission.isCompleted
            ? 'bg-[#CFCFCF] text-[var(--color-base-3)]'
            : isClaimable
              ? 'bg-[#FFB21A] text-[var(--color-base-3)]'
              : 'bg-[#FFD77A] text-[var(--color-base-3)]';

          return (
            <article
              key={mission.id}
              className={`grid h-[62px] grid-cols-[minmax(0,1fr)_68px] items-center gap-x-3 rounded-[10px] px-3 py-2 ${missionCardClassName}`}
            >
              <div className="min-w-0">
                <p className="mb-1.5 truncate text-[14px] font-semibold">
                  {mission.id === 'type-win' ? mission.title : `${mission.title} (${mission.progressText})`}
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

                <form action={claimDailyMissionReward}>
                  <input type="hidden" name="missionId" value={mission.id} />
                  <button
                    type="submit"
                    disabled={!isClaimable}
                    className={`h-6 w-[56px] cursor-pointer rounded-[7px] text-[12px] font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${buttonClassName}`}
                  >
                    {mission.isCompleted ? '완료' : '수령하기'}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
