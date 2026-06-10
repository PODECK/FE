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
      className={`relative h-[150px] overflow-hidden rounded-[20px] p-8 text-[var(--color-secondary-2)] shadow-[0_14px_32px_rgba(0,0,0,0.12)] ${card.backgroundClassName}`}
    >
      <SilhouetteBackground
        className={`top-[90%]! right-[-30px]! left-auto! -translate-y-1/2 rotate-45 ${
          card.silhouetteClassName ?? 'opacity-90!'
        }`}
        imageClassName="h-[280px]! w-[280px]!"
      />

      <div className="relative z-10">
        <h2 className="text-[28px] leading-tight font-extrabold">{card.title}</h2>
        <p className="mt-1 text-base font-medium text-[var(--color-secondary-2)]">{card.description}</p>

        <Link
          href={card.href}
          aria-label={`${card.title} 페이지로 이동`}
          className="absolute top-1/2 right-[-2px] z-20 flex h-9.5 w-9.5 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-secondary-2)] text-[var(--color-primary)] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:scale-105"
        >
          <ChevronRight aria-hidden="true" size={30} strokeWidth={2.0} />
        </Link>
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
