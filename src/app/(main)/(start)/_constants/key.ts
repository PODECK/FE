// localStorage key를 관리
export const storageKeys = {
  TRINER_DATA: 'pokemon_trainer_data',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
