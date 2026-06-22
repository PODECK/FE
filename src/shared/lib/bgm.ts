import { Howl } from 'howler';

let bgmHowl: Howl | null = null;
let currentBgmSrc: string | null = null;
let audioUnlocked = false;
let pendingPlayArgs: { src: string; options: BgmOptions } | null = null;
let isMutedState = false;

export interface BgmOptions {
  volume?: number;
  html5?: boolean;
}

const removeUnlockListeners = () => {
  if (typeof window === 'undefined') return;
  document.removeEventListener('click', unlock, true);
  document.removeEventListener('keydown', unlock, true);
  document.removeEventListener('touchstart', unlock, true);
};

const unlock = () => {
  audioUnlocked = true;
  removeUnlockListeners();

  if (pendingPlayArgs) {
    const { src, options } = pendingPlayArgs;
    pendingPlayArgs = null;
    bgm.play(src, options);
  }
};

if (typeof window !== 'undefined') {
  document.addEventListener('click', unlock, true);
  document.addEventListener('keydown', unlock, true);
  document.addEventListener('touchstart', unlock, true);
}

export const bgm = {
  play(src: string, options: BgmOptions = {}) {
    if (!audioUnlocked) {
      pendingPlayArgs = { src, options };
      return;
    }

    const volume = options?.volume ?? 0.2;
    const html5 = options?.html5 ?? false;

    if (currentBgmSrc === src) {
      bgmHowl?.volume(volume);
      return;
    }

    if (bgmHowl) {
      bgmHowl.stop();
      bgmHowl.unload();
      bgmHowl = null;
    }

    bgmHowl = new Howl({
      src: [src],
      loop: true,
      volume,
      html5,
      mute: isMutedState,
    });

    bgmHowl.play();
    currentBgmSrc = src;
  },

  stop() {
    pendingPlayArgs = null;
    bgmHowl?.stop();
    bgmHowl?.unload();
    bgmHowl = null;
    currentBgmSrc = null;
    if (!audioUnlocked) {
      removeUnlockListeners();
    }
  },

  volume(volume: number) {
    bgmHowl?.volume(volume);
  },

  mute(muted: boolean) {
    isMutedState = muted;
    bgmHowl?.mute(muted);
  },

  pause() {
    bgmHowl?.pause();
  },

  resume() {
    bgmHowl?.play();
  },
};

const sfxCache = new Map<string, Howl>();

export const sfx = {
  play(src: string, volume: number = 1.0) {
    let howl = sfxCache.get(src);

    if (!howl) {
      howl = new Howl({
        src: [src],
        volume,
        preload: true,
      });
      sfxCache.set(src, howl);
    } else {
      howl.volume(volume);
    }

    howl.play();
  },

  volume(volume: number) {
    sfxCache.forEach((howl) => howl.volume(volume));
  },

  mute(muted: boolean) {
    sfxCache.forEach((howl) => howl.mute(muted));
  },

  // 캐시 비우기 (씬 전환시)
  unloadAll() {
    sfxCache.forEach((howl) => howl.unload());
    sfxCache.clear();
  },
};

// 모든 오디오 음원 뮤트
export function muteAll(muted: boolean) {
  Howler.mute(muted);
}
