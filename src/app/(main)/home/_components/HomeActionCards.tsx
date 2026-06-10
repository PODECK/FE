// 홈 액션 카드 그리드 — 배틀/도감 카드 2종 목록

import { homeActionCards } from '@/app/(main)/home/_constants/home';
import HomeActionCard from '@/app/(main)/home/_components/HomeActionCard';

export default function HomeActionCards() {
  return (
    <section className="grid grid-cols-1 gap-7 whitespace-pre-line md:grid-cols-2">
      {homeActionCards.map((card) => (
        <HomeActionCard key={card.id} card={card} />
      ))}
    </section>
  );
}
