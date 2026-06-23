'use client';

// 홈 메인 배너 — 캐러셀

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { homeheroCarouselItems } from '@/app/(main)/home/_constants/home';

const AUTO_PLAY_INTERVAL_MS = 3700;
const SLIDE_TRANSITION_SECONDS = 0.8;
const BANNER_COUNT = homeheroCarouselItems.length;
const LAST_BANNER_INDEX = BANNER_COUNT - 1;
const INFINITE_CAROUSEL_ITEMS =
  BANNER_COUNT <= 1 ? homeheroCarouselItems : [...homeheroCarouselItems, homeheroCarouselItems[0]];

export default function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const moveToPrevious = useCallback(() => {
    if (BANNER_COUNT <= 1) return;

    setIsTransitionEnabled(true);

    setActiveIndex((currentIndex) => {
      if (currentIndex === 0) {
        return LAST_BANNER_INDEX;
      }

      return currentIndex - 1;
    });
  }, []);

  const moveToNext = useCallback(() => {
    if (BANNER_COUNT <= 1) return;

    setIsTransitionEnabled(true);

    setActiveIndex((currentIndex) => {
      if (currentIndex >= BANNER_COUNT) {
        return 1;
      }

      return currentIndex + 1;
    });
  }, []);

  useEffect(() => {
    if (BANNER_COUNT <= 1) return;

    const intervalId = window.setInterval(moveToNext, AUTO_PLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [moveToNext]);

  const handleAnimationComplete = () => {
    if (activeIndex !== BANNER_COUNT) return;

    setIsTransitionEnabled(false);
    setActiveIndex(0);
  };

  useEffect(() => {
    if (isTransitionEnabled) return;

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isTransitionEnabled]);

  return (
    <section className="relative aspect-[945/380] w-full overflow-hidden rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <motion.div
        className="flex h-full"
        animate={{ x: `${-activeIndex * 100}%` }}
        transition={
          isTransitionEnabled
            ? {
                duration: SLIDE_TRANSITION_SECONDS,
                ease: [0.77, 0, 0.175, 1],
              }
            : { duration: 0 }
        }
        onAnimationComplete={handleAnimationComplete}
      >
        {INFINITE_CAROUSEL_ITEMS.map((banner, index) => (
          <div key={`${banner.imageSrc}-${index}`} className="relative h-full w-full shrink-0">
            <Image src={banner.imageSrc} alt={banner.imageAlt} fill className="object-cover" priority={index === 0} />

            <div className="absolute top-1/2 left-[110px] z-10 max-w-[430px] -translate-y-1/2">
              <span
                className={`inline-flex h-8 items-center rounded-full border px-4 text-sm font-semibold ${banner.badgeClassName}`}
              >
                {banner.eyebrow}
              </span>

              <h1
                className={`mt-5 text-[32px] leading-[1.35] font-extrabold whitespace-pre-line ${banner.textClassName}`}
              >
                {banner.title}
              </h1>

              <p
                className={`mt-5 text-[18px] leading-relaxed font-medium whitespace-pre-line ${banner.descriptionClassName}`}
              >
                {banner.description}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {BANNER_COUNT > 1 && (
        <>
          <button
            type="button"
            onClick={moveToPrevious}
            aria-label="이전 배너 보기"
            className="absolute top-1/2 left-6 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#FFAE17] shadow-md transition hover:scale-105"
          >
            <ChevronLeft aria-hidden="true" size={26} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={moveToNext}
            aria-label="다음 배너 보기"
            className="absolute top-1/2 right-6 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#FFAE17] shadow-md transition hover:scale-105"
          >
            <ChevronRight aria-hidden="true" size={26} strokeWidth={2.5} />
          </button>
        </>
      )}
    </section>
  );
}
