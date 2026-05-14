'use client';

import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import type { PokemonData } from '@/shared/types';
import { useCallback, useSyncExternalStore, useMemo } from 'react';
import pokemonDataJson from '../../../../../data/pokemon.json';

function isPokemonData(pokemon: PokemonData | undefined): pokemon is PokemonData {
  return Boolean(pokemon);
}

const pokemonDataById = pokemonDataJson as Record<string, PokemonData>;

export function useMyDeckPokemons() {
  const subscribeTrainerData = useCallback((onStoreChange: () => void) => {
    if (typeof window === 'undefined') return () => {};

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKeys.TRAINER_DATA) {
        onStoreChange();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const trainerDataJson = useSyncExternalStore(
    subscribeTrainerData,
    () => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(storageKeys.TRAINER_DATA);
    },
    () => null,
  ); // localstorage에서 값을 읽을 때 발생할 수 있는 무한 렌더링 방지 목적

  const trainerData = useMemo(() => {
    if (!trainerDataJson) return null;

    try {
      return JSON.parse(trainerDataJson) as TrainerData;
    } catch (error) {
      console.error('트레이너 데이터를 불러오지 못했습니다.', error);
      return null;
    }
  }, [trainerDataJson]);

  const pokemons = useMemo(() => {
    const selectedPokemons = trainerData?.selectedPokemons ?? [];

    //localstorage에 저장된 포켓몬 객체에선 dexId만 사용
    return selectedPokemons.map((pokemon) => pokemonDataById[String(pokemon.dexId)]).filter(isPokemonData);
  }, [trainerData]);

  return {
    pokemons,
    pokemonCount: pokemons.length,
  };
}
