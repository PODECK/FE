'use client';

import { useSoundStore } from '@/shared/stores/sound-store';
import { useEffect } from 'react';
import type { BgmOptions } from '../lib/bgm';
import { bgm } from '../lib/bgm';

export function useBgm(src: string, options: BgmOptions = {}) {
  const bgmVolume = useSoundStore((s) => s.setting.bgmVolume);
  const isBgmMuted = useSoundStore((s) => s.setting.isBgmMuted);

  const isHtml5 = options.html5 ?? false;

  useEffect(() => {
    let isRendered = true;

    const timer = setTimeout(() => {
      if (!isRendered) return;

      bgm.play(src, { html5: isHtml5, volume: bgmVolume });
      bgm.mute(isBgmMuted);
    }, 0);

    return () => {
      isRendered = false;
      clearTimeout(timer);
      bgm.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isHtml5]);

  useEffect(() => {
    bgm.volume(bgmVolume);
    bgm.mute(isBgmMuted);
  }, [bgmVolume, isBgmMuted]);
}
