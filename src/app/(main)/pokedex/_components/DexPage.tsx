'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';

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
import CardGachaModal from './CardGachaModal';

const ITEMS_PER_PAGE = 20;

const TRAINER_DATA_UPDATED_EVENT = 'trainer-data-updated';

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(TRAINER_DATA_UPDATED_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(TRAINER_DATA_UPDATED_EVENT, callback);
  };
}

function getTrainerDataSnapshot() {
  return localStorage.getItem(storageKeys.TRAINER_DATA);
}

function getServerSnapshot() {
  return null;
}

function parseOwnedPokemonIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TrainerData;
    return parsed.selectedPokemons?.map((p) => p.dexId) ?? [];
  } catch {
    return [];
  }
}

export default function DexPage() {
  const [search, setSearch] = useState('');
  const [generations, setGenerations] = useState<string[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([] as PokemonType[]);
  const [page, setPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const trainerDataJson = useSyncExternalStore(subscribeToStorage, getTrainerDataSnapshot, getServerSnapshot);
  const ownedPokemonIds = useMemo(() => parseOwnedPokemonIds(trainerDataJson), [trainerDataJson]);
  const selectedPokemonCount = ownedPokemonIds.length;
  const cardPackCount = useMemo(() => {
    if (!trainerDataJson) return 0;
    try {
      const raw = (JSON.parse(trainerDataJson) as { cardPackCount?: number }).cardPackCount;
      if (!Number.isFinite(raw)) return 0;
      return Math.max(0, Math.floor(raw ?? 0));
    } catch {
      return 0;
    }
  }, [trainerDataJson]);

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

        <FloatingButton cardPackCount={cardPackCount} onClick={() => setIsGachaOpen(true)} />

        <CardGachaModal isOpen={isGachaOpen} onClose={() => setIsGachaOpen(false)} packCount={cardPackCount} />
      </main>
    </div>
  );
}
