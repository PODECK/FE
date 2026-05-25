// fetch 기반 BattlePokemon 객체 생성 데이터소스 (Phaser cache 없이 plain JSON 사용)
import type { PokemonDataSource } from '@/shared/temp-ai/deck-builder';
import type { BattlePokemon, BattleMove } from '@/shared/types/pokemon';

export type PokemonJson = Record<
  string,
  {
    koName: string;
    types: string[];
    baseStats: {
      hp: number;
      attack: number;
      defense: number;
      specialAttack: number;
      specialDefense: number;
      speed: number;
    };
  }
>;

export type MovesJson = Record<
  string,
  {
    koName: string;
    type: string;
    damageClass: string;
    power: number;
    accuracy: number;
    pp: number;
  }
>;

export type PokemonMovesJson = Record<string, string[]>;

export class FetchPokemonDataSource implements PokemonDataSource {
  private counter = 0;

  constructor(
    private pokemonJson: PokemonJson,
    private movesJson: MovesJson,
    private pokemonMovesJson: PokemonMovesJson,
  ) {}

  getPokemon(dexId: number, level: number): BattlePokemon {
    const pokemonData = this.pokemonJson[String(dexId)];

    if (!pokemonData) throw new Error(`pokemon-data에 dexId=${dexId} 없음`);

    const moveIds: string[] = this.pokemonMovesJson[String(dexId)] ?? [];
    const moves: BattleMove[] = moveIds.slice(0, 4).map((id) => {
      const m = this.movesJson[id];
      return {
        id,
        koName: m?.koName ?? id,
        type: (m?.type ?? 'normal') as BattleMove['type'],
        damageClass: (m?.damageClass ?? 'physical') as BattleMove['damageClass'],
        power: m?.power ?? 0,
        accuracy: m?.accuracy ?? 100,
        pp: m?.pp ?? 10,
        maxPp: m?.pp ?? 10,
      };
    });

    // 기술이 4개 미만일 때 몸통박치기로 채움
    while (moves.length < 4) {
      moves.push({
        id: 'tackle',
        koName: '몸통박치기',
        type: 'normal',
        damageClass: 'physical',
        power: 40,
        accuracy: 100,
        pp: 35,
        maxPp: 35,
      });
    }

    const baseHp = pokemonData.baseStats.hp;

    return {
      instanceId: `pokemon-${dexId}-${this.counter++}`,
      dexId,
      koName: pokemonData.koName,
      level,
      types: pokemonData.types as BattlePokemon['types'],
      currentHp: baseHp,
      maxHp: baseHp,
      stats: pokemonData.baseStats as BattlePokemon['stats'],
      moves,
      fainted: false,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`,
    };
  }
}
