import MyDeckPoekmonCard from '@/app/(main)/mydeck/_components/MyDeckPokemonCard';
import type { PokemonData } from '@/shared/types';

type MyDeckPoekmonGridProps = {
  pokemons: PokemonData[];
  selectedSlotPokemonIds: Set<number>;
  onAddPokemon: (pokemon: PokemonData) => void;
};

export default function MyDeckPokemonGrid({ pokemons, selectedSlotPokemonIds, onAddPokemon }: MyDeckPoekmonGridProps) {
  return (
    <section className="mx-auto mt-4 grid max-w-[1150px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {pokemons.map((pokemon) => (
        <MyDeckPoekmonCard
          key={pokemon.dexId}
          pokemon={pokemon}
          isSelected={selectedSlotPokemonIds.has(pokemon.dexId)}
          onAddPokemon={onAddPokemon}
        />
      ))}
    </section>
  );
}
