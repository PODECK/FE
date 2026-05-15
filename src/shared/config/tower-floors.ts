/**
 * 무한의 탑 층별 AI 구성
 *
 * @description 층 설정 규칙:
 * - 층 컨셉과 등장 포켓몬 풀을 하드코딩으로 관리
 * - 실제 덱 구성은 별도 로직에서 `pokemonPool`을 기반으로 생성
 * - 밸런싱은 플레이테스트 후 `pokemonPool`, `levelRange`, `aiLevel` 조정
 *
 * @description 계층 구조:
 * - L1: 층 컨셉 및 등장 포켓몬 풀 정의
 * - L2: `buildAiDeck()`이 풀에서 시드 기반으로 덱 구성
 * - L3: `chooseMove()`가 턴마다 기술 선택
 *
 * - 1층 포켓몬 풀: 이상해씨 (풀/독), 치코리타 (풀), 나무지기 (풀), 모부기 (풀), 뚜벅초 (풀/독), 모다피 (풀/독)
 * - 2층 포켓몬 풀: 꼬부기 (물), 리아코 (물), 물짱이 (물), 팽도리 (물), 고라파덕 (물), 발챙이 (물)
 * - 3층 포켓몬 풀: 파이리 (불꽃), 브케인 (불꽃), 아차모 (불꽃), 불꽃숭이 (불꽃), 식스테일 (불꽃), 가디 (불꽃)
 * - 4층 포켓몬 풀: 피카츄 (전기), 삐삐 (노말), 푸린 (노말), 나옹 (노말), 고우스트 (고스트/독), 또가스 (독)
 * - 5층 포켓몬 풀: 아보 (독), 뚜벅초 (풀/독), 또가스 (독), 우파 (물/땅), 꿀꺽몬 (독), 꼬몽울 (독/풀)
 * - 6층 포켓몬 풀: 꼬마돌 (바위/땅), 롱스톤 (바위/땅), 뿔카노 (땅/바위), 애벌레 (바위/땅), 아노딜? (바위/물), 램펄드 (바위)
 * - 7층 포켓몬 풀: 캐이시 (에스퍼), 야돈 (물/에스퍼), 슬리프 (에스퍼), 네이티 (에스퍼), 랄토스 (에스퍼), 딸랑볼 (에스퍼/고스트)
 * - 8층 포켓몬 풀: 리자몽 (불꽃/비행), 거북왕 (물), 이상해꽃 (풀/독), 망나뇽 (드래곤/비행), 강챙이 (물/격투), 갸라도스 (물/비행)
 * - 9층 포켓몬 풀: 후딘 (에스퍼), 팬텀 (고스트/독), 코뿌리 (땅/바위), 라프라스 (물/얼음), 잠만보 (노말), 헬가 (악/불꽃)
 * - 10층 포켓몬 풀: 프테라 (바위/비행), 잠만보 (노말), 망나뇽 (드래곤/비행), 마기라스 (바위/악), 보만다 (드래곤/비행), 한카리아스 (드래곤/땅)
 */
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
