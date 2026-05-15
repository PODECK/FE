'use client';

import { useGameStore } from '@/shared/stores/gameStore';
import { useCallback } from 'react';
import { sfx } from '../lib/bgm';

export function useSfx() {
  const isMuted = useGameStore((s) => s.setting.isMuted);

  const play = useCallback(
    (src: string, volume: number = 1.0) => {
      if (isMuted) return;
      sfx.play(src, volume);
    },
    [isMuted],
  );

  return { play };
}
