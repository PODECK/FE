'use client';

// 홈 페이지 — 트레이너 데이터 확인 후 배너, 상태바, 액션 카드 렌더링

import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import HomeActionCards from '@/app/(main)/home/_components/HomeActionCards';
import HomeBanner from '@/app/(main)/home/_components/HomeBanner';
import HomeHeader from '@/app/(main)/home/_components/HomeHeader';
import TrainerStatusBar from '@/app/(main)/home/_components/TrainerStatusBar';
import { useTowerProgress } from '@/shared/hooks/use-tower-progress';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

const subscribeTrainerStorage = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
};

const getTrainerSnapshot = () => {
  try {
    return localStorage.getItem(storageKeys.TRAINER_DATA);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getServerTrainerSnapshot = () => undefined;

export default function HomePage() {
  const router = useRouter();
  const { progress } = useTowerProgress();

  const trainerData = useSyncExternalStore(subscribeTrainerStorage, getTrainerSnapshot, getServerTrainerSnapshot);

  const parsedTrainerData = useMemo(() => {
    if (trainerData === undefined || trainerData === null) {
      return trainerData;
    }

    try {
      return JSON.parse(trainerData) as TrainerData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [trainerData]);

  const hasValidTrainer =
    parsedTrainerData !== undefined &&
    parsedTrainerData !== null &&
    typeof parsedTrainerData.nickname === 'string' &&
    parsedTrainerData.nickname.trim().length > 0;

  useEffect(() => {
    // /home 직접 접근 시 트레이너 데이터가 없으면 /로 리다이렉트
    if (parsedTrainerData === null) {
      router.replace('/');
    }
  }, [parsedTrainerData, router]);

  if (!hasValidTrainer) return null;

  const selectedPokemonCount = parsedTrainerData.selectedPokemons?.length ?? 0;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#FFFFFF] text-[#999999]">
      <HomeHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-14 pb-8">
        <HomeBanner />

        <TrainerStatusBar
          trainerName={parsedTrainerData.nickname}
          cardPackCount={progress.cardPackCount}
          towerProgress={12}
          battleRecord="8승 3패"
        />

        <HomeActionCards selectedPokemonCount={selectedPokemonCount} />
      </div>

      <footer className="pb-6 text-center text-sm text-[#888888]">© 2026 Team 로켓단. All rights Reserved</footer>
    </main>
  );
}
