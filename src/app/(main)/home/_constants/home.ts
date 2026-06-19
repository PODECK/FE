// 홈 화면 내비게이션, 액션 카드, 배너 데이터 상수

import type {
  HomeActionCardData,
  HomeBattleHistoryItem,
  HomeHeroCarouselItem,
  HomeNavItem,
  HomeNewsItem,
  HomeRecommendedDeck,
} from '@/app/(main)/home/_types/home';
import { BookOpen, Home, Newspaper, Swords } from 'lucide-react';

export const homeNavItems: HomeNavItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/home',
    icon: Home,
    variant: 'default',
  },
  {
    id: 'news',
    label: '새소식',
    href: '/news',
    icon: Newspaper,
    variant: 'default',
  },
  {
    id: 'podeck',
    label: '도감',
    href: '/pokedex',
    icon: BookOpen,
    variant: 'default',
  },
  {
    id: 'battle',
    label: '배틀하기',
    href: '/battle',
    icon: Swords,
    variant: 'primary',
  },
];

export const homeheroCarouselItems: HomeHeroCarouselItem[] = [
  {
    id: 'battle-ascent',
    eyebrow: 'Battle Ascent TCG',
    title: '당신의 포켓몬과 함께\n무한의 탑을 공략해 보세요!',
    description: '6마리로 덱을 구성하여\nAI 상대와 턴제 카드 배틀을 펼치세요',
    imageSrc: '/images/home/carousel/main-banner-pokemon.webp',
    imageAlt: '첫번째 배너',
    badgeClassName: 'border-[var(--color-primary)], text-[#FF9F00] rounded-[100px]',
    textClassName: 'text-[#333333]',
    descriptionClassName: 'text-[#7B7B7B]',
  },
  {
    id: 'card-pack',
    eyebrow: "Gotta Catch 'Em All",
    title: '새로운 카드를 획득하고\n강력한 덱을 만들어보세요!',
    description: '배틀에서 승리하거나 일일 미션을 완료하면\n카드팩을 획득할 수 있어요!',
    imageSrc: '/images/home/carousel/main-banner-card-pack.webp',
    imageAlt: '두번째 배너',
    badgeClassName: 'border-[#9E7DE5] text-[#9E7DE5]',
    textClassName: 'text-[var(--color-base-3)]',
    descriptionClassName: 'text-[#CCCCCC]',
  },
  {
    id: 'generation',
    eyebrow: 'Generation Expansion',
    title: '1세대부터 7세대까지\n세대 확장 업데이트!',
    description: '더 많은 포켓몬, 더 넓어진 전략의 세계로!\n새로운 만남과 배틀을 경험하세요.',
    imageSrc: '/images/home/carousel/main-banner-generation.webp',
    imageAlt: '세번째 배너',
    badgeClassName: 'border-[#4961FF] text-[#4961FF]',
    textClassName: 'text-[var(--color-base-0)]',
    descriptionClassName: 'text-[#666666]',
  },
];

// 실제 데이터로 치환 필요
export const homeBattleHistoryItem: HomeBattleHistoryItem[] = [
  {
    id: 'battle-1',
    result: 'DEFEAT',
    opponentName: '배틀광 재혁',
    floorName: '무한의 탑 13층',
    timeAgo: '1시간 전',
    pokemonImageSrcs: [
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
    ],
  },
  {
    id: 'battle-2',
    result: 'WIN',
    opponentName: '열혈 트레이너 강우',
    floorName: '무한의 탑 12층',
    timeAgo: '1시간 전',
    pokemonImageSrcs: [
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
    ],
  },
  {
    id: 'battle-3',
    result: 'WIN',
    opponentName: 'anfdmf whgdkgksms wlgus',
    floorName: '무한의 탑 13층',
    timeAgo: '1시간 전',
    pokemonImageSrcs: [
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
    ],
  },
];

export const homeActionCards: HomeActionCardData[] = [
  {
    id: 'pokedex',
    title: '포켓몬 도감',
    description: '다양한 포켓몬을 모으고,\n나만의 덱을 완성하세요',
    href: '/pokedex',
    imageSrc: '/images/home/action/deck.svg',
    imageAlt: '도감 이미지',
    backgroundClassName: 'bg-[#FFCB3E]',
    imageClassName: 'left-[225px] top-[90px] h-[160px] w-[150px] -translate-y-1/2',
    silhouetteClassName: 'opacity-30!',
  },
  {
    id: 'battle',
    title: '배틀 시작',
    description: '당신의 한계를 시험하라,\n정상을 향해 끝없이 도전하세요!',
    href: '/battle',
    imageSrc: '/images/home/action/battlesymbol.svg',
    imageAlt: '배틀 시작 이미지',
    backgroundClassName: 'bg-[#F77F66]',
    imageClassName: 'right-[60px] top-1/2 h-[160px] w-[160px] -translate-y-1/2',
    silhouetteClassName: 'opacity-30!',
  },
];

// 실제 데이터 치환 필요
export const homeNewsItems: HomeNewsItem[] = [
  {
    id: 'season',
    category: '공지',
    title: '포덱 시즌 2 업데이트 패치노트',
    date: '26-05-29',
    imageSrc: '/images/home/news/news1.svg',
    href: '/news/season',
  },
  {
    id: 'hotfix',
    category: '점검',
    title: 'Hot-fix 점검 완료 안내',
    date: '26-05-29',
    imageSrc: '/images/home/news/news2.svg',
    href: '/news/hotfix',
  },
];

// 실제 데이터 치환 필요
export const homeRecommendedDecks: HomeRecommendedDeck[] = [
  {
    id: 'fighting-counter',
    label: '추천',
    title: '격투 카운터덱',
    description: '격투 타입을 효과적으로 제압하자!',
    pokemonImageSrcs: [
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
    ],
  },
  {
    id: 'full-status',
    label: '추천',
    title: '풀 상태이상 덱',
    description: '상태이상으로 상대를 압박하자!',
    pokemonImageSrcs: [
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
      '/images/home/status/ball.svg',
    ],
  },
];
