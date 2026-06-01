import StarterPokemonSelect from '@/app/(main)/(start)/build-deck/_components/StarterPokemonSelect';
import { getOnboardingPath, getTrainerProfile } from '@/entities/trainer/api/trainerApi';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';
import { redirect } from 'next/navigation';

export default async function BuildDeckPage() {
  const nextPath = await getOnboardingPath();

  if (nextPath !== '/build-deck') {
    redirect(nextPath);
  }

  const trainer = await getTrainerProfile();

  if (!trainer) {
    redirect('/nickname');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F9F9F9] to-[#E1E1E1]">
      <SilhouetteBackground
        className="right-[-420px] bottom-[-450px] rotate-45 opacity-20 sm:right-[-370px] sm:bottom-[-500px]"
        imageClassName="h-[1200px] w-[1200px] sm:h-[1300px] sm:w-[1300px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-8">
        <StarterPokemonSelect trainerName={trainer.nickname} />
      </div>
    </main>
  );
}
