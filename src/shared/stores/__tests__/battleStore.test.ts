import { describe, it, expect, beforeEach } from 'vitest';
import { useBattleStore } from '../battleStore';
import type { PlayerPokemonState, EnemyPokemonState } from '../battleStore';

const PLAYER_TEAM: PlayerPokemonState[] = [
  { dexId: 1, koName: '이상해씨', types: ['grass', 'poison'], currentHp: 45, maxHp: 45, status: 'available' },
  { dexId: 4, koName: '파이리', types: ['fire'], currentHp: 39, maxHp: 39, status: 'available' },
];

const ENEMY_TEAM: EnemyPokemonState[] = [
  { dexId: 7, types: ['water'], fainted: false },
  { dexId: 25, types: ['electric'], fainted: false },
];

beforeEach(() => {
  useBattleStore.getState().reset();
});

describe('BattleStore - initBattle', () => {
  it('초기화 후 phase가 setup이고 팀 데이터가 설정된다', () => {
    useBattleStore.getState().initBattle({ playerTeam: PLAYER_TEAM, enemyTeam: ENEMY_TEAM, floor: 3 });
    const state = useBattleStore.getState();
    expect(state.phase).toBe('setup');
    expect(state.playerTeam).toHaveLength(2);
    expect(state.enemyTeam).toHaveLength(2);
    expect(state.floor).toBe(3);
  });

  it('initBattle 호출 시 이전 로그와 winner가 초기화된다', () => {
    useBattleStore.getState().addLog('이전 로그');
    useBattleStore.getState().endBattle('player');
    useBattleStore.getState().initBattle({ playerTeam: PLAYER_TEAM, enemyTeam: ENEMY_TEAM, floor: 1 });
    const state = useBattleStore.getState();
    expect(state.battleLogs).toHaveLength(0);
    expect(state.winner).toBeNull();
  });
});

describe('BattleStore - HP 업데이트', () => {
  beforeEach(() => {
    useBattleStore.getState().initBattle({ playerTeam: PLAYER_TEAM, enemyTeam: ENEMY_TEAM, floor: 1 });
  });

  it('updatePlayerHp: 해당 포켓몬의 HP만 변경된다', () => {
    useBattleStore.getState().updatePlayerHp(1, 20);
    const team = useBattleStore.getState().playerTeam;
    expect(team.find((p) => p.dexId === 1)?.currentHp).toBe(20);
    expect(team.find((p) => p.dexId === 4)?.currentHp).toBe(39);
  });

  it('updatePlayerHp: HP가 음수가 되지 않는다', () => {
    useBattleStore.getState().updatePlayerHp(1, -10);
    expect(useBattleStore.getState().playerTeam[0]?.currentHp).toBe(0);
  });
});

describe('BattleStore - 기절', () => {
  beforeEach(() => {
    useBattleStore.getState().initBattle({ playerTeam: PLAYER_TEAM, enemyTeam: ENEMY_TEAM, floor: 1 });
  });

  it('faintPlayerPokemon: status가 fainted로, currentHp가 0으로 변경된다', () => {
    useBattleStore.getState().faintPlayerPokemon(1);
    const pokemon = useBattleStore.getState().playerTeam.find((p) => p.dexId === 1);
    expect(pokemon?.status).toBe('fainted');
    expect(pokemon?.currentHp).toBe(0);
  });
});

describe('BattleStore - 배틀 로그', () => {
  it('addLog: 최대 6개까지만 유지된다', () => {
    for (let i = 0; i < 8; i++) {
      useBattleStore.getState().addLog(`메시지 ${i}`);
    }
    expect(useBattleStore.getState().battleLogs).toHaveLength(6);
  });
});

describe('BattleStore - 기술 선택 브릿지', () => {
  it('selectMove: pendingMoveIndex가 설정된다', () => {
    useBattleStore.getState().selectMove(2);
    expect(useBattleStore.getState().pendingMoveIndex).toBe(2);
  });

  it('clearPendingMove: pendingMoveIndex가 null로 초기화된다', () => {
    useBattleStore.getState().selectMove(2);
    useBattleStore.getState().clearPendingMove();
    expect(useBattleStore.getState().pendingMoveIndex).toBeNull();
  });
});

describe('BattleStore - UI 플래그', () => {
  it('openSkillModal / closeSkillModal이 skillModalData를 토글한다', () => {
    const data = {
      dexId: 1,
      koName: '이상해씨',
      enName: 'Bulbasaur',
      types: ['grass'],
      hp: 45,
      moves: [{ koName: '몸통박치기', power: 40, accuracy: 100, pp: 35, maxPp: 35 }],
      flightDuration: 380,
    };
    useBattleStore.getState().openSkillModal(data);
    expect(useBattleStore.getState().skillModalData).not.toBeNull();
    useBattleStore.getState().closeSkillModal();
    expect(useBattleStore.getState().skillModalData).toBeNull();
  });
});
