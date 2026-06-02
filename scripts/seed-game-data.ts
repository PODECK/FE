import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { PokemonData } from '../src/shared/types/pokemon';

dotenv.config({ path: '.env.local' });

const SeedPokemonData = PokemonData.extend({
  isLegendary: z.boolean().optional(),
});

const PokemonJsonByDexIdSchema = z.record(z.string(), SeedPokemonData);

type PokemonJson = z.infer<typeof SeedPokemonData>;
type PokemonJsonByDexId = Record<string, PokemonJson>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function readJsonFile<T>(filePath: string): Promise<T> {
  const absolutePath = path.join(process.cwd(), filePath);
  const file = await fs.readFile(absolutePath, 'utf-8');

  return JSON.parse(file) as T;
}

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`${label} 검증 실패\n${detail}`);
  }

  return result.data;
}

function getUniqueTypes(pokemons: PokemonJson[]) {
  const typeIds = new Set<string>();

  pokemons.forEach((pokemon) => {
    pokemon.types.forEach((type) => typeIds.add(type));
  });

  return Array.from(typeIds).map((typeId) => ({
    id: typeId,
    ko_name: typeId,
  }));
}

async function upsertTypes(pokemons: PokemonJson[]) {
  const rows = getUniqueTypes(pokemons);

  const { error } = await supabase.from('types').upsert(rows, {
    onConflict: 'id',
  });

  if (error) {
    throw new Error(`types seed 실패: ${error.message}`);
  }

  console.log(`types seed 완료: ${rows.length}개`);
}

async function upsertPokemonSpecies(pokemons: PokemonJson[]) {
  const rows = pokemons.map((pokemon) => ({
    dex_id: pokemon.dexId,
    ko_name: pokemon.koName,
    en_name: pokemon.enName,

    type1_id: pokemon.types[0],
    type2_id: pokemon.types[1] ?? null,

    // 현재 pokemon_species 테이블은 speed만 base_spd 컬럼으로 관리한다.
    base_hp: pokemon.baseStats.hp,
    base_atk: pokemon.baseStats.attack,
    base_def: pokemon.baseStats.defense,
    base_spd: pokemon.baseStats.speed,

    generation: pokemon.generation,
    evolution_stage: pokemon.evolutionStage,
    is_legendary: pokemon.isLegendary ?? false,

    sprite_url: pokemon.spriteUrl,
    artwork_url: pokemon.artworkUrl,

    height: pokemon.height,
    weight: pokemon.weight,
    category: pokemon.category,
    flavor_text: pokemon.flavorText,
    ability: pokemon.ability,
  }));

  const { error } = await supabase.from('pokemon_species').upsert(rows, {
    onConflict: 'dex_id',
  });

  if (error) {
    throw new Error(`pokemon_species seed 실패: ${error.message}`);
  }

  console.log(`pokemon_species seed 완료: ${rows.length}개`);
}

async function main() {
  const rawPokemonMap = await readJsonFile<unknown>('data/pokemon.json');
  const pokemonMap: PokemonJsonByDexId = parseWithSchema(PokemonJsonByDexIdSchema, rawPokemonMap, 'data/pokemon.json');
  const pokemons = Object.values(pokemonMap);

  await upsertTypes(pokemons);
  await upsertPokemonSpecies(pokemons);

  console.log('pokemon_species seed 테스트 완료');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
