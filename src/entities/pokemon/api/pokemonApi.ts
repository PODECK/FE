import { createClient } from '@/shared/lib/supabase/server';
import type { PokemonData, PokemonType } from '@/shared/types';

type PokemonSpeciesRow = {
  dex_id: number;
  ko_name: string;
  en_name: string;
  type1_id: PokemonType;
  type2_id: PokemonType | null;
  base_hp: number;
  base_atk: number;
  base_def: number;
  base_sp_atk: number;
  base_sp_def: number;
  base_spd: number;
  generation: number;
  evolution_stage: number;
  sprite_url: string | null;
  artwork_url: string | null;
  height: number;
  weight: number;
  category: string;
  flavor_text: string;
  ability: { name: string; description: string };
};

function mapPokemon(row: PokemonSpeciesRow): PokemonData {
  return {
    dexId: row.dex_id,
    koName: row.ko_name,
    enName: row.en_name,
    types: [row.type1_id, row.type2_id].filter((type): type is PokemonType => Boolean(type)),
    baseStats: {
      hp: row.base_hp,
      attack: row.base_atk,
      defense: row.base_def,
      specialAttack: row.base_sp_atk,
      specialDefense: row.base_sp_def,
      speed: row.base_spd,
    },
    spriteUrl: row.sprite_url ?? '',
    artworkUrl: row.artwork_url ?? '',
    generation: row.generation,
    evolutionStage: row.evolution_stage,
    evolvesFromDexId: null,
    evolvesAtFloor: null,
    category: row.category,
    height: Number(row.height),
    weight: Number(row.weight),
    flavorText: row.flavor_text,
    ability: row.ability,
  };
}

const pokemonSelect = `
  dex_id,
  ko_name,
  en_name,
  type1_id,
  type2_id,
  base_hp,
  base_atk,
  base_def,
  base_spd,
  base_sp_atk,
  base_sp_def,
  generation,
  evolution_stage,
  sprite_url,
  artwork_url,
  height,
  weight,
  category,
  flavor_text,
  ability
`;

export async function getAllPokemons() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pokemon_species')
    .select(pokemonSelect)
    .order('dex_id', { ascending: true });

  if (error) throw new Error(`포켓몬 데이터를 불러오지 못했습니다: ${error.message}`);

  return (data as PokemonSpeciesRow[]).map(mapPokemon);
}

export async function getPokemonByDexIds(dexIds: number[]) {
  if (dexIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pokemon_species')
    .select(pokemonSelect)
    .in('dex_id', dexIds)
    .order('dex_id', { ascending: true });

  if (error) throw new Error(`포켓몬 데이터를 불러오지 못했습니다: ${error.message}`);

  return (data as PokemonSpeciesRow[]).map(mapPokemon);
}

export async function getPokemonCount() {
  const supabase = await createClient();

  const { count, error } = await supabase.from('pokemon_species').select('*', { count: 'exact', head: true });

  if (error) throw new Error(`포켓몬 수를 불러오지 못했습니다: ${error.message}`);

  return count ?? 0;
}
