import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const MAX_DEX_ID = 809;
const REQUEST_DELAY_MS = 120;
const UPSERT_CHUNK_SIZE = 500;

const POKEMON_TYPE_IDS = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

const POKEMON_TYPE_ID_SET = new Set<string>(POKEMON_TYPE_IDS);

// 7세대 데이터를 우선 사용하고, 없으면 이전 세대 버전 그룹으로 내려간다.
const VERSION_GROUP_PRIORITY = [
  'ultra-sun-ultra-moon',
  'sun-moon',
  'omega-ruby-alpha-sapphire',
  'x-y',
  'black-2-white-2',
  'black-white',
  'heartgold-soulsilver',
  'platinum',
  'diamond-pearl',
  'emerald',
  'firered-leafgreen',
  'ruby-sapphire',
  'crystal',
  'gold-silver',
  'yellow',
  'red-blue',
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FETCH_BATCH_SIZE = 10;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
}

// 운영 DB에 실수로 seed하는 일을 줄이기 위한 안전장치다.
if (process.env.CONFIRM_SEED_GAME_DATA !== 'true') {
  throw new Error('CONFIRM_SEED_GAME_DATA=true 설정 후 실행하세요.');
}

// seed script는 서버/로컬 CLI에서만 실행한다.
// service role key는 클라이언트 코드에 절대 노출하지 않는다.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

const TypeRow = z.object({
  id: z.string(),
  ko_name: z.string(),
});

const TypeChartRow = z.object({
  attack_type_id: z.string(),
  defense_type_id: z.string(),
  multiplier: z.number(),
});

const PokemonSpeciesRow = z.object({
  dex_id: z.number().int(),
  ko_name: z.string(),
  en_name: z.string(),
  type1_id: z.string(),
  type2_id: z.string().nullable(),
  base_hp: z.number().int(),
  base_atk: z.number().int(),
  base_def: z.number().int(),
  base_sp_atk: z.number().int(),
  base_sp_def: z.number().int(),
  base_spd: z.number().int(),
  generation: z.number().int(),
  evolution_stage: z.number().int(),
  is_legendary: z.boolean(),
  sprite_url: z.string().nullable(),
  artwork_url: z.string().nullable(),
  height: z.number(),
  weight: z.number(),
  category: z.string(),
  flavor_text: z.string(),
  ability: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

const MoveRow = z.object({
  id: z.string(),
  ko_name: z.string(),
  en_name: z.string(),
  type_id: z.string(),
  damage_class: z.enum(['physical', 'special', 'status']),
  power: z.number().int(),
  accuracy: z.number().int(),
  pp: z.number().int(),
  effect_text: z.string(),
  status_effect_chance: z.number().int(),
});

const LearnsetRow = z.object({
  dex_id: z.number().int(),
  move_id: z.string(),
  learn_level: z.number().int().min(1),
});

type TypeRow = z.infer<typeof TypeRow>;
type TypeChartRow = z.infer<typeof TypeChartRow>;
type PokemonSpeciesRow = z.infer<typeof PokemonSpeciesRow>;
type MoveRow = z.infer<typeof MoveRow>;
type LearnsetRow = z.infer<typeof LearnsetRow>;

const moveCache = new Map<string, any>();
const abilityCache = new Map<string, { name: string; description: string }>();
const evolutionStageCache = new Map<string, number>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PokeAPI는 seed 시점에만 호출한다.
// 앱 런타임에서는 Supabase를 단일 데이터 원본으로 사용한다.
async function fetchPokeApi<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${POKEAPI_BASE_URL}${pathOrUrl}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`PokeAPI 요청 실패: ${url} (${response.status})`);
  }

  await sleep(REQUEST_DELAY_MS);
  return response.json() as Promise<T>;
}

async function upsertChunked(table: string, rows: unknown[], onConflict: string) {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });

    if (error) {
      throw new Error(`${table} seed 실패: ${error.message}`);
    }
  }

  console.log(`${table} seed 완료: ${rows.length}개`);
}

function findLocalizedName(names: any[], fallback: string) {
  return (
    names.find((entry) => entry.language.name === 'ko')?.name ??
    names.find((entry) => entry.language.name === 'en')?.name ??
    fallback
  );
}

function findFlavorText(entries: any[]) {
  const entry =
    entries.find((item) => item.language.name === 'ko') ?? entries.find((item) => item.language.name === 'en');

  return (entry?.flavor_text ?? '').replace(/\f|\n|\r/g, ' ');
}

function findEffectText(entries: any[]) {
  const entry = entries.find((item) => item.language.name === 'en');

  return (entry?.short_effect ?? entry?.effect ?? '').replace(/\$effect_chance/g, 'effect chance');
}

function findGenus(genera: any[]) {
  return (
    genera.find((entry) => entry.language.name === 'ko')?.genus ??
    genera.find((entry) => entry.language.name === 'en')?.genus ??
    ''
  );
}

function findStat(stats: any[], statName: string) {
  const stat = stats.find((entry) => entry.stat.name === statName);
  return stat?.base_stat ?? 1;
}

function parseGeneration(generationName: string) {
  const roman = generationName.replace('generation-', '');

  const generationMap: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
  };

  return generationMap[roman] ?? 1;
}

async function fetchTypes(): Promise<TypeRow[]> {
  const rows = await Promise.all(
    POKEMON_TYPE_IDS.map(async (typeId) => {
      const type = await fetchPokeApi<any>(`/type/${typeId}`);

      return TypeRow.parse({
        id: typeId,
        ko_name: findLocalizedName(type.names, typeId),
      });
    }),
  );

  return rows;
}

async function fetchTypeCharts(): Promise<TypeChartRow[]> {
  const rows: TypeChartRow[] = [];

  for (const attackTypeId of POKEMON_TYPE_IDS) {
    const type = await fetchPokeApi<any>(`/type/${attackTypeId}`);

    const multiplierByDefenseType = new Map<string, number>();
    POKEMON_TYPE_IDS.forEach((defenseTypeId) => multiplierByDefenseType.set(defenseTypeId, 1));

    type.damage_relations.double_damage_to.forEach((entry: any) => {
      if (POKEMON_TYPE_ID_SET.has(entry.name)) multiplierByDefenseType.set(entry.name, 2);
    });

    type.damage_relations.half_damage_to.forEach((entry: any) => {
      if (POKEMON_TYPE_ID_SET.has(entry.name)) multiplierByDefenseType.set(entry.name, 0.5);
    });

    type.damage_relations.no_damage_to.forEach((entry: any) => {
      if (POKEMON_TYPE_ID_SET.has(entry.name)) multiplierByDefenseType.set(entry.name, 0);
    });

    multiplierByDefenseType.forEach((multiplier, defenseTypeId) => {
      rows.push(
        TypeChartRow.parse({
          attack_type_id: attackTypeId,
          defense_type_id: defenseTypeId,
          multiplier,
        }),
      );
    });
  }

  return rows;
}

function findSpeciesDepth(chainNode: any, targetSpeciesName: string, depth = 1): number | null {
  if (chainNode.species.name === targetSpeciesName) return depth;

  for (const next of chainNode.evolves_to ?? []) {
    const found = findSpeciesDepth(next, targetSpeciesName, depth + 1);
    if (found !== null) return found;
  }

  return null;
}

async function fetchEvolutionStage(species: any) {
  const chainUrl = species.evolution_chain?.url;

  if (!chainUrl) return 1;

  const cached = evolutionStageCache.get(`${chainUrl}:${species.name}`);
  if (cached) return cached;

  const chain = await fetchPokeApi<any>(chainUrl);
  const stage = findSpeciesDepth(chain.chain, species.name) ?? 1;

  evolutionStageCache.set(`${chainUrl}:${species.name}`, stage);
  return stage;
}

async function fetchMainAbility(pokemon: any) {
  const mainAbility =
    pokemon.abilities.find((entry: any) => !entry.is_hidden)?.ability ?? pokemon.abilities[0]?.ability;

  if (!mainAbility) {
    return { name: '', description: '' };
  }

  const cached = abilityCache.get(mainAbility.name);
  if (cached) return cached;

  const ability = await fetchPokeApi<any>(mainAbility.url);

  const value = {
    name: findLocalizedName(ability.names, mainAbility.name),
    description: findFlavorText(ability.flavor_text_entries),
  };

  abilityCache.set(mainAbility.name, value);
  return value;
}

const pokemonCache = new Map<number, any>();

async function fetchPokemon(dexId: number) {
  const cached = pokemonCache.get(dexId);
  if (cached) return cached;

  const pokemon = await fetchPokeApi<any>(`/pokemon/${dexId}`);
  pokemonCache.set(dexId, pokemon);
  return pokemon;
}

// PokeAPI의 pokemon + pokemon-species 응답을 pokemon_species row로 변환한다.
// 외부 API 응답 전체가 아니라 앱에서 필요한 필드만 선별해서 저장한다.
async function fetchPokemonSpeciesRow(dexId: number): Promise<PokemonSpeciesRow> {
  const [pokemon, species] = await Promise.all([fetchPokemon(dexId), fetchPokeApi<any>(`/pokemon-species/${dexId}`)]);

  return PokemonSpeciesRow.parse({
    dex_id: dexId,
    ko_name: findLocalizedName(species.names, pokemon.name),
    en_name: pokemon.name,
    type1_id: pokemon.types[0].type.name,
    type2_id: pokemon.types[1]?.type.name ?? null,
    base_hp: findStat(pokemon.stats, 'hp'),
    base_atk: findStat(pokemon.stats, 'attack'),
    base_def: findStat(pokemon.stats, 'defense'),
    base_sp_atk: findStat(pokemon.stats, 'special-attack'),
    base_sp_def: findStat(pokemon.stats, 'special-defense'),
    base_spd: findStat(pokemon.stats, 'speed'),
    generation: parseGeneration(species.generation.name),
    evolution_stage: await fetchEvolutionStage(species),
    is_legendary: species.is_legendary,
    sprite_url: pokemon.sprites.front_default,
    artwork_url: pokemon.sprites.other?.['official-artwork']?.front_default ?? null,
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    category: findGenus(species.genera),
    flavor_text: findFlavorText(species.flavor_text_entries),
    ability: await fetchMainAbility(pokemon),
  });
}

async function fetchPokemonSpeciesRows(dexIds: number[]) {
  const rows: PokemonSpeciesRow[] = [];

  for (let i = 0; i < dexIds.length; i += FETCH_BATCH_SIZE) {
    const batch = dexIds.slice(i, i + FETCH_BATCH_SIZE);
    const batchRows = await Promise.all(batch.map((dexId) => fetchPokemonSpeciesRow(dexId)));

    rows.push(...batchRows);
    console.log(`pokemon_species 준비: ${rows.length}/${MAX_DEX_ID}`);
  }

  return rows;
}

async function fetchMove(moveId: string) {
  const cached = moveCache.get(moveId);
  if (cached) return cached;

  const move = await fetchPokeApi<any>(`/move/${moveId}`);
  moveCache.set(moveId, move);

  return move;
}

function findMoveVersionDetail(moveEntry: any) {
  for (const versionGroup of VERSION_GROUP_PRIORITY) {
    const detail = moveEntry.version_group_details.find((entry: any) => entry.version_group.name === versionGroup);

    if (detail) return detail;
  }

  return null;
}

// learnsets는 포켓몬별 레벨업 기술표다.
// 유저가 가진 포켓몬의 현재 기술/PP는 owned_pokemon_moves에서 별도로 관리한다.
async function fetchLearnsetRows(dexIds: number[]): Promise<LearnsetRow[]> {
  const rows: LearnsetRow[] = [];
  const uniqueKeys = new Set<string>();

  for (const dexId of dexIds) {
    const pokemon = await fetchPokemon(dexId);

    for (const moveEntry of pokemon.moves) {
      const versionDetail = findMoveVersionDetail(moveEntry);

      if (!versionDetail || versionDetail.move_learn_method.name !== 'level-up') {
        continue;
      }

      const learnLevel = Math.max(versionDetail.level_learned_at ?? 1, 1);

      const row = LearnsetRow.parse({
        dex_id: dexId,
        move_id: moveEntry.move.name,
        learn_level: learnLevel,
      });

      const key = `${row.dex_id}:${row.move_id}:${row.learn_level}`;

      if (!uniqueKeys.has(key)) {
        rows.push(row);
        uniqueKeys.add(key);
      }
    }

    console.log(`learnsets 준비: ${dexId}/${MAX_DEX_ID}`);
  }

  return rows;
}

// learnsets에서 실제 사용하는 move_id만 상세 조회해서 moves 테이블에 저장한다.
// 사용하지 않는 전체 기술을 무작정 저장하지 않아 seed 시간과 DB 크기를 줄인다.
async function fetchMoveRows(moveIds: string[]): Promise<MoveRow[]> {
  const rows: MoveRow[] = [];

  for (const moveId of moveIds) {
    const move = await fetchMove(moveId);

    rows.push(
      MoveRow.parse({
        id: moveId,
        ko_name: findLocalizedName(move.names, moveId),
        en_name: move.name,
        type_id: move.type.name,
        damage_class: move.damage_class.name,
        power: move.power ?? 0,
        accuracy: move.accuracy ?? 0,
        pp: move.pp ?? 1,
        effect_text: findEffectText(move.effect_entries),
        status_effect_chance: move.effect_chance ?? 0,
      }),
    );
  }

  return rows;
}

async function main() {
  const dexIds = Array.from({ length: MAX_DEX_ID }, (_, index) => index + 1);

  const typeRows = await fetchTypes();
  await upsertChunked('types', typeRows, 'id');

  const typeChartRows = await fetchTypeCharts();
  await upsertChunked('type_charts', typeChartRows, 'attack_type_id,defense_type_id');

  const pokemonSpeciesRows = await fetchPokemonSpeciesRows(dexIds);
  await upsertChunked('pokemon_species', pokemonSpeciesRows, 'dex_id');

  const learnsetRows = await fetchLearnsetRows(dexIds);
  const moveIds = [...new Set(learnsetRows.map((row) => row.move_id))];

  const moveRows = await fetchMoveRows(moveIds);
  await upsertChunked('moves', moveRows, 'id');

  await upsertChunked('learnsets', learnsetRows, 'dex_id,move_id,learn_level');

  console.log('PokeAPI 기반 7세대 game data seed 완료');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
