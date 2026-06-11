'use client';

import Image from 'next/image';
import Link from 'next/link';
import Typewriter from 'typewriter-effect';

import HomeSidebarPanel from '@/features/home/HomeSidebarPanel';
import Tooltip from '@/shared/components/Tooltip';

interface TrainerStatusCardProps {
  trainerName: string;
  avatarUrl?: string | null;
  cardPackCount: number;
  currentFloor: number;
  battleRecord: {
    wins: number;
    losses: number;
  };
  ownedPokemonCount: number;
  totalPokemonCount: number;
  itemCollectionCount?: number;
  totalItemCount?: number;
}

const MAX_TRAINER_NAME_LENGTH = 5;

export default function TrainerStatusCard({
  trainerName,
  avatarUrl,
  cardPackCount,
  currentFloor,
  battleRecord,
  ownedPokemonCount,
  totalPokemonCount,
  itemCollectionCount = 12,
  totalItemCount = 80,
}: TrainerStatusCardProps) {
  const pokemonRate = Math.round((ownedPokemonCount / Math.max(totalPokemonCount, 1)) * 100);
  const itemRate = Math.round((itemCollectionCount / Math.max(totalItemCount, 1)) * 100);
  const profileImageSrc = avatarUrl ?? '/images/home/status/base_profile.svg';
  const hasCardPack = cardPackCount > 0;

  const displayTrainerName =
    trainerName.length > MAX_TRAINER_NAME_LENGTH ? `${trainerName.slice(0, MAX_TRAINER_NAME_LENGTH)}...` : trainerName;

  return (
    <HomeSidebarPanel title="트레이너 정보" badge="TRAINER'S CARD" className="h-95 overflow-visible">
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="relative size-11.5 overflow-hidden rounded-full bg-[#F4F4F4] ring-4 ring-[#F4F4F4]">
          <Image src={profileImageSrc} alt={`${trainerName} 프로필 이미지`} fill className="object-cover" />
        </div>

        <div className="mt-3 h-13 max-w-57.5 text-base leading-5.5 text-[var(--color-base-0)]">
          <Typewriter
            onInit={(typewriter) => {
              typewriter.typeString(`안녕하세요,<br />트레이너 <strong>${displayTrainerName}</strong>님! 👋`).start();
            }}
            options={{
              delay: 60,
              cursor: '',
            }}
          />
        </div>
      </div>

      {hasCardPack && (
        <Link href="/pokedex" className="absolute top-40 -left-2 z-10">
          <Tooltip text="열 수 있는 카드팩이 있어요!" />
        </Link>
      )}

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#E8E8E8] text-center">
        <TrainerMetric value={`${cardPackCount}개`} label="보유 카드팩" />
        <TrainerMetric value={`${currentFloor}층`} label="탑 진행도" />
        <TrainerMetric value={`${battleRecord.wins}승 ${battleRecord.losses}패`} label="배틀 전적" />
      </div>

      <div className="mt-6 space-y-5">
        <StatusProgress
          iconSrc="/images/home/status/ball.svg"
          label="보유한 포켓몬"
          rate={pokemonRate}
          value={`${ownedPokemonCount} / ${totalPokemonCount}`}
        />
        <StatusProgress
          iconSrc="/images/home/status/item.svg"
          label="아이템 수집률"
          rate={itemRate}
          value={`${itemCollectionCount} / ${totalItemCount}`}
        />
      </div>
    </HomeSidebarPanel>
  );
}

function TrainerMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2">
      <strong className="block text-xl leading-none font-extrabold text-[var(--color-primary)]">{value}</strong>
      <p className="mt-2 text-xs font-semibold text-[var(--color-base-1)]">{label}</p>
    </div>
  );
}

function StatusProgress({
  iconSrc,
  label,
  rate,
  value,
}: {
  iconSrc: string;
  label: string;
  rate: number;
  value: string;
}) {
  const safeRate = Math.min(Math.max(rate, 0), 100);

  return (
    <div className="grid grid-cols-[50px_minmax(0,1fr)_52px] items-center gap-1">
      <Image src={iconSrc} alt="" width={35} height={35} className="ml-3" />

      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[var(--color-base-0)]">{label}</p>
        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-[#F7F7F7]">
          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${safeRate}%` }} />
        </div>
      </div>

      <div className="text-right">
        <strong className="block translate-y-1.5 text-lg leading-none font-extrabold text-[var(--color-base-0)]">
          {safeRate}%
        </strong>
        <p className="mt-2.25 text-xs font-semibold whitespace-nowrap text-[var(--color-base-1)]">{value}</p>
      </div>
    </div>
  );
}
