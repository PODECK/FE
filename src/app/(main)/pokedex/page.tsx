import DexPage from './_components/DexPage';
import { getAllPokemons } from '@/entities/pokemon/api/pokemonApi';
import { getTrainerSummary, getOwnedPokemonDexIds } from '@/entities/trainer/api/trainerApi';

export default async function Page() {
  const [pokemons, trainer, ownedDexIds] = await Promise.all([
    getAllPokemons(),
    getTrainerSummary(),
    getOwnedPokemonDexIds(),
  ]);

  return (
    <DexPage
      pokemons={pokemons}
      ownedDexIds={ownedDexIds}
      packCount={trainer?.cardPackCount ?? 0}
      initialDeckDexIds={trainer?.activeDeckDexIds ?? []}
      nickname={trainer?.nickname}
      avatarUrl={trainer?.avatarUrl}
    />
  );
}
