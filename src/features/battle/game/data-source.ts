// Phaser 캐시 JSON 기반 BattlePokemon 객체 생성 데이터소스
import type Phaser from 'phaser';
import type { PokemonDataSource } from '@/shared/temp-ai/deck-builder';
import type { BattlePokemon, BattleMove } from '@/shared/types/pokemon';

export class CachePokemonDataSource implements PokemonDataSource {
  private counter = 0;

  constructor(private cache: Phaser.Cache.CacheManager) {}

  getPokemon(dexId: number, level: number): BattlePokemon {
    const pokemonData = this.cache.json.get('pokemon-data')?.[String(dexId)];
    const movesData = this.cache.json.get('moves-data') as Record<
      string,
      { koName: string; type: string; damageClass: string; power: number; accuracy: number; pp: number }
    > | null;
    const pokemonMovesData = this.cache.json.get('pokemon-moves-data') as Record<string, string[]> | null;

    if (!pokemonData) throw new Error(`pokemon-data에 dexId=${dexId} 없음`);

    const moveIds: string[] = pokemonMovesData?.[String(dexId)] ?? [];
    const moves: BattleMove[] = moveIds.slice(0, 4).map((id) => {
      const m = movesData?.[id];
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

    const baseHp = pokemonData.baseStats.hp as number;

    return {
      instanceId: `pokemon-${dexId}-${this.counter++}`,
      dexId,
      koName: pokemonData.koName as string,
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
