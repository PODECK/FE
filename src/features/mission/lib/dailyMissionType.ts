// 오늘의 달성 타입 결정

import { POKEMON_TYPES, type PokemonTypeId } from '@/shared/constants/pokemonTypes';

export type DailyMissionType = PokemonTypeId;

export function getDailyMissionType(dateKey: string): DailyMissionType {
  const seed = [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return POKEMON_TYPES[seed % POKEMON_TYPES.length];
}
