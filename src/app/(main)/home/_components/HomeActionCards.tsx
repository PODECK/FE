import { homeActionCards } from '@/app/(main)/home/_constants/home';
import HomeActionCard from '@/app/(main)/home/_components/HomeActionCard';

interface HomeActionCardsProps {
  selectedPokemonCount: number;
  totalPokemonCount: number;
}

export default function HomeActionCards({ selectedPokemonCount, totalPokemonCount }: HomeActionCardsProps) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {homeActionCards.map((card) => {
        const description =
          card.id === 'mydeck'
            ? `보유 포켓몬 ${selectedPokemonCount} 마리`
            : card.id === 'pokedex'
              ? `발견한 포켓몬 ${selectedPokemonCount}/${totalPokemonCount}`
              : card.description;
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
