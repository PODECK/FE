import { invariant } from '@/shared/lib/invariant';
import type { Rng } from '@/shared/lib/rng';
import { randomInt, shuffle } from '@/shared/lib/rng';
import { MOCK_BULBASAUR } from '@/shared/temp-ai/__mocks__/mock-pokemon';
import type { BattlePokemon, FloorConfig } from '@/shared/types';

export interface PokemonDataSource {
  getPokemon(dexId: number, level: number): BattlePokemon;
}

// mock 데이터용 소스
export class MockPokemonDataSource implements PokemonDataSource {
  private counter = 0;

  getPokemon(dexId: number, level: number): BattlePokemon {
    const id = this.counter++;
    return {
      ...MOCK_BULBASAUR,
      instanceId: `ai-${dexId}-${id}`,
      level,
      moves: MOCK_BULBASAUR.moves.map((m) => ({ ...m })),
      stats: { ...MOCK_BULBASAUR.stats },
      types: [...MOCK_BULBASAUR.types],
      maxHp: Math.floor(MOCK_BULBASAUR.stats.hp * (level / 10) + 10),
      currentHp: Math.floor(MOCK_BULBASAUR.stats.hp * (level / 10) + 10),
    };
  }
}

// 층 설정 + 시드 기반 Rng로 AI 덱(6마리) 구성
export function buildAiDeck(
  floor: FloorConfig,
  rng: Rng,
  dataSource: PokemonDataSource = new MockPokemonDataSource(),
): BattlePokemon[] {
  invariant(floor.pokemonPool.length >= 3, '층 포켓몬 풀은 최소 3마리 이상이어야 합니다.', {
    floor: floor.floor,
    poolSize: floor.pokemonPool.length,
  });
  // 풀 섞기
  const shuffled = shuffle(rng, floor.pokemonPool);
  const selected = shuffled.slice(0, Math.min(6, shuffled.length));

  const [minLevel, maxLevel] = floor.levelRange;

  return selected.map((dexId) => {
    const level = randomInt(rng, minLevel, maxLevel);
    return dataSource.getPokemon(dexId, level);
  });
}

// 시작 포켓몬 인덱스 선택 (랜덤)
export function chooseStarterIndex(): number {
  return 0;
}
