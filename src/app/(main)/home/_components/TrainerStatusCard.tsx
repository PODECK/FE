'use client';

import Image from 'next/image';
import Link from 'next/link';

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
    <section className="relative h-[380px] overflow-visible rounded-[20px] bg-[var(--color-base-3)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="shrink-0 text-base font-extrabold text-[var(--color-base-0)]">트레이너 정보</h2>
        <span className="text-xs font-extrabold whitespace-nowrap text-[#D6D6D6]">TRAINER&apos;S CARD</span>
      </div>

      <div className="mt-4 flex flex-col items-center text-center">
        <div className="relative h-[46px] w-[46px] overflow-hidden rounded-full bg-[#F4F4F4] ring-4 ring-[#F4F4F4]">
          <Image src={profileImageSrc} alt={`${trainerName} 프로필 이미지`} fill className="object-cover" />
        </div>

        <p className="mt-3 h-[52px] max-w-[230px] text-base leading-[22px] text-[var(--color-base-0)]">
          안녕하세요,
          <br />
          트레이너 <strong className="font-extrabold">{displayTrainerName}</strong>님! 👋
        </p>
      </div>

      {hasCardPack && (
        <Link
          href="/pokedex"
          className="absolute top-[160px] left-[-8px] z-10 rounded-[6px] bg-[#555555] px-2 py-1 text-xs font-extrabold whitespace-nowrap text-[var(--color-base-3)] shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
        >
          열 수 있는 카드팩이 있어요!
          <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-t-[6px] border-x-transparent border-t-[#555555]" />
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
    </section>
  );
}

function TrainerMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2">
      <strong className="block text-[22px] leading-none font-extrabold text-[var(--color-primary)]">{value}</strong>
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
        <div className="mt-[2px] h-2 overflow-hidden rounded-full bg-[#F7F7F7]">
          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${safeRate}%` }} />
        </div>
      </div>

      <div className="text-right">
        <strong className="block translate-y-[6px] text-lg leading-none font-extrabold text-[var(--color-base-0)]">
          {safeRate}%
        </strong>
        <p className="mt-[9px] text-xs font-semibold whitespace-nowrap text-[var(--color-base-1)]">{value}</p>
      </div>
    </div>
  );
}
