import { createClient } from '@/shared/lib/supabase/server';
import type { PokemonType } from '@/shared/types/pokemon';
import type { RosterPokemon } from '../model/schemas';

const CANDIDATE_LIMIT = 12;

type TypeChartCache = Record<string, Record<string, number>>;
let typeChartCache: TypeChartCache | null = null;

async function ensureTypeChart(): Promise<TypeChartCache> {
  if (typeChartCache) return typeChartCache;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('type_charts')
    .select('attack_type_id, defense_type_id, multiplier')
    .throwOnError();

  if (error || !data) {
    console.error('Type chart 데이터를 불러오는데 실패했습니다. 기본 상성 배율을 사용합니다.', error);
    return {} as TypeChartCache;
  }

  const chart: TypeChartCache = {};

  data.forEach((row) => {
    const atk = row.attack_type_id as PokemonType;
    const def = row.defense_type_id as PokemonType;
    const factor = Number(row.multiplier);

    if (!chart[atk]) chart[atk] = {};
    chart[atk][def] = factor;
  });

  typeChartCache = chart;
  return typeChartCache;
}

export function filterOptimal(roster: RosterPokemon[]): RosterPokemon[] {
  return [...roster].sort((a, b) => b.baseStatTotal - a.baseStatTotal).slice(0, CANDIDATE_LIMIT);
}

export function filterStatus(roster: RosterPokemon[]): RosterPokemon[] {
  const withStatus = roster.filter((p) => p.moves.some((m) => m.statusEffect !== null));
  const without = roster.filter((p) => !p.moves.some((m) => m.statusEffect !== null));

  const combined = [
    ...withStatus.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
    ...without.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
  ];

  return combined.slice(0, CANDIDATE_LIMIT);
}

export function filterOffensive(roster: RosterPokemon[]): RosterPokemon[] {
  return [...roster].sort((a, b) => b.baseAtk - a.baseAtk).slice(0, CANDIDATE_LIMIT);
}

export function filterDefensive(roster: RosterPokemon[]): RosterPokemon[] {
  return [...roster]
    .sort((a, b) => b.baseStatTotal - b.baseAtk - (a.baseStatTotal - a.baseAtk))
    .slice(0, CANDIDATE_LIMIT);
}

export function filterSpeed(roster: RosterPokemon[]): RosterPokemon[] {
  return [...roster].sort((a, b) => b.baseSpd - a.baseSpd).slice(0, CANDIDATE_LIMIT);
}

export async function filterCounter(roster: RosterPokemon[], target: PokemonType): Promise<RosterPokemon[]> {
  const chart = await ensureTypeChart();

  const hasCounterMove = (p: RosterPokemon) => p.moves.some((m) => m.power !== null && chart[m.type]?.[target] === 2);

  const withCounter = roster.filter(hasCounterMove);
  const without = roster.filter((p) => !hasCounterMove(p));

  const combined = [
    ...withCounter.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
    ...without.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
  ];

  return combined.slice(0, CANDIDATE_LIMIT);
}

export async function filterTowerCounter(roster: RosterPokemon[], enemyTypes: PokemonType[]): Promise<RosterPokemon[]> {
  if (enemyTypes.length === 0) return filterOptimal(roster);

  const chart = await ensureTypeChart();

  const getScore = (p: RosterPokemon) => {
    let score = 0;

    p.moves.forEach((m) => {
      if (m.power !== null) {
        enemyTypes.forEach((enemyType) => {
          const factor = chart[m.type]?.[enemyType] ?? 1.0;
          if (factor === 2.0) score += 20;
          if (factor === 0.5) score -= 5;
          if (factor === 0.0) score -= 15;
        });
      }
    });

    enemyTypes.forEach((enemyType) => {
      const f1 = chart[p.type1]?.[enemyType] ?? 1.0;
      if (f1 === 2.0) score += 10;

      if (p.type2) {
        const f2 = chart[p.type2]?.[enemyType] ?? 1.0;
        if (f2 === 2.0) score += 10;
      }
    });

    return score + p.baseStatTotal * 0.01;
  };

  const combined = [...roster].sort((a, b) => getScore(b) - getScore(a));
  return combined.slice(0, CANDIDATE_LIMIT);
}
