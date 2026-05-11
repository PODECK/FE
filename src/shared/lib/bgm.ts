import { Howl } from 'howler';

let bgmHowl: Howl | null = null;
let currentBgmSrc: string | null = null;

export const bgm = {
  play(src: string, volume: number) {
    if (currentBgmSrc === src) {
      bgmHowl?.volume(volume);
      return;
    }

    bgmHowl?.stop();
    bgmHowl?.unload();

    bgmHowl = new Howl({
      src: [src],
      loop: true,
      volume,
      html5: true, // 스트리밍 재생 (대용량 파일 메모리 최적화)
    });

    bgmHowl.play();
    currentBgmSrc = src;
  },

  stop() {
    bgmHowl?.stop();
    bgmHowl?.unload();
    bgmHowl = null;
    currentBgmSrc = null;
  },

  volume(volume: number) {
    bgmHowl?.volume(volume);
  },

  mute(muted: boolean) {
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
