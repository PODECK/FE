// 포켓몬 타입별 카드 배경 그라디언트 색상 (card.svg 풀 타입 기준 설계)

import type { PokemonType } from '@/shared/types/pokemon';

export type TypeGradient = { from: string; to: string };

// 실제 색상값은 globals.css @theme의 --color-type-gradient-* 변수가 SSOT
export const typeGradients: Record<PokemonType, TypeGradient> = {
  normal: { from: 'var(--color-type-gradient-normal-from)', to: 'var(--color-type-gradient-normal-to)' },
  fire: { from: 'var(--color-type-gradient-fire-from)', to: 'var(--color-type-gradient-fire-to)' },
  water: { from: 'var(--color-type-gradient-water-from)', to: 'var(--color-type-gradient-water-to)' },
  electric: { from: 'var(--color-type-gradient-electric-from)', to: 'var(--color-type-gradient-electric-to)' },
  grass: { from: 'var(--color-type-gradient-grass-from)', to: 'var(--color-type-gradient-grass-to)' },
  ice: { from: 'var(--color-type-gradient-ice-from)', to: 'var(--color-type-gradient-ice-to)' },
  fighting: { from: 'var(--color-type-gradient-fighting-from)', to: 'var(--color-type-gradient-fighting-to)' },
  poison: { from: 'var(--color-type-gradient-poison-from)', to: 'var(--color-type-gradient-poison-to)' },
  ground: { from: 'var(--color-type-gradient-ground-from)', to: 'var(--color-type-gradient-ground-to)' },
  flying: { from: 'var(--color-type-gradient-flying-from)', to: 'var(--color-type-gradient-flying-to)' },
  psychic: { from: 'var(--color-type-gradient-psychic-from)', to: 'var(--color-type-gradient-psychic-to)' },
  bug: { from: 'var(--color-type-gradient-bug-from)', to: 'var(--color-type-gradient-bug-to)' },
  rock: { from: 'var(--color-type-gradient-rock-from)', to: 'var(--color-type-gradient-rock-to)' },
  ghost: { from: 'var(--color-type-gradient-ghost-from)', to: 'var(--color-type-gradient-ghost-to)' },
  dragon: { from: 'var(--color-type-gradient-dragon-from)', to: 'var(--color-type-gradient-dragon-to)' },
  dark: { from: 'var(--color-type-gradient-dark-from)', to: 'var(--color-type-gradient-dark-to)' },
  steel: { from: 'var(--color-type-gradient-steel-from)', to: 'var(--color-type-gradient-steel-to)' },
};

export const typeBadgeColors: Record<PokemonType, string> = {
  normal: 'var(--color-type-badge-normal)',
  fire: 'var(--color-type-badge-fire)',
  water: 'var(--color-type-badge-water)',
  electric: 'var(--color-type-badge-electric)',
  grass: 'var(--color-type-badge-grass)',
  ice: 'var(--color-type-badge-ice)',
  fighting: 'var(--color-type-badge-fighting)',
  poison: 'var(--color-type-badge-poison)',
  ground: 'var(--color-type-badge-ground)',
  flying: 'var(--color-type-badge-flying)',
  psychic: 'var(--color-type-badge-psychic)',
  bug: 'var(--color-type-badge-bug)',
  rock: 'var(--color-type-badge-rock)',
  ghost: 'var(--color-type-badge-ghost)',
  dragon: 'var(--color-type-badge-dragon)',
  dark: 'var(--color-type-badge-dark)',
  steel: 'var(--color-type-badge-steel)',
};

export function getTypeBadgeColor(type: string | undefined): string {
  if (!type || !(type in typeBadgeColors)) return 'var(--color-base-1)';

  return typeBadgeColors[type as PokemonType];
}
