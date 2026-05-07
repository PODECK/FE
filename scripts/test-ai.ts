// 실행: npx tsx scripts/test-ai.ts

import { createRng } from '../src/shared/lib/rng';
import { chooseMove, chooseForceSwap } from '../src/shared/temp-ai/strategy';
import { evaluateAllMoves } from '../src/shared/temp-ai/battle-ai-evaluator';
import { buildAiDeck } from '../src/shared/temp-ai/deck-builder';
import { getFloorConfig } from '../src/shared/config/tower-floors';
import { MOCK_AI_TEAM, MOCK_BULBASAUR, MOCK_CHARMANDER } from '../src/shared/temp-ai/__mocks__/mock-pokemon';

// ────────────────────────────────────────────────
// 검증 1: 결정론성 (같은 시드 = 같은 결과)
// ────────────────────────────────────────────────
console.log('\n[1] 결정론성 검증');

const rng1 = createRng(42);
const rng2 = createRng(42);

const move1 = chooseMove(MOCK_BULBASAUR, MOCK_CHARMANDER, 'normal', rng1);
const move2 = chooseMove(MOCK_BULBASAUR, MOCK_CHARMANDER, 'normal', rng2);

console.log(`시드 42, 1차: ${move1}`);
console.log(`시드 42, 2차: ${move2}`);

let failed = false;
const pass = (label: string, condition: boolean) => {
  console.log(`${label}: ${condition ? '✅ 통과' : '❌ 실패'}`);
  if (!condition) failed = true;
};
pass('결정론성', move1 === move2);

// ────────────────────────────────────────────────
// 검증 2: 타입 상성 평가 (불꽃 → 풀: 2배)
// ────────────────────────────────────────────────
console.log('\n[2] 타입 상성 평가');

const ranked = evaluateAllMoves(MOCK_CHARMANDER, MOCK_BULBASAUR);
console.log('파이리가 이상해씨에게 기술 순위:');
ranked.forEach((e) => {
  console.log(
    `  ${e.move.koName} | 점수: ${e.score.toFixed(1)} | 상성: ${e.effectiveness}배 | 사용가능: ${e.isUsable}`,
  );
});

const bestMove = ranked.find((e) => e.isUsable);
const isFireFirst = bestMove?.move.type === 'fire';
pass('불꽃 기술 1순위', isFireFirst);

// ────────────────────────────────────────────────
// 검증 3: 덱 빌더 (시드 기반, 길이 = min(6, pokemonPool.length))
// ────────────────────────────────────────────────
console.log('\n[3] 덱 빌더 검증');

const floor1 = getFloorConfig(1);
const expectedDeckSize = Math.min(6, floor1.pokemonPool.length);
const rng3 = createRng(99);
const rng4 = createRng(99);

const deck1 = buildAiDeck(floor1, rng3);
const deck2 = buildAiDeck(floor1, rng4);

const deckSizeOk =
  deck1.length === expectedDeckSize && deck2.length === expectedDeckSize && deck1.length === deck2.length;

// MockPokemonDataSource는 dexId를 풀과 맞추지 않을 수 있어 instanceId·level로 결정론성 검증
const decksMatch = deck1.every(
  (p, i) => deck2[i] !== undefined && p.instanceId === deck2[i]!.instanceId && p.level === deck2[i]!.level,
);

pass(`덱 사이즈 (${expectedDeckSize}마리 기대)`, deckSizeOk);
pass('결정론성', decksMatch);

// ────────────────────────────────────────────────
// 검증 4: PP 소진 처리
// ────────────────────────────────────────────────
console.log('\n[4] PP 소진 처리');

const exhausted = {
  ...MOCK_BULBASAUR,
  moves: MOCK_BULBASAUR.moves.map((m) => ({ ...m, pp: 0 })),
};
const result = chooseMove(exhausted, MOCK_CHARMANDER, 'easy', createRng(1));
pass('PP 전부 소진 시 -1 반환', result === -1);

// ────────────────────────────────────────────────
// 검증 5: 강제 교체
// ────────────────────────────────────────────────
console.log('\n[5] 강제 교체 검증');

const faintedTeam = MOCK_AI_TEAM.map((p, i) => (i === 0 ? { ...p, fainted: true } : p));
const swapIndex = chooseForceSwap(faintedTeam, 0, createRng(1));
pass(`기절 포켓몬(0) 제외 교체: ${swapIndex > 0 ? '✅ 통과' : '❌ 실패'} (index: ${swapIndex})`, swapIndex > 0);

console.log('\n검증 완료\n');
if (failed) {
  console.error('\n일부 검증 실패\n');
  process.exit(1);
}
