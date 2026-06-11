import { TYPE_CHART } from '../../../../data/type-chart';
import type { PokemonType } from '@/shared/types/pokemon';
import type { RosterPokemon } from '../model/schemas';

const CANDIDATE_LIMIT = 12;

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

export function filterCounter(roster: RosterPokemon[], target: PokemonType): RosterPokemon[] {
  const hasCounterMove = (p: RosterPokemon) =>
    p.moves.some((m) => m.power !== null && TYPE_CHART[m.type]?.[target] === 2);

  const withCounter = roster.filter(hasCounterMove);
  const without = roster.filter((p) => !hasCounterMove(p));

  const combined = [
    ...withCounter.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
    ...without.sort((a, b) => b.baseStatTotal - a.baseStatTotal),
  ];

  return combined.slice(0, CANDIDATE_LIMIT);
}
