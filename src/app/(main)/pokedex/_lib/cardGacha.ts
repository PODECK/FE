import pokemonData from '@/../data/pokemon.json';
import type { PokemonData } from '@/shared/types/pokemon';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import { storageKeys } from '@/app/(main)/(start)/_constants/key';

export type GachaCard = {
  pokemon: PokemonData;
  isNew: boolean;
};

const GACHA_COUNT = 5;

// Gen 1-4 뽑기 제외 포켓몬 목록
const GACHA_EXCLUDED_IDS = new Set([
  // Gen 1
  144, 145, 146, 150, 151,
  // Gen 2
  243, 244, 245, 249, 250, 251,
  // Gen 3
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
  // Gen 4
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
]);

// 뽑기 풀 — 빌드 타임 고정값이므로 모듈 레벨에서 한 번만 계산
const GACHA_POOL = (Object.values(pokemonData) as PokemonData[]).filter(
  (p) => p.dexId <= 493 && p.evolutionStage === 1 && !GACHA_EXCLUDED_IDS.has(p.dexId),
);

function getTrainerData(): TrainerData | null {
  const raw = localStorage.getItem(storageKeys.TRAINER_DATA);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrainerData;
  } catch {
    return null;
  }
}

export function getCardPackCount(): number {
  return getTrainerData()?.cardPackCount ?? 0;
}

export function pullGacha(): GachaCard[] {
  const pool = GACHA_POOL;

  const trainerData = getTrainerData();
  const ownedIds = new Set(trainerData?.selectedPokemons?.map((p) => p.dexId) ?? []);

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const pulled = shuffled.slice(0, GACHA_COUNT);

  return pulled.map((pokemon) => ({
    pokemon,
    isNew: !ownedIds.has(pokemon.dexId),
  }));
}

export function saveGachaResult(gachaCards: GachaCard[]): void {
  const trainerData = getTrainerData();
  if (!trainerData) return;
  if ((trainerData.cardPackCount ?? 0) <= 0) return;

  const newPokemons = gachaCards.filter((c) => c.isNew).map((c) => c.pokemon);

  const updated: TrainerData = {
    ...trainerData,
    selectedPokemons: [...(trainerData.selectedPokemons ?? []), ...newPokemons],
    cardPackCount: Math.max(0, (trainerData.cardPackCount ?? 0) - 1),
  };

  localStorage.setItem(storageKeys.TRAINER_DATA, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('trainer-data-updated'));
}
