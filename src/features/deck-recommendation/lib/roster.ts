import type { SupabaseClient } from '@supabase/supabase-js';

import type { PokemonType } from '@/shared/types/pokemon';

import type { RosterPokemon } from '../model/schemas';
import rawMovesJson from '../../../../data/moves.json';
import rawPokemonMovesJson from '../../../../data/pokemon-moves.json';

type MoveEntry = {
  id: string;
  koName: string;
  type: string;
  damageClass: string;
  power: number;
  accuracy: number;
  pp: number;
};

const movesData = rawMovesJson as Record<string, MoveEntry>;
const pokemonMovesData = rawPokemonMovesJson as Record<string, string[]>;

// dex_id 목록을 pokemon_species + 기술 데이터와 조인해 RosterPokemon[]으로 빌드한다
export async function buildRoster(supabase: SupabaseClient, dexIds: number[]): Promise<RosterPokemon[]> {
  const unique = [...new Set(dexIds)];
  if (unique.length === 0) return [];

  const { data: species, error: speciesError } = await supabase
    .from('pokemon_species')
    .select('dex_id, ko_name, artwork_url, type1_id, type2_id, base_hp, base_atk, base_def, base_spd')
    .in('dex_id', unique);

  if (speciesError) throw new Error(`pokemon_species 조회 실패: ${speciesError.message}`);
  if (!species) return [];

  return species.map(
    (s: {
      dex_id: number;
      ko_name: string;
      artwork_url: string | null;
      type1_id: PokemonType;
      type2_id: PokemonType | null;
      base_hp: number;
      base_atk: number;
      base_def: number;
      base_spd: number;
    }) => {
      const moveIds = pokemonMovesData[String(s.dex_id)] ?? [];
      const moves = moveIds.slice(0, 4).map((id) => {
        const m = movesData[id];
        return {
          id,
          koName: m?.koName ?? id,
          type: (m?.type ?? 'normal') as PokemonType,
          power: m && m.power > 0 ? m.power : null,
          statusEffect: m?.damageClass === 'status' ? 'status' : null,
        };
      });

      return {
        dexId: s.dex_id,
        koName: s.ko_name,
        artworkUrl: s.artwork_url ?? '',
        type1: s.type1_id,
        type2: s.type2_id,
        level: 1,
        baseAtk: s.base_atk,
        baseSpd: s.base_spd,
        baseStatTotal: s.base_hp + s.base_atk + s.base_def + s.base_spd,
        moves,
      };
    },
  );
}

// 유저가 보유한 포켓몬 전체(owned_pokemon)를 로스터로 빌드한다
export async function loadOwnedRoster(supabase: SupabaseClient, userId: string): Promise<RosterPokemon[]> {
  const { data } = await supabase.from('owned_pokemon').select('dex_id').eq('user_id', userId);
  if (!data || data.length === 0) return [];
  return buildRoster(
    supabase,
    data.map((p: { dex_id: number }) => p.dex_id),
  );
}
