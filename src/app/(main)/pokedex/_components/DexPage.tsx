'use client';

import { useState } from 'react';

import pokemonData from '../../../../../data/pokemon.json';
import type { PokemonData, PokemonType } from '@/shared/types/pokemon';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import { storageKeys } from '@/app/(main)/(start)/_constants/key';

import SearchBar from './SearchBar';
import PokemonGrid from './PokemonGrid';
import Pagination from './Pagination';
import FloatingButton from '@/app/(main)/pokedex/_components/FloatingButton';
import PokemonDetailModal from '@/shared/components/pokemon/PokemonDetailModal';
import HomeHeader from '@/shared/components/HomeHeader';

const ITEMS_PER_PAGE = 20;

//로컬스토리지에서 보유 포켓몬 정보 가져오기
function getOwnedPokemonsFromStorage(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKeys.TRAINER_DATA);
    if (raw) {
      const parsed = JSON.parse(raw) as TrainerData;
      return parsed.selectedPokemons?.map((p) => p.dexId) ?? [];
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export default function DexPage() {
  const [search, setSearch] = useState('');
  const [generations, setGenerations] = useState<string[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([] as PokemonType[]);
  const [page, setPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [ownedPokemonIds] = useState<number[]>(() => getOwnedPokemonsFromStorage());
  const selectedPokemonCount = ownedPokemonIds.length;

  //임시 - 카드 뽑기 기능 작업 후 로컬스토리지 연동 예정
  const [cardPackCount] = useState(5);

  //필터 변경 시 페이지 초기화
  const handleSetSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSetGenerations = (value: string[]) => {
    setGenerations(value);
    setPage(1);
  };

  const handleSetTypes = (value: PokemonType[]) => {
    setTypes(value);
    setPage(1);
  };

  const data = Object.values(pokemonData) as PokemonData[];
  const filteredData = data.filter((pokemon) => {
    //이름 검색
    const matchSearch = search === '' || pokemon.koName.includes(search);
    //세대 검색
    const matchGeneration =
      generations.length === 0 ||
      generations.some((generation) => pokemon.generation === Number(generation.replace('세대', '')));
    const matchType = types.length === 0 || types.some((type) => pokemon.types.includes(type));
    return matchSearch && matchGeneration && matchType;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-[60px] pb-[60px]">
        <SearchBar
          search={search}
          setSearch={handleSetSearch}
          generations={generations}
          setGenerations={handleSetGenerations}
          types={types}
          setTypes={handleSetTypes}
          selectedPokemonCount={selectedPokemonCount}
        />
        <div style={{ marginTop: '40px' }}>
          <PokemonGrid data={pagedData} onSelect={setSelectedPokemon} ownedPokemonIds={ownedPokemonIds} />
        </div>

        <Pagination page={page} setPage={setPage} totalPages={totalPages} />

        <PokemonDetailModal
          pokemon={selectedPokemon}
          isOpen={selectedPokemon !== null}
          onClose={() => setSelectedPokemon(null)}
        />

        <FloatingButton
          cardPackCount={cardPackCount}
          onClick={() => console.log('카드뽑기 모달 열기')} //임시
        />
      </main>
    </div>
  );
}
