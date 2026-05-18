'use client';

import { useSoundStore } from '@/shared/stores/soundStore';
import { useEffect } from 'react';
import { bgm } from '../lib/bgm';

export function useBgm(src: string) {
  const bgmVolume = useSoundStore((s) => s.setting.bgmVolume);
  const isBgmMuted = useSoundStore((s) => s.setting.isBgmMuted);

  useEffect(() => {
    bgm.play(src, bgmVolume);
    bgm.mute(isBgmMuted);

    return () => {
      bgm.stop();
    };
  }, [src]);

  useEffect(() => {
    bgm.volume(bgmVolume);
    bgm.mute(isBgmMuted);
  }, [bgmVolume, isBgmMuted]);
}
