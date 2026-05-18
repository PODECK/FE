// 저장된 플레이어 배틀 덱 dexId를 읽는 유틸리티
import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';

const MAX_PLAYER_DECK_SIZE = 6;

function sanitizeDexIds(dexIds: unknown): number[] {
  if (!Array.isArray(dexIds)) return [];

  const seen = new Set<number>();

  return dexIds
    .filter((dexId): dexId is number => Number.isInteger(dexId) && dexId > 0)
    .filter((dexId) => {
      if (seen.has(dexId)) return false;
      seen.add(dexId);
      return true;
    })
    .slice(0, MAX_PLAYER_DECK_SIZE);
}

export function readActivePlayerDeckDexIds(fallbackDexIds: readonly number[]): number[] {
  if (typeof window === 'undefined') return [...fallbackDexIds];

  try {
    const rawData = window.localStorage.getItem(storageKeys.TRAINER_DATA);
    if (!rawData) return [...fallbackDexIds];

    const trainerData = JSON.parse(rawData) as TrainerData;
    const activeDeckDexIds = sanitizeDexIds(trainerData.activeDeckDexIds);

    return activeDeckDexIds.length > 0 ? activeDeckDexIds : [...fallbackDexIds];
  } catch {
    return [...fallbackDexIds];
  }
}
