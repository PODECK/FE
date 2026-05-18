'use client';

// 홈 메인 배너 — 배경 이미지, 트레이너 이미지, 포켓볼 애니메이션

import Image from 'next/image';
import { motion } from 'framer-motion';
import { homeHeroMain } from '@/app/(main)/home/_constants/home';

export default function HomeBanner() {
  const hero = homeHeroMain[0];

  return (
    <section className="relative isolate h-[420px] overflow-visible">
      {/* 배경 SVG */}
      <div className="absolute right-0 bottom-6 left-0 isolate z-0 h-[375px] overflow-hidden rounded-[20px]">
        <Image src="/images/home/banner-BG.svg" alt="" fill className="object-cover" priority aria-hidden="true" />
      </div>

      {/* 콘텐츠 레이어 */}
      <div className="absolute right-0 bottom-6 left-0 z-30 h-[375px] overflow-visible rounded-[20px]">
        <div className="relative flex h-full items-center justify-between">
          <div className="pl-10">
            <div className="mb-3 flex gap-2">
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} />
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} />
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} />
            </div>

            <h1 className="text-[36px] leading-[1.35] font-extrabold whitespace-pre-line text-[var(--color-base-0)]">
              {hero.title}
            </h1>

            <p className="mt-2 text-lg font-medium text-[#7B7B7B]">{hero.description}</p>
          </div>

          <div className="relative h-full flex-1">
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[48%] left-[12%] z-20"
            >
              <Image
                src={hero.pokeballImageSrc}
                alt=""
                width={120}
                height={120}
                className="h-[110px] w-[110px] [image-rendering:pixelated]"
              />
            </motion.div>

            <Image
              src={hero.trainerImageSrc}
              alt="지우"
              width={520}
              height={420}
              className="absolute top-[-55px] right-[40px] z-10 h-[430px] w-auto [image-rendering:pixelated]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
