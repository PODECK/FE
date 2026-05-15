'use client';

import MyDeckFilterBar from '@/app/(main)/mydeck/_components/MyDeckFilterBar';
import MyDeckPokemonGrid from '@/app/(main)/mydeck/_components/MyDeckPokemonGrid';
import EmptyMyDeck from '@/app/(main)/mydeck/_components/EmptyMyDeck';
import { useMyDeckPokemons } from '@/app/(main)/mydeck/_hooks/useMyDeckPokemons';
import HomeHeader from '@/shared/components/HomeHeader';
import { useMemo, useState, useCallback } from 'react';
import type { PokemonData } from '@/shared/types';
import MyDeckFormation from '@/app/(main)/mydeck/_components/MydeckFormation';
import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import Pagination from '@/app/(main)/pokedex/_components/Pagination';

const MAX_DECK_SIZE = 6;

const ITEMS_PER_PAGE = 20;

// localStorage에 저장된 트레이너 데이터를 안전하게 읽어옴
// 브라우저 환경이 아니거나 JSON 파싱에 실패하면 null을 반환
function readTrainerData() {
  if (typeof window === 'undefined') return null;

  try {
    const rawData = window.localStorage.getItem(storageKeys.TRAINER_DATA);
    return rawData ? (JSON.parse(rawData) as TrainerData) : null;
  } catch {
    return null;
  }
}

// 저장된 트레이너 데이터에서 현재 편성된 덱의 포켓몬 dexId 목록을 가져오기
function readActiveDeckDexIds() {
  return readTrainerData()?.activeDeckDexIds ?? [];
}

// 현재 편성된 덱의 포켓몬 dexId 목록을 기존 트레이너 데이터에 병합해 저장
function saveActiveDeckDexIds(dexIds: number[]) {
  const trainerData = readTrainerData();
  if (!trainerData) return;

  window.localStorage.setItem(
    storageKeys.TRAINER_DATA,
    JSON.stringify({
      ...trainerData,
      activeDeckDexIds: dexIds,
    }),
  );
}

export default function MyDeckPage() {
  const { pokemons, pokemonCount } = useMyDeckPokemons();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPokemonDexIds, setSelectedPokemonDexIds] = useState<number[]>(readActiveDeckDexIds);
  const [page, setPage] = useState(1);

  const selectedPokemons = useMemo(() => {
    return selectedPokemonDexIds
      .map((dexId) => pokemons.find((pokemon) => pokemon.dexId === dexId))
      .filter((pokemon): pokemon is PokemonData => Boolean(pokemon));
  }, [pokemons, selectedPokemonDexIds]);

  const filteredPokemons = useMemo(() => {
    const trimmedKeyword = searchKeyword.trim();
    const lowerCaseKeyword = trimmedKeyword.toLowerCase();

    if (!trimmedKeyword) return pokemons;

    return pokemons.filter((pokemon) => {
      return pokemon.koName.includes(trimmedKeyword) || pokemon.enName.toLowerCase().includes(lowerCaseKeyword);
    });
  }, [pokemons, searchKeyword]);

  const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE);
  const currentPage = totalPages < 1 ? 1 : Math.min(Math.max(page, 1), totalPages);

  const selectedSlotPokemonIds = useMemo(() => {
    return new Set(selectedPokemonDexIds);
  }, [selectedPokemonDexIds]);

  const pagedPokemons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPokemons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPokemons, currentPage]);

  const handleResetSearchKeyword = () => {
    setSearchKeyword('');
    setPage(1);
  };

  const handleAddPokemon = useCallback((pokemon: PokemonData) => {
    setSelectedPokemonDexIds((prev) => {
      if (prev.includes(pokemon.dexId)) return prev;
      if (prev.length >= MAX_DECK_SIZE) return prev;

      const nextDexIds = [...prev, pokemon.dexId];
      saveActiveDeckDexIds(nextDexIds);

      return nextDexIds;
    });
  }, []);

  const handleRemovePokemon = useCallback((dexId: number) => {
    setSelectedPokemonDexIds((prev) => {
      const nextDexIds = prev.filter((selectedDexId) => selectedDexId !== dexId);
      saveActiveDeckDexIds(nextDexIds);

      return nextDexIds;
    });
  }, []);

  return (
    <main className="mx-auto w-full max-w-full">
      <HomeHeader />

      <MyDeckFormation selectedPokemons={selectedPokemons} onRemovePokemon={handleRemovePokemon} />

      <MyDeckFilterBar
        pokemonCount={pokemonCount}
        searchKeyword={searchKeyword}
        onChangeSearchKeyword={(keyword) => {
          setSearchKeyword(keyword);
          setPage(1);
        }}
        onResetSearchKeyword={handleResetSearchKeyword}
      />

      {pokemonCount > 0 ? (
        <MyDeckPokemonGrid
          pokemons={pagedPokemons}
          selectedSlotPokemonIds={selectedSlotPokemonIds}
          onAddPokemon={handleAddPokemon}
        />
      ) : (
        <EmptyMyDeck />
      )}

      <Pagination page={currentPage} setPage={setPage} totalPages={totalPages} />
    </main>
  );
}
