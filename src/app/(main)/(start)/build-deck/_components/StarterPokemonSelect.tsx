'use client';

import type { Generation } from '../_types/pokemon';
import { useMemo, useState, useTransition } from 'react';
import type { SelectedPokemon } from '@/app/(main)/(start)/_types/trainer';
import { generationTabs, starterPokemonDexIds } from '@/app/(main)/(start)/build-deck/_constants/starter-pokemon';
import DialogBox from '@/shared/components/DialogBox';
import GenerationTabs from './GenerationTabs';
import { motion } from 'framer-motion';
import StarterPokemonCard from '@/app/(main)/(start)/build-deck/_components/StarterPokemonCard';
import type { PokemonData } from '@/shared/types/pokemon';
import PokemonDetailModal from '@/shared/components/pokemon/PokemonDetailModal';
import { useRouter } from 'next/navigation';
import { getPokemonByDexId } from '@/shared/data/pokemon-catalog';
import { toast } from 'sonner';
import { selectStarterPokemons } from '@/features/trainer/actions/trainerActions';

type StarterPokemonSelectProps = {
  trainerName: string;
};

export default function StarterPokemonSelect({ trainerName }: StarterPokemonSelectProps) {
  const [activeGeneration, setActiveGeneration] = useState<Generation>(1);
  const [detailPokemon, setDetailPokemon] = useState<PokemonData | null>(null);
  const [selectedPokemons, setSelectedPokemons] = useState<SelectedPokemon[]>([]);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const maxSelectedPokemonCount = 3;

  const pokemons = useMemo(() => {
    return starterPokemonDexIds
      .map((pokemonId) => getPokemonByDexId(pokemonId))
      .filter((pokemon): pokemon is PokemonData => Boolean(pokemon))
      .filter((pokemon) => pokemon.generation === activeGeneration);
  }, [activeGeneration]);

  const selectedPokemonIds = selectedPokemons.map((pokemon) => pokemon.dexId);

  const handleConfirmPokemonSelection = () => {
    if (selectedPokemons.length !== maxSelectedPokemonCount) {
      toast.warning('포켓몬 3마리를 선택해주세요.');
      return;
    }

    startTransition(async () => {
      const result = await selectStarterPokemons(selectedPokemons.map((pokemon) => pokemon.dexId));

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push('/loading');
    });
  };

  const handleOpenDetail = async (pokemonId: number) => {
    setDetailPokemon(getPokemonByDexId(pokemonId) ?? null);
  };

  const handleCloseDetail = () => {
    setDetailPokemon(null);
  };

  const handleSelectGeneration = (generation: Generation) => {
    setActiveGeneration(generation);
  };

  const handleSelectPokemon = (pokemon: SelectedPokemon) => {
    setSelectedPokemons((prevSelectedPokemons) => {
      const isAlreadySelected = prevSelectedPokemons.some((selectedPokemon) => selectedPokemon.dexId === pokemon.dexId);

      if (isAlreadySelected) {
        return prevSelectedPokemons.filter((selectedPokemon) => selectedPokemon.dexId !== pokemon.dexId);
      }

      if (prevSelectedPokemons.length >= maxSelectedPokemonCount) {
        return prevSelectedPokemons;
      }

      return [...prevSelectedPokemons, pokemon];
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <header className="text-center">
        <p className="text-lg font-semibold text-[var(--color-primary)]">TRAINER</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#333333]">{trainerName}</h1>
      </header>

      <DialogBox className="max-w-[1040px]" contentClassName="px-12 py-10" isShowIndicator={false}>
        <section className="flex flex-col items-center gap-6">
          <h2 className="flex items-center justify-center gap-3 text-center text-xl font-bold text-[var(--color-base-0)]">
            바깥은 혼자 돌아다니기엔 위험하단다. 이 아이들 중 세 마리를 데리고 가렴!
            <motion.span
              aria-hidden="true"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-1 h-0 w-0 shrink-0 border-x-[8px] border-t-[13px] border-[var(--color-primary)] border-x-transparent"
            />
          </h2>

          <GenerationTabs
            tabs={generationTabs}
            activeGeneration={activeGeneration}
            onSelectGeneration={handleSelectGeneration}
          />

          <div className="grid w-full grid-cols-3 gap-6">
            {pokemons.map((pokemon) => (
              <StarterPokemonCard
                key={pokemon.dexId}
                pokemon={pokemon}
                isSelected={selectedPokemonIds.includes(pokemon.dexId)}
                onSelectedPokemon={handleSelectPokemon}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>

          <PokemonDetailModal pokemon={detailPokemon} isOpen={detailPokemon !== null} onClose={handleCloseDetail} />

          <motion.button
            type="button"
            onClick={handleConfirmPokemonSelection}
            disabled={isPending || selectedPokemonIds.length !== maxSelectedPokemonCount}
            className="h-14 w-full rounded-lg bg-[var(--color-primary)] text-xl font-bold text-[var(--color-base-3)] shadow-[0_6px_18px_rgba(251,180,29,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? '저장 중...' : `선택하기 (${selectedPokemonIds.length}/${maxSelectedPokemonCount})`}
          </motion.button>
        </section>
      </DialogBox>
    </div>
  );
}
