import type { PokemonData } from '@/shared/types/pokemon';

export type SelectedPokemon = PokemonData;

export interface TrainerData {
  nickname: string;
  createdAt: string;
  selectedPokemons?: SelectedPokemon[];
  activeDeckDexIds?: number[]; // 내 덱 편성에서 쓰일 필드
  cardPackCount?: number;
}
