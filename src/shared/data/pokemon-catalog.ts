import rawPokemonJson from '../../../data/pokemon.json';
import { PokemonData as PokemonDataSchema, type PokemonData } from '@/shared/types/pokemon';
import { z } from 'zod';

const PokemonCatalogSchema = z.record(z.string(), PokemonDataSchema);

function parsePokemonCatalog(): Record<string, PokemonData> {
  const result = PokemonCatalogSchema.safeParse(rawPokemonJson);

  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`data/pokemon.json 검증 실패: ${detail}`);
  }

  return result.data;
}

/** Zod로 검증된 포켓몬 도감 데이터 (dexId 문자열 키) */
export const pokemonCatalog = parsePokemonCatalog();

export function getPokemonByDexId(dexId: number): PokemonData | undefined {
  return pokemonCatalog[String(dexId)];
}

export function getAllPokemon(): PokemonData[] {
  return Object.values(pokemonCatalog);
}
