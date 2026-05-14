// Phaser 배틀 Scene의 localStorage 진행도 읽기 어댑터
const STORAGE_KEY = 'podeck-tower-progress';
const DEFAULT_FLOOR = 1;
const MIN_FLOOR = 1;
const MAX_FLOOR = 10;

export function readStoredTowerFloor(): number {
  if (typeof window === 'undefined') return DEFAULT_FLOOR;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const floor = raw ? Number(JSON.parse(raw)?.currentFloor) : DEFAULT_FLOOR;
    if (!Number.isFinite(floor)) return DEFAULT_FLOOR;

    return Math.max(MIN_FLOOR, Math.min(MAX_FLOOR, floor));
  } catch {
    return DEFAULT_FLOOR;
  }
}
