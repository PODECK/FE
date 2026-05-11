import StarterPokemonSelect from '@/app/(main)/(start)/build-deck/_components/StarterPokemonSelect';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';

export default function BuildDeckPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F9F9F9] to-[#E1E1E1]">
      <SilhouetteBackground
        className="right-[-420px] bottom-[-450px] rotate-45 opacity-20 sm:right-[-370px] sm:bottom-[-500px]"
        imageClassName="h-[1200px] w-[1200px] sm:h-[1300px] sm:w-[1300px]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-8">
        <StarterPokemonSelect />
      </div>
    </main>
  );
}
