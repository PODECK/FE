import { Howl } from 'howler';

let bgmHowl: Howl | null = null;
let currentBgmSrc: string | null = null;
let audioUnlocked = false;
let pendingPlayArgs: { src: string; options: BgmOptions } | null = null;
let pendingMuted: boolean | null = null;

export interface BgmOptions {
  volume?: number;
  html5?: boolean;
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    audioUnlocked = true;
    if (pendingPlayArgs) {
      const { src, options } = pendingPlayArgs;
      pendingPlayArgs = null;
      bgm.play(src, options);
      if (pendingMuted !== null) {
        bgmHowl?.mute(pendingMuted);
        pendingMuted = null;
      }
    }
    document.removeEventListener('click', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    document.removeEventListener('touchstart', unlock, true);
  };
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
    });

    bgmHowl.play();
    currentBgmSrc = src;
  },

  stop() {
    pendingPlayArgs = null;
    pendingMuted = null;
    bgmHowl?.stop();
    bgmHowl?.unload();
    bgmHowl = null;
    currentBgmSrc = null;
  },

  volume(volume: number) {
    bgmHowl?.volume(volume);
  },

  mute(muted: boolean) {
    if (!bgmHowl) {
      pendingMuted = muted;
      return;
    }
    bgmHowl.mute(muted);
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
