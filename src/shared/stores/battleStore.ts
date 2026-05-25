import { create } from 'zustand';

export type BattlePhase =
  | 'init'
  | 'setup'
  | 'awaiting_action'
  | 'attack_resolving'
  | 'swap_resolving'
  | 'post_turn'
  | 'awaiting_swap'
  | 'ended';

export type PokemonSideStatus = 'available' | 'fainted';

export interface PlayerPokemonState {
  dexId: number;
  koName: string;
  types: string[];
  currentHp: number;
  maxHp: number;
  status: PokemonSideStatus;
}

export interface EnemyPokemonState {
  dexId: number;
  types: string[];
  fainted: boolean;
}

export interface BattleSkillModalData {
  dexId: number;
  koName: string;
  enName: string;
  types: string[];
  hp: number;
  moves: Array<{
    koName: string;
    power: number;
    accuracy: number;
    pp: number;
    maxPp: number;
  }>;
  flightDuration: number;
}

export interface AttackEffect {
  attackerSide: 'player' | 'enemy';
  pokemonType: string;
}

export interface CameraEvent {
  type: 'zoom-in' | 'shake' | 'faint-zoom' | 'win' | 'lose';
}

interface BattleStoreState {
  phase: BattlePhase;
  playerTeam: PlayerPokemonState[];
  enemyTeam: EnemyPokemonState[];
  battleLogs: Array<{ id: number; message: string }>;
  winner: 'player' | 'enemy' | null;
  floor: number;

  pokemonStatusOpen: boolean;
  confirmQuitOpen: boolean;
  skillModalData: BattleSkillModalData | null;
  deckInvalid: boolean;

  attackEffect: AttackEffect | null;
  cameraEvent: CameraEvent | null;

  pendingMoveIndex: number | null;
  pendingTurnEnd: boolean;
}

interface BattleStoreActions {
  initBattle: (params: { playerTeam: PlayerPokemonState[]; enemyTeam: EnemyPokemonState[]; floor: number }) => void;
  setPhase: (phase: BattlePhase) => void;
  updatePlayerHp: (dexId: number, hp: number) => void;
  faintPlayerPokemon: (dexId: number) => void;
  setEnemyTeam: (team: EnemyPokemonState[]) => void;
  addLog: (message: string) => void;
  endBattle: (winner: 'player' | 'enemy') => void;

  openSkillModal: (data: BattleSkillModalData) => void;
  closeSkillModal: () => void;
  setPokemonStatusOpen: (open: boolean) => void;
  setConfirmQuitOpen: (open: boolean) => void;
  setDeckInvalid: (invalid: boolean) => void;

  triggerAttackEffect: (effect: AttackEffect) => void;
  clearAttackEffect: () => void;
  triggerCameraEvent: (event: CameraEvent) => void;
  clearCameraEvent: () => void;

  selectMove: (moveIndex: number) => void;
  clearPendingMove: () => void;
  endPlayerTurn: () => void;
  clearPendingTurnEnd: () => void;

  reset: () => void;
}

const INITIAL_STATE: BattleStoreState = {
  phase: 'init',
  playerTeam: [],
  enemyTeam: [],
  battleLogs: [],
  winner: null,
  floor: 1,
  pokemonStatusOpen: false,
  confirmQuitOpen: false,
  skillModalData: null,
  deckInvalid: false,
  attackEffect: null,
  cameraEvent: null,
  pendingMoveIndex: null,
  pendingTurnEnd: false,
};

export const useBattleStore = create<BattleStoreState & BattleStoreActions>()((set) => ({
  ...INITIAL_STATE,

  initBattle: ({ playerTeam, enemyTeam, floor }) =>
    set({ ...INITIAL_STATE, playerTeam, enemyTeam, floor, phase: 'setup' }),

  setPhase: (phase) => set({ phase }),

  updatePlayerHp: (dexId, hp) =>
    set((state) => ({
      playerTeam: state.playerTeam.map((p) => (p.dexId === dexId ? { ...p, currentHp: Math.max(0, hp) } : p)),
    })),

  faintPlayerPokemon: (dexId) =>
    set((state) => ({
      playerTeam: state.playerTeam.map((p) =>
        p.dexId === dexId ? { ...p, status: 'fainted' as PokemonSideStatus, currentHp: 0 } : p,
      ),
    })),

  setEnemyTeam: (team) => set({ enemyTeam: team }),

  addLog: (message) =>
    set((state) => ({
      battleLogs: [...state.battleLogs.slice(-5), { id: Date.now() + Math.random(), message }],
    })),

  endBattle: (winner) => set({ winner, phase: 'ended' }),

  openSkillModal: (data) => set({ skillModalData: data }),
  closeSkillModal: () => set({ skillModalData: null }),
  setPokemonStatusOpen: (open) => set({ pokemonStatusOpen: open }),
  setConfirmQuitOpen: (open) => set({ confirmQuitOpen: open }),
  setDeckInvalid: (invalid) => set({ deckInvalid: invalid }),

  triggerAttackEffect: (effect) => set({ attackEffect: effect }),
  clearAttackEffect: () => set({ attackEffect: null }),
  triggerCameraEvent: (event) => set({ cameraEvent: event }),
  clearCameraEvent: () => set({ cameraEvent: null }),

  selectMove: (moveIndex) => set({ pendingMoveIndex: moveIndex }),
  clearPendingMove: () => set({ pendingMoveIndex: null }),
  endPlayerTurn: () => set({ pendingTurnEnd: true }),
  clearPendingTurnEnd: () => set({ pendingTurnEnd: false }),

  reset: () => set(INITIAL_STATE),
}));
