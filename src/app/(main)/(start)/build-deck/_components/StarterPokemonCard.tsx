import { typeColorMap, typeIconMap, typeLabelMap } from '@/app/(main)/(start)/build-deck/_constants/pokemon-type';
import type { PokemonData } from '@/shared/types/pokemon';
import Image from 'next/image';

type StarterPokemonCardProps = {
  pokemon: PokemonData;
  isSelected: boolean;
  onSelectedPokemon: (pokemon: PokemonData) => void;
  onOpenDetail: (pokemonId: number) => void;
};

export default function StarterPokemonCard({
  pokemon,
  isSelected,
  onSelectedPokemon,
  onOpenDetail,
}: StarterPokemonCardProps) {
  return (
    <article
      className={`relative flex min-h-[270px] flex-col items-center justify-center rounded-lg border bg-[#FCFCFC] p-6 transition ${
        isSelected ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(251,191,36,0.35)]' : 'border-[#EEEEEE]'
      }`}
    >
      <button
        type="button"
        aria-label={`${pokemon.koName} 선택`}
        onClick={() => onSelectedPokemon(pokemon)}
        className="absolute inset-0 z-10 rounded-lg"
      />
      <button
        type="button"
        onClick={() => onOpenDetail(pokemon.dexId)}
        className="absolute top-6 left-6 z-20 cursor-grab rounded-full bg-[#EDEDED] px-3 py-1 text-xs font-bold text-[#999999]"
      >
        상세정보
      </button>
      <Image
        src={pokemon.artworkUrl}
        alt={pokemon.koName}
        width={140}
        height={140}
        className="h-28 w-28 object-contain"
      />
      <strong className="mt-3 text-xl font-bold text-[var(--color-base-0)]">{pokemon.koName}</strong>
      <strong className="mt-2 text-sm text-[#AAAAAA]">{pokemon.enName}</strong>
      <div className="mt-3 flex gap-2">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${
              typeColorMap[type] ?? 'bg-gray-400'
            }`}
          >
            <Image src={typeIconMap[type]} alt="" width={14} height={14} />
            {typeLabelMap[type] ?? type}
          </span>
        ))}
      </div>
    </article>
  );
}
