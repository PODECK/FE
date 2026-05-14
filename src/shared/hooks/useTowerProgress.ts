'use client';

// 무한의 탑 진행도를 localStorage에 저장·복원하는 훅
import { useState, useCallback, useEffect } from 'react';
import type { TowerProgress } from '@/shared/types/tower';

const STORAGE_KEY = 'podeck-tower-progress';
const MAX_FLOOR = 10;
const MAX_LIVES = 4;

const DEFAULT_PROGRESS: TowerProgress = {
  currentFloor: 1,
  maxClearedFloor: 0,
  playerLives: MAX_LIVES,
  cardPackCount: 0,
  pendingRewardFloor: null,
};

function readProgress(): TowerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function writeProgress(p: TowerProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function useTowerProgress() {
  const [progress, setProgress] = useState<TowerProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(readProgress());
    });
  }, []);

  const save = useCallback((next: TowerProgress) => {
    writeProgress(next);
    setProgress(next);
    return next;
  }, []);

  // 층 클리어 → 다음 층으로 진행
  const markWinRewardPending = useCallback(() => {
    const current = readProgress();
    return save({ ...current, pendingRewardFloor: current.currentFloor });
  }, [save]);

  const advanceFloor = useCallback(() => {
    const current = readProgress();
    const canClaimReward = current.pendingRewardFloor === current.currentFloor;
    const next: TowerProgress = {
      ...current,
      currentFloor: Math.min(MAX_FLOOR, current.currentFloor + 1),
      maxClearedFloor: Math.max(current.maxClearedFloor, current.currentFloor),
      cardPackCount: canClaimReward ? current.cardPackCount + 1 : current.cardPackCount,
      pendingRewardFloor: null,
    };
    return save(next);
  }, [save]);

  // 패배 → 목숨 차감 (0이 되면 진행도 초기화)
  const loseLife = useCallback(() => {
    const current = readProgress();
    const lives = Math.max(0, current.playerLives - 1);
    const next: TowerProgress =
      lives === 0
        ? {
            ...current,
            currentFloor: 1,
            maxClearedFloor: current.maxClearedFloor,
            playerLives: MAX_LIVES,
            pendingRewardFloor: null,
          }
        : { ...current, playerLives: lives, pendingRewardFloor: null };
    return save(next);
  }, [save]);

  return { progress, advanceFloor, loseLife, markWinRewardPending };
}

// BattleScene(Phaser)에서 직접 읽을 수 있도록 별도 함수로 export
export { readProgress, writeProgress, STORAGE_KEY };
