'use client';

import { useBgm } from '@/shared/hooks/useBgm';

export function HomeBgmController() {
  useBgm('bgm/route-201.mp3', { html5: true });
  return null;
}
