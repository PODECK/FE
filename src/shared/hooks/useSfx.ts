'use client';

import { useSoundStore } from '@/shared/stores/sound-store';
import { useCallback, useEffect } from 'react';
import { sfx } from '../lib/bgm';

export function useSfx() {
  const sfxVolume = useSoundStore((s) => s.setting.sfxVolume);
  const isSfxMuted = useSoundStore((s) => s.setting.isSfxMuted);

  useEffect(() => {
    sfx.volume(sfxVolume);
    sfx.mute(isSfxMuted);
  }, [sfxVolume, isSfxMuted]);

  const play = useCallback(
    (src: string) => {
      if (isSfxMuted) return;
      sfx.play(src, sfxVolume);
    },
    [isSfxMuted, sfxVolume],
  );

  return { play };
}
