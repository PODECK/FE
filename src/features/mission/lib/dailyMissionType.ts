import { PokemonType } from '@/shared/types/pokemon';

export type DailyMissionType = PokemonType;

export function getDailyMissionType(dateKey: string): DailyMissionType {
  const seed = [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return PokemonType.options[seed % PokemonType.options.length];
}
