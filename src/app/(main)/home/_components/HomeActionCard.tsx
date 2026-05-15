'use client';

// 홈 액션 카드 — 배틀/덱/도감 진입 카드 컴포넌트

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      className={`relative h-[180px] overflow-hidden rounded-[20px] p-8 text-[var(--color-secondary-2)] shadow-[0_14px_32px_rgba(0,0,0,0.12)] ${card.backgroundClassName}`}
    >
      <SilhouetteBackground
        className="!right-[-120px] !bottom-[-80px] !left-auto rotate-45 opacity-25 sm:!right-[-150px] sm:!bottom-[-105px]"
        imageClassName="!h-[320px] !w-[320px] sm:!h-[400px] sm:!w-[400px]"
      />

      <div className="relative z-10">
        <h2 className="text-[32px] leading-tight font-extrabold">{card.title}</h2>
        <p className="mt-2 text-base font-medium text-[var(--color-secondary-2)]">{card.description}</p>

        <Link
          href={card.href}
          className="mt-3 inline-flex h-10 items-center rounded-full bg-[var(--color-secondary-2)] px-6 text-lg font-extrabold text-[#787878] transition hover:scale-105"
        >
          GO! →
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
