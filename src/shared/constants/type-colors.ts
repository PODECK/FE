// 포켓몬 타입별 카드 배경 그라디언트 색상 (card.svg 풀 타입 기준 설계)

import type { PokemonType } from '@/shared/types/pokemon';

export type TypeGradient = { from: string; to: string };

// card.svg grass 타입 그라디언트: #A9E288 → #308400 기준으로 전 타입 설계
export const typeGradients: Record<PokemonType, TypeGradient> = {
  normal: { from: '#D4D0CB', to: '#7A7668' },
  fire: { from: '#FFBA88', to: '#C83010' },
  water: { from: '#90D0FF', to: '#1068C8' },
  electric: { from: '#FFEC70', to: '#C89800' },
  grass: { from: '#A9E288', to: '#308400' },
  ice: { from: '#B8EEFF', to: '#18A0C0' },
  fighting: { from: '#FFB878', to: '#A83000' },
  poison: { from: '#DCB0E8', to: '#6A2090' },
  ground: { from: '#ECD888', to: '#906020' },
  flying: { from: '#CCDFFF', to: '#5878C8' },
  psychic: { from: '#FFC0C8', to: '#C02050' },
  bug: { from: '#D4E870', to: '#607020' },
  rock: { from: '#DDD8A8', to: '#807040' },
  ghost: { from: '#C0A8D0', to: '#482860' },
  dragon: { from: '#A8B0F0', to: '#2030A8' },
  dark: { from: '#9A8878', to: '#302020' },
  steel: { from: '#D4E0E8', to: '#4888A8' },
};
