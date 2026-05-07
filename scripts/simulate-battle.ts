// 실행: npx tsx scripts/simulate-battle.ts

import { createRng, generateSeed } from '../src/shared/lib/rng';
import { chooseForceSwap, chooseMove } from '../src/shared/temp-ai/strategy';
import { buildAiDeck } from '../src/shared/temp-ai/deck-builder';
import { getFloorConfig } from '../src/shared/config/tower-floors';
import { MOCK_BULBASAUR } from '../src/shared/temp-ai/__mocks__/mock-pokemon';
import type { BattlePokemon } from '../src/shared/types/pokemon';

const SIMULATIONS = 100;

function simulateOneBattle(floor: number, seed: number): 'player' | 'ai' {
  const rng = createRng(seed);
  const floorConfig = getFloorConfig(floor);
  const aiTeam = buildAiDeck(floorConfig, rng);

  // 플레이어 팀: 이상해씨 6마리 (목 데이터)
  const playerTeam: BattlePokemon[] = Array.from({ length: 6 }, (_, i) => ({
    ...MOCK_BULBASAUR,
    instanceId: `player-${i}`,
  }));

  let playerIndex = 0;
  let aiIndex = 0;
  let turn = 0;

  while (turn < 200) {
    turn++;
    const player = playerTeam[playerIndex]!;
    const ai = aiTeam[aiIndex]!;

    // 플레이어: 항상 첫 번째 기술
    const playerMoveIdx = player.moves.findIndex((m) => m.pp > 0);
    if (playerMoveIdx === -1) break;

    // AI: 전략 선택
    const aiMoveIdx = chooseMove(ai, player, floorConfig.aiLevel, rng);
    if (aiMoveIdx === -1) break;

    // 간단한 데미지 계산 (목 시뮬레이션용)
    const playerMove = player.moves[playerMoveIdx]!;
    const aiMove = ai.moves[aiMoveIdx]!;

    player.moves[playerMoveIdx]!.pp--;
    ai.moves[aiMoveIdx]!.pp--;

    ai.currentHp -= Math.max(1, Math.floor(playerMove.power * 0.3));
    player.currentHp -= Math.max(1, Math.floor(aiMove.power * 0.3));

    // 기절 처리
    if (ai.currentHp <= 0) {
      ai.fainted = true;
      const next = chooseForceSwap(aiTeam, aiIndex, rng);
      if (next === -1) return 'player';
      aiIndex = next;
    }

    if (player.currentHp <= 0) {
      player.fainted = true;
      const next = playerTeam.findIndex((p, i) => i > playerIndex && !p.fainted);
      if (next === -1) return 'ai';
      playerIndex = next;
    }
  }

  return 'ai'; // 200턴 초과 → AI 승리 (무한 루프 방지)
}

// 층별 승률 측정
console.log('\n[AI 밸런싱 시뮬레이션]');
console.log(`시뮬레이션 횟수: ${SIMULATIONS}판\n`);

for (let floor = 1; floor <= 10; floor++) {
  let playerWins = 0;

  for (let i = 0; i < SIMULATIONS; i++) {
    const seed = generateSeed();
    const result = simulateOneBattle(floor, seed);
    if (result === 'player') playerWins++;
  }

  const winRate = ((playerWins / SIMULATIONS) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(playerWins / 5)).padEnd(20, '░');
  console.log(`${floor}층 [${bar}] 플레이어 승률: ${winRate}%`);
}

console.log('\n목표 승률: 1층 70~80% → 10층 30~40%\n');
