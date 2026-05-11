'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';
import { homeHeroMain } from '@/app/(main)/home/_constants/home';

export default function HomeBanner() {
  const hero = homeHeroMain[0];

  return (
    <section className="relative isolate h-[420px] overflow-visible">
      {/* 배경 카드 레이어: 배경 요소는 여기 안에서만 잘림 */}
      <div className="absolute right-0 bottom-10 left-0 isolate z-0 h-[375px] overflow-hidden rounded-[20px] bg-gradient-to-b from-[#F9F9F9] to-[#E1E1E1]">
        <div className="absolute inset-0 right-[-90px] translate-y-[3px]">
          <Image
            src={hero.backgroundImageSrc}
            alt=""
            fill
            className="object-contain object-right opacity-80"
            priority
          />
        </div>
        {/* <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#F9F9F9]/88 via-[#F9F9F9]/56 to-[#F9F9F9]/10" /> */}
        <SilhouetteBackground
          className="bottom-[-680px] left-[-310px] z-30 rotate-45 !opacity-100 sm:bottom-[-780px] sm:left-[-330px]"
          imageClassName="!h-[760px] !w-[760px] sm:!h-[880px] sm:!w-[880px]"
        />
        <div className="absolute inset-y-0 left-[-140px] z-20 w-full bg-[#F9F9F9]/90 [clip-path:polygon(0_0,76%_0,58%_100%,0_100%)]" />
      </div>

      {/* 콘텐츠 레이어: 트레이너 이미지만 바깥으로 튀어나올 수 있음 */}
      <div className="absolute right-0 bottom-5 left-0 z-30 h-[375px] overflow-visible rounded-[20px]">
        <div className="relative flex h-full items-center justify-between">
          <div className="pl-10">
            <div className="mb-3 flex gap-2">
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} className="pt-[50px]" />
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} className="pt-[50px]" />
              <Image src="/images/home/pokedot.svg" alt="" width={30} height={30} className="pt-[50px]" />
            </div>

            <h1 className="text-[36px] leading-[1.35] font-extrabold whitespace-pre-line text-[var(--color-base-0)]">
              {hero.title}
            </h1>

            <p className="mt-2 text-lg font-medium text-[#7B7B7B]">{hero.description}</p>
          </div>

          <div className="relative h-full flex-1">
            {/* 던져지는 포켓볼 */}
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[42%] left-[10%] z-20"
            >
              <Image
                src={hero.pokeballImageSrc}
                alt=""
                width={120}
                height={120}
                className="h-[110px] w-[110px] [image-rendering:pixelated]"
              />
            </motion.div>

            {/* 트레이너 이미지: 이 이미지만 카드 밖으로 튀어나오게 */}
            <Image
              src={hero.trainerImageSrc}
              alt="지우"
              width={520}
              height={420}
              className="absolute top-[-75px] right-[40px] z-10 h-[430px] w-auto [image-rendering:pixelated]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
