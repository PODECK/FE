import AiDeckRecommendPanel from '@/app/(main)/home/_components/AiDeckRecommendPanel';
import HomeActionCards from '@/app/(main)/home/_components/HomeActionCards';
import HomeBanner from '@/app/(main)/home/_components/HomeBanner';
import HomeMissionCard from '@/app/(main)/home/_components/HomeMissionCard';
import TrainerStatusCard from '@/app/(main)/home/_components/TrainerStatusCard';
import HomeHeader from '@/shared/components/HomeHeader';
import { redirect } from 'next/navigation';
import { getTrainerSummary } from '@/entities/trainer/api/trainerApi';
import { getPokemonCount } from '@/entities/pokemon/api/pokemonApi';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  const [trainer, totalPokemonCount] = await Promise.all([getTrainerSummary(), getPokemonCount().catch(() => 0)]);

  if (!trainer) {
    redirect('/');
  }

  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[var(--color-base-3)] text-[var(--color-base-1)]">
      <HomeHeader nickname={trainer.nickname} avatarUrl={trainer.avatarUrl} />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col pt-8 pb-8">
        <div className="grid grid-cols-[950px_300px] gap-[30px]">
          <div className="min-w-0">
            <HomeBanner />

            <div className="mt-[30px] grid grid-cols-[300px_minmax(0,1fr)] gap-[30px]">
              <HomeMissionCard />

              <div className="min-h-[260px] rounded-[20px] bg-[var(--color-base-3)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                배틀 히스토리 영역
              </div>
            </div>

            <div className="mt-[30px]">
              <HomeActionCards />
            </div>

            <div className="mt-[30px] min-h-[170px] rounded-[20px] bg-[var(--color-base-3)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              새소식 영역
            </div>
          </div>

          <aside className="flex flex-col gap-[30px]">
            <TrainerStatusCard
              trainerName={trainer.nickname}
              avatarUrl={trainer.avatarUrl}
              cardPackCount={trainer.cardPackCount}
              currentFloor={trainer.currentFloor}
              battleRecord={trainer.battleRecord}
              ownedPokemonCount={trainer.ownedPokemonCount}
              totalPokemonCount={totalPokemonCount}
            />

            <AiDeckRecommendPanel />

            <Link
              href="https://ktcloud-techup.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="kt cloud TECH UP 페이지로 이동"
              className="block h-[170px] overflow-hidden rounded-[20px]"
            >
              <Image
                src="/images/home/ad/techup-banner.svg"
                alt="kt cloud TECH UP 배너"
                width={300}
                height={140}
                className="h-full w-full object-cover transition hover:scale-105"
              />
            </Link>
          </aside>
        </div>
      </div>

      <footer className="pb-6 text-center text-sm text-[#888888]">© 2026 Team 로켓단. All rights reserved.</footer>
    </main>
  );
}
