import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  setting: {
    bgmVolume: number;
    sfxVolume: number;
    isBgmMuted: boolean;
    isSfxMuted: boolean;
  };
}

interface SoundActions {
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleBgmMuted: () => void;
  toggleSfxMuted: () => void;
}

export const useSoundStore = create<SoundState & SoundActions>()(
  persist(
    (set, get) => ({
      setting: {
        bgmVolume: 0.2,
        sfxVolume: 0.8,
        isBgmMuted: false,
        isSfxMuted: false,
      },
      setBgmVolume: (volume) => set({ setting: { ...get().setting, bgmVolume: volume } }),
      setSfxVolume: (volume) => set({ setting: { ...get().setting, sfxVolume: volume } }),
      toggleBgmMuted: () => set({ setting: { ...get().setting, isBgmMuted: !get().setting.isBgmMuted } }),
      toggleSfxMuted: () => set({ setting: { ...get().setting, isSfxMuted: !get().setting.isSfxMuted } }),
    }),
    {
      name: 'podeck-sound',
    },
  ),
);
