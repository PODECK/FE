import type { PokemonData } from '@/shared/types/pokemon';

export type SelectedPokemon = PokemonData;

export interface TrainerData {
  nickname: string;
  createdAt: string;
  selectedPokemons?: SelectedPokemon[];
}
