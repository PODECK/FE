// localStorage key를 관리
export const storageKeys = {
  TRAINER_DATA: 'pokemon_trainer_data',
  TRINER_DATA: 'pokemon_trainer_data',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
