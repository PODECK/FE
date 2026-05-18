import type { PokemonData } from '@/shared/types';
import { typeColorMap, typeIconMap, typeLabelMap } from '@/app/(main)/(start)/build-deck/_constants/pokemon-type';
import Image from 'next/image';
import { CirclePlus } from 'lucide-react';

type MyDeckPokemonCardProps = {
  pokemon: PokemonData;
  isSelected: boolean;
  onAddPokemon: (pokemon: PokemonData) => void;
};

export default function MyDeckPokemonCard({ pokemon, isSelected, onAddPokemon }: MyDeckPokemonCardProps) {
  return (
    <article className="rounded-[20px] border border-gray-200 bg-[var(--color-base-3)] p-3 shadow-sm">
      <div className="flex h-32 items-center justify-center rounded-[10px] bg-gray-50">
        <Image
          width={140}
          height={140}
          src={pokemon.artworkUrl}
          alt={pokemon.koName}
          className="h-28 w-28 object-contain"
        />
      </div>

      <p className="mt-3 font-mono text-xs text-[var(--color-base-1)]">#{String(pokemon.dexId).padStart(3, '0')}</p>

      <h3 className="text-lg font-extrabold text-[var(--color-base-0)]">{pokemon.koName}</h3>

      <p className="mt-1 text-xs text-[var(--color-base-1)]">{pokemon.category}</p>

      {/* 타입은 검색/필터 기능에서도 재사용될 데이터라 배열 그대로 렌더링합니다. */}
      <div className="mt-4 flex flex-wrap gap-2">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`flex h-6 w-16 items-center justify-center gap-1 rounded-full text-xs font-bold text-[var(--color-base-3)] ${
              typeColorMap[type] ?? 'bg-gray-400'
            }`}
          >
            <Image src={typeIconMap[type]} alt="" width={14} height={14} className="shrink-0" />
            <span className="leading-none">{typeLabelMap[type] ?? type}</span>
          </span>
        ))}
        <button
          type="button"
          onClick={() => onAddPokemon(pokemon)}
          disabled={isSelected}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40"
          aria-label={`${pokemon.koName} 덱에 추가`}
        >
          <CirclePlus
            className={`mb-3 h-6 w-6 ${isSelected ? 'text-[var(--color-base-1)]' : 'text-[var(--color-primary)]'}`}
          />
        </button>
      </div>
    </article>
  );
}
