'use client';

import { useGameStore } from '@/shared/stores/gameStore';
import { useEffect } from 'react';
import { bgm } from '../lib/bgm';

export function useBgm(src: string) {
  const bgmVolume = useGameStore((s) => s.setting.bgmVolume);
  const isMuted = useGameStore((s) => s.setting.isMuted);

  useEffect(() => {
    bgm.play(src, bgmVolume);

    return () => {
      bgm.stop();
    };
  }, [src]);

  useEffect(() => {
    bgm.volume(bgmVolume);
    bgm.mute(isMuted);
  }, [bgmVolume, isMuted]);
}
