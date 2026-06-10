'use client';

// 홈 메인 배너 — 캐러셀

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';

import { homeheroCarouselItems } from '@/app/(main)/home/_constants/home';

export default function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = homeheroCarouselItems[activeIndex];

  const moveToPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? homeheroCarouselItems.length - 1 : currentIndex - 1));
  }, []);

  const moveToNext = useCallback(() => {
    setActiveIndex((currentIndex) => (currentIndex === homeheroCarouselItems.length - 1 ? 0 : currentIndex + 1));
  }, []);

  return (
    <section className="relative aspect-[945/380] w-full overflow-hidden rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <Image src={activeBanner.imageSrc} alt={activeBanner.imageAlt} fill className="object-cover" priority />
      <button
        type="button"
        onClick={moveToPrevious}
        aria-label="이전 배너 보기"
        className="absolute top-1/2 left-8 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#FFAE17] shadow-md transition hover:scale-105"
      >
        <ChevronLeft aria-hidden="true" size={26} strokeWidth={2.5} />
      </button>

      <div className="absolute top-1/2 left-[110px] z-10 max-w-[430px] -translate-y-1/2">
        <span
          className={`inline-flex h-8 items-center rounded-full border px-4 text-sm font-semibold ${activeBanner.badgeClassName}`}
        >
          {activeBanner.eyebrow}
        </span>

        <h1
          className={`mt-5 text-[32px] leading-[1.35] font-extrabold whitespace-pre-line ${activeBanner.textClassName}`}
        >
          {activeBanner.title}
        </h1>

        <p
          className={`mt-5 text-base leading-relaxed font-medium whitespace-pre-line ${activeBanner.descriptionClassName}`}
        >
          {activeBanner.description}
        </p>
      </div>

      <button
        type="button"
        onClick={moveToNext}
        aria-label="다음 배너 보기"
        className="absolute top-1/2 right-8 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#FFAE17] shadow-md transition hover:scale-105"
      >
        <ChevronRight aria-hidden="true" size={26} strokeWidth={2.5} />
      </button>
    </section>
  );
}
