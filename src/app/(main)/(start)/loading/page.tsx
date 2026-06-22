'use client';

import { useRouter } from 'next/navigation';
import LoadingProgress from '../_components/LoadingProgress';
import { loadingMessages } from '../_constants/messages';
import { useEffect, useState } from 'react';
import LoadingBackground from '@/app/(main)/(start)/loading/LoadingBackground';

const MAX_PROGRESS = 100;
const PROGRESS_INTERVAL_MS = 23;
const COMPLETE_DELAY_MS = 600;

export default function LoadingPage() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);

  const isLoadingComplete = progress >= MAX_PROGRESS;

  const messageIndex = Math.min(Math.floor(progress / 34), loadingMessages.length - 1);

  const currentMessage = loadingMessages[messageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setProgress((previousProgress) => {
        if (previousProgress >= MAX_PROGRESS) {
          window.clearInterval(intervalId);
          return MAX_PROGRESS;
        }

        return previousProgress + 1;
      });
    }, PROGRESS_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isLoadingComplete) return;

    const timeoutId = window.setTimeout(() => {
      router.push('/home');
    }, COMPLETE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoadingComplete, router]);

  return (
    <LoadingBackground>
      <LoadingProgress progress={progress} message={currentMessage} />
    </LoadingBackground>
  );
}
