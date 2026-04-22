export interface TrainerData {
  nickname: string;
  selectedPokemon: number | null; // pokemon id
  // 더 추가 예정
}

const STORAGE_KEY = 'pokemon_trainer_data';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getTrainerData(): TrainerData | null {
  if (!isBrowser()) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function hasTrainer(): boolean {
  const data = getTrainerData();
  return !!(data?.nickname && data?.selectedPokemon !== null);
}
