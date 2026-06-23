import { createClient } from '@/shared/lib/supabase/server';
import type { HomeBattleHistoryItem } from '@/entities/battle/model/types';

type BattleHistoryRow = {
  id: number;
  floor: number;
  won: boolean;
  fought_at: string;
  player_deck_dex_ids: number[] | null;
};

type SpeciesRow = {
  dex_id: number;
  ko_name: string | null;
  artwork_url: string | null;
};

type TowerFloorRow = {
  floor: number;
  pokemon_pool: {
    trainer?: {
      name?: string;
      fullName?: string;
      title?: string;
    };
  } | null;
};

const RECENT_BATTLE_HISTORY_LIMIT = 3;

function formatTimeAgo(value: string) {
  const foughtAt = new Date(value);
  const diffMs = Date.now() - foughtAt.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) return '방금 전';

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function getOpponentName(floor: TowerFloorRow | undefined) {
  const trainer = floor?.pokemon_pool?.trainer;
  return trainer?.fullName ?? trainer?.name ?? trainer?.title ?? '타워 트레이너';
}

export async function getRecentBattleHistories(): Promise<HomeBattleHistoryItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: histories, error } = await supabase
    .from('battle_histories')
    .select('id, floor, won, fought_at, player_deck_dex_ids')
    .eq('user_id', user.id)
    .order('fought_at', { ascending: false })
    .limit(RECENT_BATTLE_HISTORY_LIMIT);

  if (error || !histories) return [];

  const rows = histories as BattleHistoryRow[];
  const dexIds = [...new Set(rows.flatMap((row) => row.player_deck_dex_ids ?? []))];
  const floors = [...new Set(rows.map((row) => row.floor))];

  const [{ data: speciesRows }, { data: towerRows }] = await Promise.all([
    dexIds.length > 0
      ? supabase.from('pokemon_species').select('dex_id, ko_name, artwork_url').in('dex_id', dexIds)
      : Promise.resolve({ data: [] }),
    floors.length > 0
      ? supabase.from('tower_floors').select('floor, pokemon_pool').in('floor', floors)
      : Promise.resolve({ data: [] }),
  ]);

  const speciesMap = new Map(((speciesRows ?? []) as SpeciesRow[]).map((species) => [species.dex_id, species]));
  const floorMap = new Map(((towerRows ?? []) as TowerFloorRow[]).map((floor) => [floor.floor, floor]));

  return rows.map((row) => ({
    id: String(row.id),
    result: row.won ? 'WIN' : 'DEFEAT',
    opponentName: getOpponentName(floorMap.get(row.floor)),
    floorName: `무한의 탑 ${row.floor}층`,
    timeAgo: formatTimeAgo(row.fought_at),
    deckPokemons: (row.player_deck_dex_ids ?? []).map((dexId) => {
      const species = speciesMap.get(dexId);
      return {
        artworkUrl: species?.artwork_url ?? '',
        koName: species?.ko_name ?? `#${String(dexId).padStart(3, '0')}`,
      };
    }),
  }));
}
