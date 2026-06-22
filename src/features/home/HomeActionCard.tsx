'use client';

// 홈 액션 카드 — 배틀/덱/도감 진입 카드 컴포넌트

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import type { HomeActionCardData } from '@/app/(main)/home/_types/home';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';

interface HomeActionCardProps {
  card: HomeActionCardData;
}

export default function HomeActionCard({ card }: HomeActionCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`group relative h-[135px] overflow-hidden rounded-[20px] p-7 text-[var(--color-secondary-2)] shadow-[0_14px_32px_rgba(0,0,0,0.12)] ${card.backgroundClassName}`}
    >
      <Link
        href={card.href}
        aria-label={`${card.title} 페이지로 이동`}
        className="absolute inset-0 z-30 rounded-[20px] focus-visible:ring-2 focus-visible:ring-[var(--color-secondary-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)] focus-visible:outline-none"
      />

      <SilhouetteBackground
        className={`top-[90%]! right-[-30px]! left-auto! -translate-y-1/2 rotate-45 ${
          card.silhouetteClassName ?? 'opacity-90!'
        }`}
        imageClassName="h-[280px]! w-[280px]!"
      />

      <div className="relative z-10">
        <h2 className="text-[26px] leading-tight font-extrabold">{card.title}</h2>
        <p className="mt-1 text-base font-medium text-[var(--color-secondary-2)]">{card.description}</p>
      </div>

      <div className="absolute top-1/2 right-7 z-20 flex h-9.5 w-9.5 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-secondary-2)] text-[var(--color-primary)] shadow-[0_0_15px_4px_rgba(0,0,0,0.08)]">
        <ChevronRight aria-hidden="true" size={30} className="translate-x-[1.6px]" strokeWidth={2.0} />
      </div>

      <Image
        src={card.imageSrc}
        alt={card.imageAlt}
        width={180}
        height={180}
        className={`absolute object-contain ${card.imageClassName ?? 'top-1/2 right-0 h-[100px] w-[100px] -translate-y-1/2'}`}
      />
    </motion.article>
  );
}
