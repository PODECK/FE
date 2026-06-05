import HomeActionCards from '@/app/(main)/home/_components/HomeActionCards';
import HomeBanner from '@/app/(main)/home/_components/HomeBanner';
import TrainerStatusBar from '@/app/(main)/home/_components/TrainerStatusBar';
import HomeHeader from '@/shared/components/HomeHeader';
import { redirect } from 'next/navigation';
import { getTrainerSummary } from '@/entities/trainer/api/trainerApi';
import { getPokemonCount } from '@/entities/pokemon/api/pokemonApi';

export default async function HomePage() {
  const [trainer, totalPokemonCount] = await Promise.all([getTrainerSummary(), getPokemonCount().catch(() => 0)]);

  if (!trainer) {
    redirect('/');
  }

  const battleRecord = trainer.battleRecord ?? { wins: 0, losses: 0 };

  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[var(--color-base-3)] text-[var(--color-base-1)]">
      <HomeHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-14 pb-8">
        <HomeBanner />
        <TrainerStatusBar
          trainerName={trainer.nickname}
          cardPackCount={trainer.cardPackCount ?? 0}
          towerProgress={trainer.currentFloor}
          battleRecord={`${battleRecord.wins}승 ${battleRecord.losses}패`}
        />
        <HomeActionCards selectedPokemonCount={trainer.ownedPokemonCount} totalPokemonCount={totalPokemonCount} />
      </div>

      <footer className="pb-6 text-center text-sm text-[#888888]">© 2026 Team 로켓단. All rights reserved.</footer>
    </main>
  );
}
