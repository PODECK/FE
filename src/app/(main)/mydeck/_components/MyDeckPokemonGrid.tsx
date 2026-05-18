'use client';

import MyDeckPokemonCard from '@/app/(main)/mydeck/_components/MyDeckPokemonCard';
import type { PokemonData } from '@/shared/types';
import { useMemo } from 'react';

type MyDeckPoekmonGridProps = {
  pokemons: PokemonData[];
  selectedSlotPokemonIds: Set<number>;
  onAddPokemon: (pokemon: PokemonData) => void;
};

export default function MyDeckPokemonGrid({ pokemons, selectedSlotPokemonIds, onAddPokemon }: MyDeckPoekmonGridProps) {
  const sortedPokemons = useMemo(() => {
    return [...pokemons].sort((a, b) => a.dexId - b.dexId);
  }, [pokemons]);

  // 포켓몬 검색을 잘못했거나 검색 결과가 없을 시
  if (!pokemons || pokemons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <h2 className="text-2xl font-extrabold">검색결과가 없습니다.</h2>
        <p>다른 키워드로 검색해주세요.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto mt-4 grid max-w-[1150px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {/* 포켓몬 오름차순 정렬 */}
      {sortedPokemons.map((pokemon) => (
        <MyDeckPokemonCard
          key={pokemon.dexId}
          pokemon={pokemon}
          isSelected={selectedSlotPokemonIds.has(pokemon.dexId)}
          onAddPokemon={onAddPokemon}
        />
      ))}
    </section>
  );
}
