// 홈 액션 카드 그리드 — 배틀/덱/도감 카드 3종 목록

import { homeActionCards } from '@/app/(main)/home/_constants/home';
import HomeActionCard from '@/app/(main)/home/_components/HomeActionCard';

interface HomeActionCardsProps {
  selectedPokemonCount: number;
}

export default function HomeActionCards({ selectedPokemonCount }: HomeActionCardsProps) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {homeActionCards.map((card) => {
        const description = card.id === 'deck' ? `보유 포켓몬 ${selectedPokemonCount} 마리` : card.description;

        return (
          <HomeActionCard
            key={card.id}
            card={{
              ...card,
              description,
            }}
          />
        );
      })}
    </section>
  );
}
