import type { PokemonType } from '@/shared/types/pokemon';

export const TYPE_CONFIG: Record<
  PokemonType,
  {
    label: string;
    color: string;
    gradient: string;
    icon: string;
  }
> = {
  normal: {
    label: '노말',
    color: 'var(--color-type-normal)',
    icon: '/images/pokemon-types/normal.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-normal) 30%, white) 0%, white 100%)',
  },
  fire: {
    label: '불꽃',
    color: 'var(--color-type-fire)',
    icon: '/images/pokemon-types/fire.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-fire) 30%, white) 0%, white 100%)',
  },
  water: {
    label: '물',
    color: 'var(--color-type-water)',
    icon: '/images/pokemon-types/water.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-water) 30%, white) 0%, white 100%)',
  },
  grass: {
    label: '풀',
    color: 'var(--color-type-grass)',
    icon: '/images/pokemon-types/grass.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-grass) 30%, white) 0%, white 100%)',
  },
  electric: {
    label: '전기',
    color: 'var(--color-type-electric)',
    icon: '/images/pokemon-types/electric.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-electric) 30%, white) 0%, white 100%)',
  },
  ice: {
    label: '얼음',
    color: 'var(--color-type-ice)',
    icon: '/images/pokemon-types/ice.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-ice) 30%, white) 0%, white 100%)',
  },
  fighting: {
    label: '격투',
    color: 'var(--color-type-fight)',
    icon: '/images/pokemon-types/fighting.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-fight) 30%, white) 0%, white 100%)',
  },
  poison: {
    label: '독',
    color: 'var(--color-type-poison)',
    icon: '/images/pokemon-types/poison.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-poison) 30%, white) 0%, white 100%)',
  },
  ground: {
    label: '땅',
    color: 'var(--color-type-ground)',
    icon: '/images/pokemon-types/ground.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-ground) 30%, white) 0%, white 100%)',
  },
  flying: {
    label: '비행',
    color: 'var(--color-type-flying)',
    icon: '/images/pokemon-types/flying.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-flying) 30%, white) 0%, white 100%)',
  },
  psychic: {
    label: '에스퍼',
    color: 'var(--color-type-psychic)',
    icon: '/images/pokemon-types/psychic.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-psychic) 30%, white) 0%, white 100%)',
  },
  bug: {
    label: '벌레',
    color: 'var(--color-type-bug)',
    icon: '/images/pokemon-types/bug.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-bug) 30%, white) 0%, white 100%)',
  },
  rock: {
    label: '바위',
    color: 'var(--color-type-rock)',
    icon: '/images/pokemon-types/rock.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-rock) 30%, white) 0%, white 100%)',
  },
  ghost: {
    label: '고스트',
    color: 'var(--color-type-ghost)',
    icon: '/images/pokemon-types/ghost.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-ghost) 30%, white) 0%, white 100%)',
  },
  dragon: {
    label: '드래곤',
    color: 'var(--color-type-dragon)',
    icon: '/images/pokemon-types/dragon.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-dragon) 30%, white) 0%, white 100%)',
  },
  dark: {
    label: '악',
    color: 'var(--color-type-dark)',
    icon: '/images/pokemon-types/dark.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-dark) 30%, white) 0%, white 100%)',
  },
  steel: {
    label: '강철',
    color: 'var(--color-type-steel)',
    icon: '/images/pokemon-types/steel.svg',
    gradient: 'linear-gradient(180deg, color-mix(in srgb, var(--color-type-steel) 30%, white) 0%, white 100%)',
  },

  fairy: {
    label: '페어리',
    color: 'var(--color-type-fairy)',
    icon: '/images/pokemon-types/fairy.svg',
    gradient:
      'linear-gradient(180deg, white 0%, color-mix(in srgb, var(--color-type-fairy) 30%, white) 0%, white 100%)',
  },
};
