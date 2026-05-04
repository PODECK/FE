import fs from 'fs';
import path from 'path';
import {
  fetchWithRetry,
  pokeApi,
  logProgress,
  findKoName,
  findKoFlavorText,
  sleep,
} from './_utils';

import type { PokemonData } from '@/shared/types';

const GENERATION_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
};

function getGeneration(dexId: number): number {
  for (const [gen, [min, max]] of Object.entries(GENERATION_RANGES)) {
    if (dexId >= min && dexId <= max) return Number(gen);
  }
  return 4;
}

const TYPE_MAP: Record<string, string> = {
  normal: 'normal',
  fire: 'fire',
  water: 'water',
  electric: 'electric',
  grass: 'grass',
  ice: 'ice',
  fighting: 'fighting',
  poison: 'poison',
  ground: 'ground',
  flying: 'flying',
  psychic: 'psychic',
  bug: 'bug',
  rock: 'rock',
  ghost: 'ghost',
  dragon: 'dragon',
  dark: 'dark',
  steel: 'steel',
};

async function fetchAbilityKo(
  abilityName: string,
): Promise<{ name: string; description: string }> {
  const data = (await fetchWithRetry(pokeApi.ability(abilityName))) as any;
  const koName = findKoName(data.names, abilityName);
  const descriptionKo = findKoFlavorText(data.flavor_text_entries, koName);

  return { name: koName, description: descriptionKo };
}

async function buildOnePokemon(dexId: number): Promise<PokemonData> {
  const [pokemonRaw, speciesRaw] = await Promise.all([
    fetchWithRetry(pokeApi.pokemon(dexId)) as Promise<any>,
    fetchWithRetry(pokeApi.species(dexId)) as Promise<any>,
  ]);

  const koName = findKoName(speciesRaw.names, speciesRaw.name);
  const enName = pokemonRaw.name;

  const types = pokemonRaw.types
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((t: any) => TYPE_MAP[t.type.name])
    .filter(Boolean) as string[];

  const statMap: Record<string, keyof PokemonData['baseStats']> = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    'special-attack': 'specialAttack',
    'special-defense': 'specialDefense',
    speed: 'speed',
  };

  const baseStats = {} as PokemonData['baseStats'];
  for (const s of pokemonRaw.stats) {
    const key = statMap[s.stat.name];
    if (key) baseStats[key] = s.base_stat;
  }

  const sprite =
    pokemonRaw.sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`;

  const category = findKoName(speciesRaw.genera, '???');
  const height = pokemonRaw.height / 10;
  const weight = pokemonRaw.weight / 10;
  const flavorText = findKoFlavorText(speciesRaw.flavor_text_entries);

  const evolutionStage = speciesRaw.evolves_from_species
    ? speciesRaw.is_baby
      ? 1
      : 2
    : 1;

  const evolvesFromDexId = speciesRaw.evolves_from_species
    ? Number(speciesRaw.evolves_from_species.url.split('/').at(-2))
    : null;

  const mainAbility = pokemonRaw.abilities.find((a: any) => !a.is_hidden);
  const abilityData = mainAbility
    ? await fetchAbilityKo(mainAbility.ability.name)
    : { name: '없음', description: '' };

  return {
    dexId,
    koName,
    enName,
    types: types as any,
    baseStats,
    spriteUrl: sprite,
    generation: getGeneration(dexId),
    evolutionStage,
    evolvesFromDexId,
    evolvesAtFloor: null,
    category,
    height,
    weight,
    flavorText,
    ability: abilityData,
  };
}

async function main() {
  const TOTAL = 493;
  const BATCH_SIZE = 10;
  const DELAY_MS = 200;

  const result: Record<number, PokemonData> = {};
  const errors: number[] = [];

  console.log(`포켓몬 데이터 수집 시작 (1~${TOTAL})\n`);

  for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
    const batch = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const results = await Promise.allSettled(
      batch.map((id) => buildOnePokemon(id)),
    );

    for (let i = 0; i < results.length; i++) {
      const dexId = batch[i];
      const res = results[i];

      if (res.status === 'fulfilled') {
        result[dexId] = res.value;
      } else {
        errors.push(dexId);
        console.error(`\n[오류] #${dexId}: ${res.reason}`);
      }

      logProgress(start + i, TOTAL, `#${dexId}`);
    }

    if (end < TOTAL) await sleep(DELAY_MS);
  }

  const outputPath = path.resolve('data/pokemon.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\n완료: data/pokemon.json (${Object.keys(result).length}마리)`);

  if (errors.length > 0) {
    console.warn(`실패한 dexId: [${errors.join(', ')}]`);
    console.warn('실패한 항목은 수동으로 확인 후 재실행하세요.');
  }
}

main().catch((err) => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
