import type { PokemonData } from '@/shared/types/pokemon';
import PokemonListCard from './PokemonListCard';

type Props = {
  data: PokemonData[];
  onSelect: (pokemon: PokemonData) => void;
  ownedPokemonIds: number[];
};

export default function PokemonGrid({ data, onSelect, ownedPokemonIds }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <h2 className="text-2xl font-extrabold">검색결과가 없습니다.</h2>
        <p>다른 키워드로 검색해주세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: '15px' }}>
      {data.map((pokemon) => (
        <PokemonListCard
          key={pokemon.dexId}
          pokemon={pokemon}
          owned={ownedPokemonIds.includes(pokemon.dexId)}
          onClick={() => onSelect(pokemon)}
        />
      ))}
    </div>
  );
}
