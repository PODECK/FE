// 배틀 라우트의 모바일 확대 동작 제한 레이아웃

import type { Viewport } from 'next';

export const viewport: Viewport = {
  userScalable: false,
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
