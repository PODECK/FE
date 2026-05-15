// 홈 화면 내비게이션, 액션 카드, 배너 데이터 상수

import type { HomeActionCardData, HomeNavItem } from '@/app/(main)/home/_types/home';
import { LucideBook, LucideCardSim, LucideHome, LucideSwords } from 'lucide-react';

export const homeNavItems: HomeNavItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/home',
    icon: LucideHome,
  },
  {
    id: 'pokedex',
    label: '도감',
    href: '/pokedex',
    icon: LucideBook,
  },
  {
    id: 'mydeck',
    label: '내 덱 관리',
    href: '/mydeck',
    icon: LucideCardSim,
  },
  {
    id: 'battle',
    label: '배틀',
    href: '/battle',
    icon: LucideSwords,
  },
];

export const homeActionCards: HomeActionCardData[] = [
  {
    id: 'battle',
    title: '배틀 시작',
    description: '무한의 탑에 도전하세요!',
    href: '/battle',
    imageSrc: '/images/home/battlesymbol.svg',
    imageAlt: '배틀 시작 이미지',
    backgroundClassName: 'bg-[#F77F66]',
    imageClassName: 'right-0 top-1/2 h-[170px] w-[170px] -translate-y-1/2',
    silhouetteClassName: '!opacity-30',
  },
  {
    id: 'mydeck',
    title: '내 덱 관리',
    description: '보유 포켓몬 12마리',
    href: '/mydeck',
    imageSrc: '/images/home/deck.svg',
    imageAlt: '내 덱 관리 이미지',
    backgroundClassName: 'bg-[#FFCB3E]',
    imageClassName: 'right-0 top-1/2 h-[150px] w-[150px] -translate-y-1/2',
    silhouetteClassName: '!opacity-45',
  },
  {
    id: 'pokedex',
    title: '도감',
    description: '발견한 포켓몬 36/493',
    href: '/pokedex',
    imageSrc: '/images/home/dex.svg',
    imageAlt: '도감 이미지',
    backgroundClassName: 'bg-[#70A9FF]',
    imageClassName: 'right-[-10px] top-1/2 h-[170px] w-[170px] -translate-y-1/2',
    silhouetteClassName: '!opacity-30',
  },
];

export const homeHeroMain = [
  {
    id: 1,
    title: '당신의 포켓몬과 함께\n무한의 탑을 공략해 보세요!',
    description: '6마리로 덱을 구성하여 AI 상대와 턴제 카드 배틀을 펼치세요',
    trainerImageSrc: '/images/home/jiwoo.svg',
    pokeballImageSrc: '/images/home/pokeball.svg',
    // backgroundImageSrc: '/images/home/bannerbackground.svg',
  },
];
