'use client';

import { useEffect, useState } from 'react';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getNextKstMidnightTime() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + KST_OFFSET_MS);

  const year = kstTime.getUTCFullYear();
  const month = kstTime.getUTCMonth();
  const day = kstTime.getUTCDate();

  return Date.UTC(year, month, day + 1, 0, 0, 0, 0) - KST_OFFSET_MS;
}

function formatRemainingTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export default function DailyMissionResetTimer() {
  const [remainingText, setRemainingText] = useState('00:00:00');

  useEffect(() => {
    const updateRemainingTime = () => {
      const remainingMs = getNextKstMidnightTime() - new Date().getTime();
      setRemainingText(formatRemainingTime(remainingMs));
    };

    updateRemainingTime();

    const timer = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <span className="text-base-1 shrink-0 text-xs leading-[1.4] font-semibold tracking-[-0.3px]">
      초기화까지 {remainingText}
    </span>
  );
}
