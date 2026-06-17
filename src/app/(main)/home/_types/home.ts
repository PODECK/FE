// 홈 화면 네비게이션 및 액션 카드 타입

import type { LucideIcon } from 'lucide-react';

export type HomeNavItemId = 'home' | 'news' | 'podeck' | 'battle';

export interface HomeNavItem {
  id: HomeNavItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  variant: string;
}

export interface HomeHeroCarouselItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badgeClassName: string;
  textClassName: string;
  descriptionClassName: string;
}

// export interface HomeMissionItem {
//   id: string;
//   title: string;
//   progressText: string;
//   rewardText: string;
//   progressRate: number;
//   isCompleted?: boolean;
// }

export interface HomeActionCardData {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  backgroundClassName: string;
  imageClassName?: string;
  silhouetteClassName?: string;
}

export interface HomeBattleHistoryItem {
  id: string;
  result: 'WIN' | 'DEFEAT';
  opponentName: string;
  floorName: string;
  timeAgo: string;
  pokemonImageSrcs: string[];
}

export interface HomeNewsItem {
  id: string;
  category: string;
  title: string;
  date: string;
  imageSrc: string;
  href: string;
}

export interface HomeRecommendedDeck {
  id: string;
  label: string;
  title: string;
  description: string;
  pokemonImageSrcs: string[];
}
