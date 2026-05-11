import type { LucideIcon } from 'lucide-react';

export type HomeNavItemId = 'home' | 'pokedex' | 'mydeck' | 'battle';

export interface HomeNavItem {
  id: HomeNavItemId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface HomeActionCardData {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  backgroundClassName: string;
  imageClassName?: string;
}
