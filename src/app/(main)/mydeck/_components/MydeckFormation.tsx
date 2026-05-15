import type { PokemonData } from '@/shared/types';
import Image from 'next/image';
import { X } from 'lucide-react';

type MyDeckFormationProps = {
  selectedPokemons: PokemonData[];
  onRemovePokemon: (dexId: number) => void;
};

const MAX_DECK_SIZE = 6;

export default function MyDeckFormation({ selectedPokemons, onRemovePokemon }: MyDeckFormationProps) {
  const slots = Array.from({ length: MAX_DECK_SIZE }, (_, index) => selectedPokemons[index] ?? null);

  return (
    <section className="bg-gradient-primary mx-auto mt-15 max-w-[1150px] rounded-[20px] px-6 py-5">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--color-base-3)]">내 덱 편성</h2>
          <p className="text-sm font-semibold text-[var(--color-base-3)]">
            {selectedPokemons.length} / {MAX_DECK_SIZE}
          </p>
        </div>

        <div className="grid grid-cols-6 gap-6">
          {slots.map((pokemon, index) => (
            <div
              key={pokemon?.dexId ?? `empty-${index}`}
              className="relative flex aspect-[3/4] h-[220px] w-full items-center justify-center rounded-lg border border-[var(--color-base-3)]/20 bg-[var(--color-base-3)]/10"
            >
              {pokemon ? (
                <>
                  <Image
                    src={pokemon.artworkUrl}
                    alt={pokemon.koName}
                    width={140}
                    height={140}
                    className="mb-5 h-[110px] w-[110px] object-contain"
                  />

                  <button
                    type="button"
                    onClick={() => onRemovePokemon(pokemon.dexId)}
                    className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-base-0)]/50 text-[var(--color-base-3)]"
                    aria-label={`${pokemon.koName} 덱에서 제거`}
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <span className="absolute bottom-2 max-w-[80%] truncate text-sm font-bold text-[var(--color-base-3)]">
                    {pokemon.koName}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[var(--color-primary)]">+</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
