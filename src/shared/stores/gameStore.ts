import { create } from 'zustand';

interface GameState {
  setting: {
    bgmVolume: number;
    sfxVolume: number;
    isMuted: boolean;
  };
}

interface GameActions {
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  setting: {
    bgmVolume: 1.0,
    sfxVolume: 0.5,
    isMuted: false,
  },
  setBgmVolume: (volume) => set({ setting: { ...get().setting, bgmVolume: volume } }),
  setSfxVolume: (volume) => set({ setting: { ...get().setting, sfxVolume: volume } }),
  setIsMuted: (isMuted) => set({ setting: { ...get().setting, isMuted } }),
}));
