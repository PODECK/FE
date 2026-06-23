'use server';
// Unity WebGL 전투 세션 생성과 전투 완료 저장을 처리하는 서버 액션

import rawMovesJson from '../../../../data/moves.json';
import rawPokemonMovesJson from '../../../../data/pokemon-moves.json';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type MoveEntry = {
  koName?: string;
  enName?: string;
  type?: string;
  damageClass?: string;
  power?: number;
  accuracy?: number;
  pp?: number;
};

type TowerEnemy = {
  order?: number;
  dexId: number;
  nickname?: string;
  level?: number;
  moves?: string[];
};

type TowerPokemonPool = {
  trainer?: {
    id?: string;
    title?: string;
    name?: string;
    fullName?: string;
    portraitUrl?: string;
  };
  enemies?: TowerEnemy[];
};

type SpeciesRow = {
  dex_id: number;
  ko_name: string | null;
  en_name: string | null;
  sprite_url: string | null;
  artwork_url: string | null;
  type1_id: string | null;
  type2_id: string | null;
  base_hp: number | null;
  base_atk: number | null;
  base_def: number | null;
  base_spd: number | null;
};

type UnityPokemonPayload = {
  instanceId: string;
  dexId: number;
  level: number;
  exp: number;
  name: string;
  koName: string;
  enName: string;
  type1Id: string;
  type2Id: string | null;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  spriteUrl: string;
  artworkUrl: string;
  cardImageUrl: string;
  circleImageUrl: string;
  order: number;
  moves: UnityMovePayload[];
};

type UnityMovePayload = {
  id: string;
  name: string;
  koName: string;
  enName: string;
  typeId: string;
  damageClass: string;
  power: number;
  accuracy: number;
  pp: number;
  currentPp: number;
};

type CompleteUnityBattleInput = {
  battleSessionId?: string;
  floor: number;
  won: boolean;
  turnCount: number;
};

type CompleteUnityBattleRpcResult = {
  reward_pack_count?: number;
  reward_granted?: boolean;
  next_floor?: number;
  retries_left?: number;
};

type CreateUnityBattleSessionRpcResult = {
  battle_session_id?: string;
};

const movesData = rawMovesJson as Record<string, MoveEntry>;
const pokemonMovesData = rawPokemonMovesJson as Record<string, string[]>;
const supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const pokemonCardBucket = 'pokemon-cards';

export async function getUnityBattleSession(requestedFloor?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: '로그인이 필요합니다.' };

  const { data: appUser } = await supabase
    .from('users')
    .select('id, nickname, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (!appUser?.nickname) return { ok: false, message: '플레이어 프로필을 찾을 수 없습니다.' };

  const { data: towerProgress } = await supabase
    .from('tower_progress')
    .select('current_floor, max_cleared_floor, player_lives, is_intro_watched')
    .eq('user_id', user.id)
    .maybeSingle();

  const unlockedFloor = Number(towerProgress?.current_floor ?? 1);
  const currentFloor = Math.max(1, requestedFloor ?? unlockedFloor);
  if (currentFloor > Math.max(1, unlockedFloor)) {
    return { ok: false, message: '아직 해금되지 않은 층입니다.' };
  }

  const { data: floorRow, error: floorError } = await supabase
    .from('tower_floors')
    .select('floor, ai_level, pokemon_pool, reward_pack_count')
    .eq('floor', currentFloor)
    .maybeSingle();

  if (floorError || !floorRow) return { ok: false, message: '타워 층 정보를 찾을 수 없습니다.' };

  const playerDeck = await loadActivePlayerDeck(supabase, user.id);
  if (playerDeck.length === 0) return { ok: false, message: '전투에 사용할 덱을 찾을 수 없습니다.' };

  const pokemonPool = floorRow.pokemon_pool as TowerPokemonPool;
  const enemyDeck = await buildEnemyDeck(supabase, pokemonPool?.enemies ?? []);
  if (enemyDeck.length === 0) return { ok: false, message: '상대 덱 정보를 불러오지 못했습니다.' };

  const { data: sessionData, error: sessionError } = await supabase.rpc('create_unity_battle_session', {
    p_floor: currentFloor,
  });

  if (sessionError) return { ok: false, message: '전투 세션 생성에 실패했습니다.' };
  const battleSessionId = String((sessionData as CreateUnityBattleSessionRpcResult | null)?.battle_session_id ?? '');
  if (!battleSessionId) return { ok: false, message: '전투 세션 생성에 실패했습니다.' };

  return {
    ok: true,
    payload: {
      battleSessionId,
      player: {
        id: appUser.id,
        nickname: appUser.nickname,
        avatar_url: appUser.avatar_url,
        currentFloor,
        maxClearedFloor: Number(towerProgress?.max_cleared_floor ?? 0),
        retriesLeft: Number(towerProgress?.player_lives ?? 4),
        introWatched: Boolean(towerProgress?.is_intro_watched),
      },
      playerDeck,
      enemyTrainer: pokemonPool?.trainer ?? null,
      enemyDeck,
      floor: {
        floor: currentFloor,
        aiLevel: floorRow.ai_level,
        reward_pack_count: Number(floorRow.reward_pack_count ?? 1),
      },
      rules: {
        maxFieldCards: 3,
        maxRetries: 4,
      },
    },
  };
}

export async function completeUnityBattle(input: CompleteUnityBattleInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: '로그인이 필요합니다.' };
  if (!input.battleSessionId) return { ok: false, message: '전투 세션 정보가 없습니다.' };

  const { data, error } = await supabase.rpc('complete_unity_battle', {
    p_battle_session_id: input.battleSessionId,
    p_won: input.won,
    p_turn_count: Math.max(0, input.turnCount),
  });

  if (error) return { ok: false, message: '전투 결과 저장에 실패했습니다.' };

  const floor = Math.max(1, input.floor);
  const result = (data ?? {}) as CompleteUnityBattleRpcResult;

  revalidateBattlePaths();

  if (input.won) {
    return {
      ok: true,
      rewardPackCount: Number(result.reward_pack_count ?? 0),
      rewardGranted: Boolean(result.reward_granted),
      nextFloor: Number(result.next_floor ?? floor + 1),
    };
  }

  return {
    ok: true,
    rewardPackCount: 0,
    rewardGranted: false,
    retriesLeft: Number(result.retries_left ?? 0),
  };
}

export async function markUnityIntroCompleted() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: '로그인이 필요합니다.' };

  const { error } = await supabase.from('tower_progress').upsert(
    {
      user_id: user.id,
      is_intro_watched: true,
      intro_watched_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) return { ok: false, message: '인트로 진행 상태 저장에 실패했습니다.' };

  revalidatePath('/home');
  return { ok: true };
}

async function loadActivePlayerDeck(supabase: SupabaseServerClient, userId: string): Promise<UnityPokemonPayload[]> {
  const { data: activeDeck } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (!activeDeck) return [];

  const { data: deckNumbers } = await supabase
    .from('deck_numbers')
    .select('instance_id, position')
    .eq('deck_id', activeDeck.id)
    .order('position');

  if (!deckNumbers || deckNumbers.length === 0) return [];

  const instanceIds = deckNumbers.map((row) => row.instance_id as string);
  const { data: ownedPokemons } = await supabase
    .from('owned_pokemon')
    .select('instance_id, dex_id, level, exp')
    .eq('user_id', userId)
    .in('instance_id', instanceIds);

  if (!ownedPokemons || ownedPokemons.length === 0) return [];

  const dexIds = [...new Set(ownedPokemons.map((pokemon) => pokemon.dex_id as number))];
  const speciesMap = await loadSpeciesMap(supabase, dexIds);
  const ownedMoveMap = await loadOwnedMoveMap(supabase, userId, dexIds);
  const ownedByInstanceId = new Map(ownedPokemons.map((pokemon) => [pokemon.instance_id as string, pokemon]));

  return deckNumbers.flatMap((row) => {
    const ownedPokemon = ownedByInstanceId.get(row.instance_id as string);
    if (!ownedPokemon) return [];

    const dexId = ownedPokemon.dex_id as number;
    const species = speciesMap.get(dexId);
    if (!species) return [];

    return [
      buildPokemonPayload({
        instanceId: ownedPokemon.instance_id as string,
        dexId,
        level: Number(ownedPokemon.level ?? 1),
        exp: Number(ownedPokemon.exp ?? 0),
        order: Number(row.position ?? 0) + 1,
        species,
        moveIds: ownedMoveMap.get(dexId) ?? pokemonMovesData[String(dexId)] ?? [],
      }),
    ];
  });
}

async function buildEnemyDeck(supabase: SupabaseServerClient, enemies: TowerEnemy[]) {
  const orderedEnemies = [...enemies].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  const dexIds = [...new Set(orderedEnemies.map((enemy) => enemy.dexId).filter(Boolean))];
  const speciesMap = await loadSpeciesMap(supabase, dexIds);

  return orderedEnemies.flatMap((enemy) => {
    const species = speciesMap.get(enemy.dexId);
    if (!species) return [];

    return [
      buildPokemonPayload({
        instanceId: `enemy-${enemy.order ?? 0}-${enemy.dexId}`,
        dexId: enemy.dexId,
        level: Number(enemy.level ?? 1),
        exp: 0,
        order: Number(enemy.order ?? 0),
        species,
        moveIds: enemy.moves ?? pokemonMovesData[String(enemy.dexId)] ?? [],
        fallbackName: enemy.nickname,
      }),
    ];
  });
}

async function loadSpeciesMap(supabase: SupabaseServerClient, dexIds: number[]) {
  if (dexIds.length === 0) return new Map<number, SpeciesRow>();

  const { data: speciesRows } = await supabase
    .from('pokemon_species')
    .select(
      'dex_id, ko_name, en_name, sprite_url, artwork_url, type1_id, type2_id, base_hp, base_atk, base_def, base_spd',
    )
    .in('dex_id', dexIds);

  return new Map((speciesRows ?? []).map((species) => [species.dex_id as number, species as SpeciesRow]));
}

async function loadOwnedMoveMap(supabase: SupabaseServerClient, userId: string, dexIds: number[]) {
  if (dexIds.length === 0) return new Map<number, string[]>();

  const { data: moveRows } = await supabase
    .from('owned_pokemon_moves')
    .select('dex_id, move_id, slot')
    .eq('user_id', userId)
    .in('dex_id', dexIds)
    .order('slot');

  const result = new Map<number, string[]>();
  for (const row of moveRows ?? []) {
    const dexId = row.dex_id as number;
    const moveId = row.move_id as string;
    if (!result.has(dexId)) result.set(dexId, []);
    result.get(dexId)!.push(moveId);
  }

  return result;
}

function buildPokemonPayload(input: {
  instanceId: string;
  dexId: number;
  level: number;
  exp: number;
  order: number;
  species: SpeciesRow;
  moveIds: string[];
  fallbackName?: string;
}): UnityPokemonPayload {
  const koName = String(input.species.ko_name ?? input.fallbackName ?? input.dexId);
  const enName = String(input.species.en_name ?? input.species.ko_name ?? input.dexId);

  return {
    instanceId: input.instanceId,
    dexId: input.dexId,
    level: input.level,
    exp: input.exp,
    name: input.fallbackName || koName,
    koName,
    enName,
    type1Id: String(input.species.type1_id ?? 'normal'),
    type2Id: input.species.type2_id ? String(input.species.type2_id) : null,
    baseHp: Number(input.species.base_hp ?? 1),
    baseAtk: Number(input.species.base_atk ?? 1),
    baseDef: Number(input.species.base_def ?? 1),
    baseSpd: Number(input.species.base_spd ?? 1),
    spriteUrl: String(input.species.sprite_url ?? ''),
    artworkUrl: String(input.species.artwork_url ?? ''),
    cardImageUrl: buildPokemonCardImageUrl('card', input.dexId),
    circleImageUrl: buildPokemonCardImageUrl('circle', input.dexId),
    order: input.order,
    moves: buildMovePayloads(input.moveIds),
  };
}

function buildPokemonCardImageUrl(kind: 'card' | 'circle', dexId: number) {
  if (!supabasePublicUrl) return '';

  const paddedDexId = String(dexId).padStart(3, '0');
  return `${supabasePublicUrl}/storage/v1/object/public/${pokemonCardBucket}/${kind}/${paddedDexId}.png`;
}

function buildMovePayloads(moveIds: string[]) {
  const moves = moveIds.slice(0, 4).map(buildMovePayload);

  while (moves.length < 4) {
    moves.push(buildMovePayload('tackle'));
  }

  return moves;
}

function buildMovePayload(moveId: string): UnityMovePayload {
  const fallbackMoveId = 'tackle';
  const id = moveId && movesData[moveId] ? moveId : fallbackMoveId;
  const move = movesData[id] ?? movesData[fallbackMoveId];
  const pp = Number(move?.pp ?? 1);

  return {
    id,
    name: move?.koName ?? move?.enName ?? id,
    koName: move?.koName ?? id,
    enName: move?.enName ?? id,
    typeId: move?.type ?? 'normal',
    damageClass: move?.damageClass ?? 'physical',
    power: Number(move?.power ?? 40),
    accuracy: Number(move?.accuracy ?? 100),
    pp,
    currentPp: pp,
  };
}

function revalidateBattlePaths() {
  revalidatePath('/home');
  revalidatePath('/battle');
  revalidatePath('/mydeck');
  revalidatePath('/pokedex');
}
