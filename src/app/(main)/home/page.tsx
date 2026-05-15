'use client';

import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import HomeActionCards from '@/app/(main)/home/_components/HomeActionCards';
import HomeBanner from '@/app/(main)/home/_components/HomeBanner';
import HomeHeader from '@/shared/components/HomeHeader';
import TrainerStatusBar from '@/app/(main)/home/_components/TrainerStatusBar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import pokemonData from '../../../../data/pokemon.json';

/* hydration error 방지 */
const subscribeTrainerStorage = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
};

/* 브라우저에서 현재 localStorage 값을 읽는 함수 */
const getTrainerSnapshot = () => {
  try {
    return localStorage.getItem(storageKeys.TRAINER_DATA);
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* 서버에서 localStorage 확인 */
const getServerTrainerSnapshot = () => undefined;

export default function HomePage() {
  const router = useRouter();

  const trainerData = useSyncExternalStore(subscribeTrainerStorage, getTrainerSnapshot, getServerTrainerSnapshot);

  /* localstorage에서 가져온 JSON 문자열을 실제 객체로 변환 */
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
    // /home 직접 접근 시 트레이너 데이터가 없으면 /로 돌리는 가드 역할
    if (parsedTrainerData === null) {
      router.replace('/');
    }
  }, [parsedTrainerData, router]);

  if (!hasValidTrainer) return null;

  // 홈 화면 카드 섹션에서 보여줄 포유 포켓몬 갯수 관리 상수
  const selectedPokemonCount = parsedTrainerData.selectedPokemons?.length ?? 0;
  const totalPokemonCount = Object.keys(pokemonData).length;

  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[var(--color-base-3)] text-[var(--color-base-1)]">
      <HomeHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-14 pb-8">
        <HomeBanner />
        <TrainerStatusBar
          trainerName={parsedTrainerData.nickname}
          cardPackCount={5}
          towerProgress={12}
          battleRecord="8승 3패"
        />
        <HomeActionCards selectedPokemonCount={selectedPokemonCount} totalPokemonCount={totalPokemonCount} />
      </div>

      <footer className="pb-6 text-center text-sm text-[#888888]">© 2026 Team 로켓단. All rights Reserved.</footer>
    </main>
  );
}
