'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const walkingSpriteImages = ['/images/RED1.svg', '/images/RED2.svg', '/images/RED3.svg', '/images/RED4.svg'] as const;

const FRAME_INTERVAL_MS = 150;

export default function WalkingSprite() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrameIndex((previousFrameIndex) => (previousFrameIndex + 1) % walkingSpriteImages.length);
    }, FRAME_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <Image
      src={walkingSpriteImages[frameIndex]}
      alt=""
      width={30}
      height={30}
      aria-hidden="true"
      className="h-13 w-13 [image-rendering:pixelated]"
      unoptimized
      priority
    />
  );
}
