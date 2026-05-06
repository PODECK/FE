import type { Rng } from '@/shared/lib/rng';
import { randomInt, shuffle } from '@/shared/lib/rng';
import { MOCK_BULBASAUR } from '@/shared/temp-ai/__mocks__/mock-pokemon';
import type { BattlePokemon, FloorConfig } from '@/shared/types';

export interface PokemonDataSource {
  getPokemon(dexId: number, level: number): BattlePokemon;
}

// mock 데이터용 소스
export class MockPokemonDataSource implements PokemonDataSource {
  getPokemon(dexId: number, level: number): BattlePokemon {
    return {
      ...MOCK_BULBASAUR,
      instanceId: `ai-${dexId}-${Date.now()}-${Math.random()}`,
      level,
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
  // 풀 섞기
  const shuffled = shuffle(rng, floor.pokemonPool);
  const selected = shuffled.slice(0, 6);

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
