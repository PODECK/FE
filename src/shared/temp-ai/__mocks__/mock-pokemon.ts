import type { BattleMove, BattlePokemon } from '@/shared/types';

// mock 기술 목록
const RAZOR_LEAF: BattleMove = {
  id: 'razor-leaf',
  koName: '잎날가르기',
  type: 'grass',
  damageClass: 'physical',
  power: 55,
  accuracy: 95,
  pp: 25,
  maxPp: 25,
};

const VINE_WHIP: BattleMove = {
  id: 'vine-whip',
  koName: '덩굴채찍',
  type: 'grass',
  damageClass: 'physical',
  power: 45,
  accuracy: 100,
  pp: 25,
  maxPp: 25,
};

const TACKLE: BattleMove = {
  id: 'tackle',
  koName: '몸통박치기',
  type: 'normal',
  damageClass: 'physical',
  power: 40,
  accuracy: 100,
  pp: 35,
  maxPp: 35,
};

const LEECH_SEED: BattleMove = {
  id: 'leech-seed',
  koName: '씨뿌리기',
  type: 'grass',
  damageClass: 'status',
  power: 0,
  accuracy: 90,
  pp: 10,
  maxPp: 10,
};

const EMBER: BattleMove = {
  id: 'ember',
  koName: '불꽃세례',
  type: 'fire',
  damageClass: 'special',
  power: 40,
  accuracy: 100,
  pp: 25,
  maxPp: 25,
};

const SCRATCH: BattleMove = {
  id: 'scratch',
  koName: '할퀴기',
  type: 'normal',
  damageClass: 'physical',
  power: 40,
  accuracy: 100,
  pp: 35,
  maxPp: 35,
};

const GROWL: BattleMove = {
  id: 'growl',
  koName: '울음소리',
  type: 'normal',
  damageClass: 'status',
  power: 0,
  accuracy: 100,
  pp: 40,
  maxPp: 40,
};

const SMOKESCREEN: BattleMove = {
  id: 'smokescreen',
  koName: '연막',
  type: 'normal',
  damageClass: 'status',
  power: 0,
  accuracy: 100,
  pp: 20,
  maxPp: 20,
};

// mock 포켓몬
export const MOCK_BULBASAUR: BattlePokemon = {
  instanceId: 'mock-bulbasaur-001',
  dexId: 1,
  koName: '이상해씨',
  level: 10,
  types: ['grass', 'poison'],
  currentHp: 45,
  maxHp: 45,
  stats: {
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
  },
  moves: [RAZOR_LEAF, VINE_WHIP, TACKLE, LEECH_SEED],
  fainted: false,
  spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
};

export const MOCK_CHARMANDER: BattlePokemon = {
  instanceId: 'mock-charmander-001',
  dexId: 4,
  koName: '파이리',
  level: 10,
  types: ['fire'],
  currentHp: 39,
  maxHp: 39,
  stats: {
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
  },
  moves: [EMBER, SCRATCH, GROWL, SMOKESCREEN],
  fainted: false,
  spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
};

// mock AI 팀 (이상해씨 6마리)
export const MOCK_AI_TEAM: BattlePokemon[] = Array.from({ length: 6 }, (_, i) => ({
  ...MOCK_BULBASAUR,
  instanceId: `mock-bulbasaur-00${i + 1}`,
  moves: MOCK_BULBASAUR.moves.map((m) => ({ ...m })),
  stats: { ...MOCK_BULBASAUR.stats },
  types: [...MOCK_BULBASAUR.types],
}));
