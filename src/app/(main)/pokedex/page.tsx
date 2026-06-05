// page.tsx
import DexPage from './_components/DexPage';
import { getAllPokemons } from '@/entities/pokemon/api/pokemonApi';

export default async function Page() {
  const pokemons = await getAllPokemons();
  return <DexPage pokemons={pokemons} />;
}
