// 무한의 탑 층별 AI 구성 설정

import type { FloorConfig } from '@/shared/types/tower';

export const TOWER_FLOORS: FloorConfig[] = [
  {
    floor: 1,
    challengerName: '초보 트레이너 민준',
    concept: 'grass_starter',
    aiLevel: 'easy',
    pokemonPool: [1, 152, 252, 387, 43, 69],
    levelRange: [3, 6],
    packReward: 1,
  },
  {
    floor: 2,
    challengerName: '물을 좋아하는 지현',
    concept: 'water_starter',
    aiLevel: 'easy',
    pokemonPool: [7, 158, 258, 393, 54, 60],
    levelRange: [5, 8],
    packReward: 1,
  },
  {
    floor: 3,
    challengerName: '불꽃의 승호',
    concept: 'fire_starter',
    aiLevel: 'easy',
    pokemonPool: [4, 155, 255, 390, 37, 58],
    levelRange: [7, 10],
    packReward: 1,
  },
  {
    floor: 4,
    challengerName: '노련한 트레이너 유나',
    concept: 'mixed_evolved',
    aiLevel: 'normal',
    pokemonPool: [25, 35, 39, 52, 92, 109],
    levelRange: [10, 13],
    packReward: 1,
  },
  {
    floor: 5,
    challengerName: '독 타입 전문가 현아',
    concept: 'poison_specialist',
    aiLevel: 'normal',
    pokemonPool: [23, 43, 109, 194, 316, 406],
    levelRange: [12, 15],
    packReward: 1,
  },
  {
    floor: 6,
    challengerName: '바위 타입 달인 강현',
    concept: 'rock_specialist',
    aiLevel: 'normal',
    pokemonPool: [74, 95, 111, 246, 347, 408],
    levelRange: [14, 17],
    packReward: 1,
  },
  {
    floor: 7,
    challengerName: '에스퍼 마스터 서연',
    concept: 'psychic_specialist',
    aiLevel: 'normal',
    pokemonPool: [63, 79, 96, 177, 280, 433],
    levelRange: [16, 19],
    packReward: 1,
  },
  {
    floor: 8,
    challengerName: '에이스 트레이너 도현',
    concept: 'fully_evolved',
    aiLevel: 'normal',
    pokemonPool: [6, 9, 3, 149, 62, 130],
    levelRange: [20, 24],
    packReward: 1,
  },
  {
    floor: 9,
    challengerName: '사천왕 도전자 민서',
    concept: 'elite_mixed',
    aiLevel: 'normal',
    pokemonPool: [65, 94, 112, 131, 143, 229],
    levelRange: [23, 27],
    packReward: 1,
  },
  {
    floor: 10,
    challengerName: '챔피언 도전자 하준',
    concept: 'semi_legendary',
    aiLevel: 'normal',
    pokemonPool: [142, 143, 149, 248, 373, 445],
    levelRange: [26, 30],
    packReward: 1,
  },
];

export function getFloorConfig(floor: number): FloorConfig {
  const config = TOWER_FLOORS.find((f) => f.floor === floor);
  if (!config) throw new Error(`[TowerFloors] 존재하지 않는 층: ${floor}`);
  return config;
}
