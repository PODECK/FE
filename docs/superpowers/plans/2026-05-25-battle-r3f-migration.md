# R3F Battle Page Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phaser 4 배틀 캔버스를 React Three Fiber로 전환해 3D 카드 연출을 구현하고, window CustomEvent 브릿지 12개를 Zustand battleStore로 교체한다.

**Architecture:** State Machine First — `shared/stores/battleStore.ts`(Zustand)를 먼저 구축해 CustomEvent를 제거하고, R3F 씬이 스토어를 구독하는 순수 뷰로 동작한다. `NEXT_PUBLIC_BATTLE_ENGINE=r3f` 환경변수로 Phaser/R3F를 토글하며 두 엔진 모두 동일한 battleStore를 공유한다.

**Tech Stack:** React 19, Next.js 16, Zustand ^5, Three.js, @react-three/fiber ^8, @react-three/drei ^9, @react-three/postprocessing ^2, @use-gesture/react ^10, Vitest

---

## 파일 맵

| 상태 | 경로                                                       | 역할                                            |
| ---- | ---------------------------------------------------------- | ----------------------------------------------- |
| 생성 | `src/shared/stores/battleStore.ts`                         | Zustand 배틀 스토어 (CustomEvent 브릿지 대체)   |
| 생성 | `src/shared/stores/__tests__/battleStore.test.ts`          | 스토어 단위 테스트                              |
| 수정 | `src/features/battle/game/scenes/BattleScene.ts`           | CustomEvent dispatch → store 액션               |
| 수정 | `src/features/battle/_components/BattleScreen.tsx`         | CustomEvent listener → store 구독 + 피처 플래그 |
| 수정 | `src/features/battle/_components/BattleTopBar.tsx`         | CustomEvent dispatch → store                    |
| 수정 | `src/features/battle/_components/BattleBottomHUD.tsx`      | CustomEvent dispatch → store                    |
| 수정 | `src/features/battle/_components/SkillModal.tsx`           | CustomEvent dispatch → store                    |
| 생성 | `src/features/battle/game/r3f/BattleCanvas.tsx`            | R3F Canvas 루트                                 |
| 생성 | `src/features/battle/game/r3f/BattleField.tsx`             | 배경 이미지 평면                                |
| 생성 | `src/features/battle/game/r3f/card/BattleCard.tsx`         | 카드 3D 메시 + 텍스처 + 틸트                    |
| 생성 | `src/features/battle/game/r3f/card/CardHologramShader.ts`  | 전설 카드 홀로그램 ShaderMaterial               |
| 생성 | `src/features/battle/game/r3f/card/CardDragController.tsx` | useDrag + Raycaster 드래그앤드롭                |
| 생성 | `src/features/battle/game/r3f/zones/PlayerDeckZone.tsx`    | 플레이어 손패 팬 배치                           |
| 생성 | `src/features/battle/game/r3f/zones/EnemyDeckZone.tsx`     | AI 손패 팬 배치                                 |
| 생성 | `src/features/battle/game/r3f/zones/DropZone.tsx`          | 필드 슬롯 + 배치 판정                           |
| 생성 | `src/features/battle/game/r3f/hud/HealthBar.tsx`           | drei `Html`로 HP 바                             |
| 생성 | `src/features/battle/game/r3f/effects/AttackParticles.tsx` | 타입별 공격 파티클                              |
| 생성 | `src/features/battle/game/r3f/effects/HitEffect.tsx`       | 히트 플래시 + 리코일                            |
| 생성 | `src/features/battle/game/r3f/effects/ScreenShake.tsx`     | 화면 흔들림                                     |
| 생성 | `src/features/battle/game/r3f/camera/BattleCamera.tsx`     | PerspectiveCamera + cameraEvent 연출            |

---

## PHASE 1: BattleStore + CustomEvent 브릿지 제거

### Task 1: R3F 의존성 설치

**Files:** `package.json`

- [ ] **Step 1: 패키지 설치**

```bash
pnpm add @react-three/fiber @react-three/drei @react-three/postprocessing @use-gesture/react three
pnpm add -D @types/three
```

- [ ] **Step 2: 설치 확인**

```bash
node -e "require('@react-three/fiber'); console.log('R3F OK')"
```

Expected: `R3F OK`

- [ ] **Step 3: 커밋**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install R3F and gesture libraries"
```

---

### Task 2: BattleStore 생성

**Files:**

- Create: `src/shared/stores/battleStore.ts`

- [ ] **Step 1: 파일 생성**

```typescript
// src/shared/stores/battleStore.ts
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

  // UI 플래그 (Phaser CustomEvent 대체)
  pokemonStatusOpen: boolean;
  confirmQuitOpen: boolean;
  skillModalData: BattleSkillModalData | null;
  deckInvalid: boolean;

  // R3F 트리거 상태
  attackEffect: AttackEffect | null;
  cameraEvent: CameraEvent | null;

  // React → Phaser 브릿지 (Phase 1만 사용; Phase 3에서 제거)
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
```

- [ ] **Step 2: 타입체크**

```bash
pnpm typecheck
```

Expected: 에러 없음

---

### Task 3: BattleStore 단위 테스트

**Files:**

- Create: `src/shared/stores/__tests__/battleStore.test.ts`

- [ ] **Step 1: 테스트 파일 생성**

```typescript
// src/shared/stores/__tests__/battleStore.test.ts
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test src/shared/stores/__tests__/battleStore.test.ts
```

Expected: 일부 FAIL (battleStore.ts가 아직 완성되지 않았다면), 또는 전체 PASS

- [ ] **Step 3: 테스트 통과 확인**

```bash
pnpm test src/shared/stores/__tests__/battleStore.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add src/shared/stores/battleStore.ts src/shared/stores/__tests__/battleStore.test.ts
git commit -m "feat(battle): add battleStore to replace CustomEvent bridge"
```

---

### Task 4: BattleScene.ts — Phaser→React 이벤트를 store로 교체

**Files:**

- Modify: `src/features/battle/game/scenes/BattleScene.ts`

이 작업은 BattleScene.ts에서 `window.dispatchEvent(new CustomEvent(...))` 호출을 `useBattleStore.getState().action()` 으로 교체한다. 로직은 그대로 유지된다.

- [ ] **Step 1: import 추가 (파일 상단)**

```typescript
// 기존 import들 아래에 추가
import { useBattleStore } from '@/shared/stores/battleStore';
import type { PlayerPokemonState } from '@/shared/stores/battleStore';
```

- [ ] **Step 2: dispatchAiDeckStatus 메서드 교체**

Before (line ~92):

```typescript
private dispatchAiDeckStatus() {
  window.dispatchEvent(
    new CustomEvent('battle:ai-deck-status', {
      detail: this.aiDeck.map((p) => ({
        dexId: p.dexId,
        types: p.types,
        fainted: p.fainted,
      })),
    }),
  );
}
```

After:

```typescript
private dispatchAiDeckStatus() {
  useBattleStore.getState().setEnemyTeam(
    this.aiDeck.map((p) => ({ dexId: p.dexId, types: p.types, fainted: p.fainted })),
  );
}
```

- [ ] **Step 3: dispatchPlayerDeckInvalid 메서드 교체**

Before (line ~104):

```typescript
private dispatchPlayerDeckInvalid() {
  window.dispatchEvent(new CustomEvent('battle:player-deck-invalid'));
}
```

After:

```typescript
private dispatchPlayerDeckInvalid() {
  useBattleStore.getState().setDeckInvalid(true);
}
```

- [ ] **Step 4: setTurnPhase 메서드 교체**

Before (line ~128):

```typescript
private setTurnPhase(phase: TurnPhase) {
  this.turnPhase = phase;
  window.dispatchEvent(new CustomEvent('battle:turn-phase', { detail: { phase } }));
}
```

After:

```typescript
private setTurnPhase(phase: TurnPhase) {
  this.turnPhase = phase;
  // TurnPhase → BattlePhase 매핑
  const phaseMap: Record<TurnPhase, import('@/shared/stores/battleStore').BattlePhase> = {
    setup: 'setup',
    player: 'awaiting_action',
    ai: 'attack_resolving',
    ended: 'ended',
  };
  useBattleStore.getState().setPhase(phaseMap[phase]);
}
```

- [ ] **Step 5: create() 메서드에 initBattle 호출 추가**

`this.setTurnPhase('setup');` 이전(create 메서드 끝 부분)에 배틀 초기화 코드 추가:

```typescript
// playerDeck 빌드 성공 후, this.setTurnPhase('setup') 이전 라인에 추가
const playerTeam: PlayerPokemonState[] = this.playerDeck.map((p) => ({
  dexId: p.dexId,
  koName: p.koName,
  types: p.types,
  currentHp: p.currentHp,
  maxHp: p.maxHp,
  status: 'available' as const,
}));
useBattleStore.getState().initBattle({
  playerTeam,
  enemyTeam: this.aiDeck.map((p) => ({ dexId: p.dexId, types: p.types, fainted: p.fainted })),
  floor: readStoredTowerFloor(),
});
```

- [ ] **Step 6: setZoneHp — player HP 이벤트 교체**

Before (line ~1376):

```typescript
if (side === 'player') {
  const cardData = card.getData('cardData') as CardData | undefined;
  if (cardData) {
    const dexId = parseInt(cardData.texture.replace('card-', ''));
    window.dispatchEvent(
      new CustomEvent('battle:player-pokemon-hp-changed', {
        detail: { dexId, currentHp: bar.currentHp },
      }),
    );
  }
}
```

After:

```typescript
if (side === 'player') {
  const cardData = card.getData('cardData') as CardData | undefined;
  if (cardData) {
    const dexId = parseInt(cardData.texture.replace('card-', ''));
    useBattleStore.getState().updatePlayerHp(dexId, bar.currentHp);
  }
}
```

- [ ] **Step 7: faintCard — pokemon-fainted 이벤트 교체**

Before (line ~1399):

```typescript
if (cardData) {
  const dexId = parseInt(cardData.texture.replace('card-', ''));
  window.dispatchEvent(new CustomEvent('battle:pokemon-fainted', { detail: { dexId } }));
}
```

After:

```typescript
if (cardData) {
  const dexId = parseInt(cardData.texture.replace('card-', ''));
  useBattleStore.getState().faintPlayerPokemon(dexId);
}
```

- [ ] **Step 8: battle:ended 이벤트 교체 (2곳)**

```typescript
// onAiFainted (line ~1807)
// Before:
window.dispatchEvent(new CustomEvent('battle:ended', { detail: { winner: 'player' } }));
// After:
useBattleStore.getState().endBattle('player');

// onPlayerFainted
// Before:
window.dispatchEvent(new CustomEvent('battle:ended', { detail: { winner: 'enemy' } }));
// After:
useBattleStore.getState().endBattle('enemy');
```

- [ ] **Step 9: dispatchBattleLog 교체**

```typescript
// battle-log.ts의 dispatchBattleLog 호출을 wrapping하는 private 메서드가 있음
// BattleScene.ts의 dispatchBattleLog private 메서드:
private dispatchBattleLog(message: string) {
  dispatchBattleLog(message); // 기존 유지 (battle-log.ts의 window.dispatchEvent wrapper)
  useBattleStore.getState().addLog(message);
}
```

Note: `battle-log.ts`의 `dispatchBattleLog`도 `window.dispatchEvent`를 사용하므로 Task 6에서 BattleScreen의 listener 제거 후 battle-log.ts도 수정 필요.

- [ ] **Step 10: emitZoneCardClick — zone-card-click 이벤트 교체**

Before (line ~1158):

```typescript
window.dispatchEvent(
  new CustomEvent('battle:zone-card-click', {
    detail: { dexId, koName, enName, types, hp, moves, flightDuration: FLIGHT_MS },
  }),
);
```

After:

```typescript
useBattleStore.getState().openSkillModal({ dexId, koName, enName, types, hp, moves, flightDuration: FLIGHT_MS });
```

- [ ] **Step 11: battle:modal-close 구독으로 교체**

`emitZoneCardClick` 메서드 끝부분에서 `closeHandler`를 등록하는 부분 교체.

Before:

```typescript
window.addEventListener('battle:modal-close', closeHandler);
```

After — `emitZoneCardClick` 내에서:

```typescript
// closeHandler를 등록하는 대신 store 구독
let unsubModal: (() => void) | null = null;
unsubModal = useBattleStore.subscribe(
  (state) => state.skillModalData,
  (current) => {
    if (current === null) {
      unsubModal?.();
      unsubModal = null;
      closeHandler();
    }
  },
);
```

그리고 `closeHandler` 내부에서 `window.removeEventListener('battle:modal-close', closeHandler);` 라인을 삭제한다.

- [ ] **Step 12: 타입체크**

```bash
pnpm typecheck
```

Expected: 에러 없음

- [ ] **Step 13: 커밋**

```bash
git add src/features/battle/game/scenes/BattleScene.ts
git commit -m "feat(battle): migrate BattleScene Phaser→React dispatches to battleStore"
```

---

### Task 5: BattleScene.ts — React→Phaser 리스너를 store 구독으로 교체

**Files:**

- Modify: `src/features/battle/game/scenes/BattleScene.ts`

- [ ] **Step 1: class 필드에 구독 해제 함수 추가**

```typescript
// 클래스 상단 private 필드들 아래에 추가
private _unsubMoveSelected: (() => void) | null = null;
private _unsubTurnEnded: (() => void) | null = null;
```

- [ ] **Step 2: create() 메서드에서 addEventListener 교체**

Before (line ~221):

```typescript
window.addEventListener('battle:move-selected', this.handleMoveSelected);
window.addEventListener('battle:turn-ended', this.handleTurnEnded);
```

After:

```typescript
this._unsubMoveSelected = useBattleStore.subscribe(
  (state) => state.pendingMoveIndex,
  (moveIndex) => {
    if (moveIndex !== null) {
      useBattleStore.getState().clearPendingMove();
      this.handleMoveSelected_store(moveIndex);
    }
  },
);

this._unsubTurnEnded = useBattleStore.subscribe(
  (state) => state.pendingTurnEnd,
  (pending) => {
    if (pending) {
      useBattleStore.getState().clearPendingTurnEnd();
      this.handleTurnEnded();
    }
  },
);
```

- [ ] **Step 3: handleMoveSelected_store 메서드 추가**

기존 `handleMoveSelected`는 CustomEvent 시그니처를 사용함. store용 버전을 추가:

```typescript
private handleMoveSelected_store(moveIndex: number) {
  if (this.isModalOpen) {
    this.queuedMoveIndex = moveIndex;
    return;
  }
  this.resolveTurn(moveIndex);
}
```

- [ ] **Step 4: shutdown() 메서드에서 removeEventListener 교체**

Before:

```typescript
shutdown() {
  window.removeEventListener('battle:move-selected', this.handleMoveSelected);
  window.removeEventListener('battle:turn-ended', this.handleTurnEnded);
}
```

After:

```typescript
shutdown() {
  this._unsubMoveSelected?.();
  this._unsubTurnEnded?.();
  this._unsubMoveSelected = null;
  this._unsubTurnEnded = null;
}
```

- [ ] **Step 5: battle-log.ts 수정**

`src/features/battle/game/battle-log.ts`를 열어 `dispatchBattleLog` 함수가 `window.dispatchEvent`를 사용하는지 확인 후, 스토어만 사용하도록 교체:

```typescript
// battle-log.ts
import { useBattleStore } from '@/shared/stores/battleStore';

export function dispatchBattleLog(message: string) {
  useBattleStore.getState().addLog(message);
}
```

Note: 기존의 `window.dispatchEvent(new CustomEvent('battle:log', ...))` 라인을 제거한다.

- [ ] **Step 6: 타입체크**

```bash
pnpm typecheck
```

- [ ] **Step 7: 커밋**

```bash
git add src/features/battle/game/scenes/BattleScene.ts src/features/battle/game/battle-log.ts
git commit -m "feat(battle): replace React→Phaser CustomEvent listeners with battleStore subscriptions"
```

---

### Task 6: BattleScreen.tsx — CustomEvent 리스너 제거, store 구독으로 전환

**Files:**

- Modify: `src/features/battle/_components/BattleScreen.tsx`

- [ ] **Step 1: import 추가**

```typescript
import { useBattleStore } from '@/shared/stores/battleStore';
```

- [ ] **Step 2: 모든 CustomEvent useEffect를 store 구독으로 교체**

아래의 `useEffect` 블록들을 전부 제거하고, store에서 직접 값을 읽는 방식으로 교체한다:

제거할 useEffect (총 9개):

- `battle:turn-phase` → `const turnPhase = useBattleStore(state => state.phase)`로 대체
- `battle:ai-deck-status` → `const aiPokemon = useBattleStore(state => state.enemyTeam)`
- `battle:log` → `const battleLogs = useBattleStore(state => state.battleLogs)`
- `battle:zone-card-click` → `const skillModal = useBattleStore(state => state.skillModalData)`
- `battle:pokemon-status` → `const pokemonSelectOpen = useBattleStore(state => state.pokemonStatusOpen)`
- `battle:confirm-quit` → `const confirmQuit = useBattleStore(state => state.confirmQuitOpen)`
- `battle:pokemon-fainted` → playerTeam에서 derived
- `battle:player-pokemon-hp-changed` → `const playerTeam = useBattleStore(state => state.playerTeam)`
- `battle:ended` → `const winner = useBattleStore(state => state.winner)`
- `battle:player-deck-invalid` → `const deckInvalid = useBattleStore(state => state.deckInvalid)`

새 코드 (모든 useState + useEffect 교체):

```typescript
const playerTeamFromStore = useBattleStore((state) => state.playerTeam);
const aiPokemon = useBattleStore((state) => state.enemyTeam);
const battleLogs = useBattleStore((state) => state.battleLogs);
const skillModal = useBattleStore((state) => state.skillModalData);
const pokemonSelectOpen = useBattleStore((state) => state.pokemonStatusOpen);
const confirmQuit = useBattleStore((state) => state.confirmQuitOpen);
const deckInvalid = useBattleStore((state) => state.deckInvalid);
const winner = useBattleStore((state) => state.winner);
const storePhase = useBattleStore((state) => state.phase);

// storePhase → TurnPhase 변환 (UI turnButtonLabel용)
const isPlayerTurn = storePhase === 'awaiting_action';
const turnPhase = storePhase === 'awaiting_action' ? 'player' : storePhase === 'attack_resolving' ? 'ai' : 'setup';
```

- [ ] **Step 3: winner useEffect 추가 (배틀 종료 처리)**

기존 `battle:ended` useEffect 로직을 `winner` 변화에 반응하는 useEffect로 교체:

```typescript
useEffect(() => {
  if (!winner) return;
  if (hasHandledBattleEndRef.current) return;
  hasHandledBattleEndRef.current = true;

  recordBattleResult(winner);

  if (winner === 'player') {
    markWinRewardPending();
    router.push('/battle/win');
    return;
  }
  loseLife();
  router.push('/battle/lose');
}, [winner, loseLife, markWinRewardPending, router]);
```

- [ ] **Step 4: deckInvalid useEffect 추가**

```typescript
useEffect(() => {
  if (!deckInvalid) return;
  handleIncompleteDeck();
}, [deckInvalid, handleIncompleteDeck]);
```

- [ ] **Step 5: handleTurnEnd 수정**

Before:

```typescript
const handleTurnEnd = () => {
  if (!isPlayerTurn) return;
  window.dispatchEvent(new CustomEvent('battle:turn-ended'));
};
```

After:

```typescript
const handleTurnEnd = () => {
  if (!isPlayerTurn) return;
  useBattleStore.getState().endPlayerTurn();
};
```

- [ ] **Step 6: SkillModal의 onConfirmMove 수정**

Before:

```tsx
onConfirmMove={(moveIndex) => {
  window.dispatchEvent(new CustomEvent('battle:move-selected', { detail: { moveIndex } }));
}}
```

After:

```tsx
onConfirmMove={(moveIndex) => {
  useBattleStore.getState().selectMove(moveIndex);
  useBattleStore.getState().closeSkillModal();
}}
```

- [ ] **Step 7: pokemonSelectOpen / confirmQuit 닫기 핸들러 수정**

```tsx
// pokemonSelectOpen 닫기
onClose={() => useBattleStore.getState().setPokemonStatusOpen(false)}

// confirmQuit 닫기
onClick={() => useBattleStore.getState().setConfirmQuitOpen(false)}
```

- [ ] **Step 8: pokemonList prop 교체**

```typescript
// playerTeamFromStore를 PokemonEntry 형식으로 변환
const pokemonList = playerTeamFromStore.map((p) => ({
  dexId: p.dexId,
  koName: p.koName,
  types: p.types,
  currentHp: p.currentHp,
  maxHp: p.maxHp,
  status: p.status,
}));
```

- [ ] **Step 9: 타입체크**

```bash
pnpm typecheck
```

- [ ] **Step 10: 커밋**

```bash
git add src/features/battle/_components/BattleScreen.tsx
git commit -m "feat(battle): migrate BattleScreen CustomEvent listeners to battleStore"
```

---

### Task 7: HUD 컴포넌트 마이그레이션

**Files:**

- Modify: `src/features/battle/_components/BattleTopBar.tsx`
- Modify: `src/features/battle/_components/BattleBottomHUD.tsx`
- Modify: `src/features/battle/_components/SkillModal.tsx`

- [ ] **Step 1: BattleTopBar.tsx 수정**

Before:

```typescript
const handleGoHome = () => {
  window.dispatchEvent(new CustomEvent('battle:confirm-quit'));
};
```

After:

```typescript
import { useBattleStore } from '@/shared/stores/battleStore';

const handleGoHome = () => {
  useBattleStore.getState().setConfirmQuitOpen(true);
};
```

- [ ] **Step 2: BattleBottomHUD.tsx 수정**

Before:

```tsx
onClick={() => window.dispatchEvent(new CustomEvent('battle:pokemon-status'))}
```

After:

```typescript
import { useBattleStore } from '@/shared/stores/battleStore';

// 버튼 onClick:
onClick={() => useBattleStore.getState().setPokemonStatusOpen(true)}
```

- [ ] **Step 3: SkillModal.tsx 수정**

Before:

```typescript
const handleClose = () => {
  if (closing) return;
  setClosing(true);
  window.dispatchEvent(new CustomEvent('battle:modal-close'));
};
```

After:

```typescript
import { useBattleStore } from '@/shared/stores/battleStore';

const handleClose = () => {
  if (closing) return;
  setClosing(true);
  useBattleStore.getState().closeSkillModal();
};
```

- [ ] **Step 4: 타입체크**

```bash
pnpm typecheck
```

- [ ] **Step 5: 커밋**

```bash
git add src/features/battle/_components/BattleTopBar.tsx \
        src/features/battle/_components/BattleBottomHUD.tsx \
        src/features/battle/_components/SkillModal.tsx
git commit -m "feat(battle): migrate HUD component CustomEvents to battleStore"
```

---

### Task 8: 피처 플래그 + 빈 BattleCanvas 추가

**Files:**

- Modify: `src/features/battle/_components/BattleScreen.tsx`
- Create: `src/features/battle/game/r3f/BattleCanvas.tsx`
- Modify: `.env.local` (또는 새로 생성)

- [ ] **Step 1: .env.local에 피처 플래그 추가**

```bash
echo "NEXT_PUBLIC_BATTLE_ENGINE=phaser" >> .env.local
```

- [ ] **Step 2: BattleCanvas.tsx 스텁 생성**

```typescript
// src/features/battle/game/r3f/BattleCanvas.tsx
'use client';

import { Canvas } from '@react-three/fiber';

export default function BattleCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {/* R3F 씬 컴포넌트들이 이 안에 들어올 예정 */}
    </Canvas>
  );
}
```

- [ ] **Step 3: BattleScreen.tsx에 피처 플래그 분기 추가**

```typescript
import dynamic from 'next/dynamic';

const BattleCanvas = dynamic(() => import('../game/r3f/BattleCanvas'), { ssr: false });

// JSX 내부에서 Phaser 컨테이너 교체:
const useR3F = process.env.NEXT_PUBLIC_BATTLE_ENGINE === 'r3f';

// return 안에서:
{useR3F ? (
  <BattleCanvas />
) : (
  <div ref={containerRef} id="phaser-container" className="absolute inset-0" />
)}
```

- [ ] **Step 4: 개발 서버 확인**

```bash
pnpm dev
```

브라우저에서 `/battle` 접속 후 Phaser 캔버스가 정상 작동하는지 확인한다. (피처 플래그가 `phaser`이므로 R3F는 렌더링되지 않음)

- [ ] **Step 5: 커밋**

```bash
git add src/features/battle/_components/BattleScreen.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx \
        .env.local
git commit -m "feat(battle): add feature flag and empty BattleCanvas stub"
```

---

## PHASE 2: R3F 카드 메시 + 드래그앤드롭

### Task 9: BattleField.tsx — 배경 이미지 평면

**Files:**

- Create: `src/features/battle/game/r3f/BattleField.tsx`

- [ ] **Step 1: 파일 생성**

```typescript
// src/features/battle/game/r3f/BattleField.tsx
'use client';

import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export default function BattleField() {
  const texture = useTexture('/images/battle/trainer-tower-field.png');
  const { viewport } = useThree();

  // 화면을 꽉 채우도록 aspect ratio 맞춤
  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9;
  const w = Math.max(viewport.width, viewport.height * aspect);
  const h = w / aspect;

  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
```

- [ ] **Step 2: BattleCanvas.tsx에 추가**

```typescript
import BattleField from './BattleField';

// Canvas 안에:
<BattleField />
```

- [ ] **Step 3: 피처 플래그를 r3f로 변경해서 확인**

`.env.local`에서 `NEXT_PUBLIC_BATTLE_ENGINE=r3f` 로 바꾼 뒤 개발 서버에서 배경이 보이는지 확인한다. 확인 후 다시 `phaser`로 되돌린다.

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/BattleField.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add BattleField background plane"
```

---

### Task 10: BattleCard.tsx — 3D 메시 + 텍스처 + 호버 틸트

**Files:**

- Create: `src/features/battle/game/r3f/card/BattleCard.tsx`

- [ ] **Step 1: 파일 생성**

```typescript
// src/features/battle/game/r3f/card/BattleCard.tsx
'use client';

import { useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BattleCardProps {
  dexId: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  faceUp?: boolean;
}

const CARD_W = 0.7;
const CARD_H = 1.0;
const CARD_D = 0.01;

export default function BattleCard({
  dexId,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  faceUp = true,
}: BattleCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const cardTexture = useTexture(`/images/pokemon-cards/${dexId}.png`);
  const backTexture = useTexture('/Selected=CARD_back.svg');

  // 목표 rotation 저장 (hover tilt용)
  const targetRotX = useRef(rotation[0]);
  const targetRotY = useRef(rotation[1]);

  useFrame((state) => {
    if (!meshRef.current) return;

    if (hovered) {
      // 마우스 위치 기반 틸트
      const { x, y } = state.pointer;
      targetRotX.current = -y * 0.3;
      targetRotY.current = x * 0.3;
    } else {
      targetRotX.current = rotation[0];
      targetRotY.current = rotation[1];
    }

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotX.current,
      0.1,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY.current,
      0.1,
    );

    // hover 시 살짝 앞으로 올라옴
    const targetZ = hovered ? position[2] + 0.2 : position[2];
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
  });

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: 0x333344 }), // +x
      new THREE.MeshStandardMaterial({ color: 0x333344 }), // -x
      new THREE.MeshStandardMaterial({ color: 0x333344 }), // +y
      new THREE.MeshStandardMaterial({ color: 0x333344 }), // -y
      faceUp
        ? new THREE.MeshStandardMaterial({ map: cardTexture }) // +z (앞면)
        : new THREE.MeshStandardMaterial({ map: backTexture }),
      new THREE.MeshStandardMaterial({ map: backTexture }), // -z (뒷면)
    ],
    [faceUp, cardTexture, backTexture],
  );

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
      {materials.map((mat, i) => (
        <primitive key={i} attach={`material-${i}`} object={mat} />
      ))}
    </mesh>
  );
}
```

- [ ] **Step 2: BattleCanvas.tsx에 테스트용 카드 추가 (임시)**

```typescript
import BattleCard from './card/BattleCard';

// Canvas 안에 임시 추가:
<BattleCard dexId={1} position={[0, 0, 0]} />
```

- [ ] **Step 3: 피처 플래그 r3f로 변경해서 카드 렌더링 확인**

카드가 화면에 표시되고 마우스를 올리면 틸트되는지 확인한다. 확인 후 임시 카드 제거.

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/card/BattleCard.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add BattleCard 3D mesh with texture and hover tilt"
```

---

### Task 11: CardDragController — useDrag + Raycaster 드래그앤드롭

**Files:**

- Create: `src/features/battle/game/r3f/card/CardDragController.tsx`

- [ ] **Step 1: 파일 생성**

```typescript
// src/features/battle/game/r3f/card/CardDragController.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

interface CardDragControllerProps {
  dexId: number;
  initialPosition: [number, number, number];
  /** DropZone 중심 좌표 (월드 스페이스) */
  dropZoneCenter: THREE.Vector3;
  dropZoneSize: { width: number; height: number };
  children: (props: {
    position: [number, number, number];
    isDragging: boolean;
    bind: ReturnType<typeof useDrag>;
  }) => React.ReactNode;
}

export default function CardDragController({
  dexId,
  initialPosition,
  dropZoneCenter,
  dropZoneSize,
  children,
}: CardDragControllerProps) {
  const { camera, gl } = useThree();
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster = useRef(new THREE.Raycaster());

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      const target = new THREE.Vector3();
      const hit = raycaster.current.ray.intersectPlane(dragPlane.current, target);
      return hit ? target : null;
    },
    [camera, gl],
  );

  const isOverDropZone = useCallback(
    (worldPos: THREE.Vector3): boolean => {
      const dx = Math.abs(worldPos.x - dropZoneCenter.x);
      const dy = Math.abs(worldPos.y - dropZoneCenter.y);
      return dx < dropZoneSize.width / 2 && dy < dropZoneSize.height / 2;
    },
    [dropZoneCenter, dropZoneSize],
  );

  const bind = useDrag(
    ({ event, first, last, xy: [cx, cy] }) => {
      event?.stopPropagation();

      if (first) setIsDragging(true);

      const world = screenToWorld(cx, cy);
      if (world) {
        setPosition([world.x, world.y, initialPosition[2] + 0.5]);
      }

      if (last) {
        setIsDragging(false);
        const world2 = screenToWorld(cx, cy);
        if (world2 && isOverDropZone(world2)) {
          useBattleStore.getState().openSkillModal({
            dexId,
            koName: '',
            enName: '',
            types: [],
            hp: 0,
            moves: [],
            flightDuration: 380,
          });
          // 실제 placeCard 로직은 Task 13에서 DropZone과 연결
        } else {
          // 드롭존 밖이면 원위치로
          setPosition(initialPosition);
        }
      }
    },
    { pointer: { capture: false } },
  );

  return <>{children({ position, isDragging, bind })}</>;
}
```

- [ ] **Step 2: 타입체크**

```bash
pnpm typecheck
```

- [ ] **Step 3: 커밋**

```bash
git add src/features/battle/game/r3f/card/CardDragController.tsx
git commit -m "feat(r3f): add CardDragController with useDrag and Raycaster"
```

---

## PHASE 3: 배틀 씬 완성

### Task 12: PlayerDeckZone + EnemyDeckZone — 팬 배치

**Files:**

- Create: `src/features/battle/game/r3f/zones/PlayerDeckZone.tsx`
- Create: `src/features/battle/game/r3f/zones/EnemyDeckZone.tsx`

- [ ] **Step 1: PlayerDeckZone.tsx 생성**

```typescript
// src/features/battle/game/r3f/zones/PlayerDeckZone.tsx
'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import BattleCard from '../card/BattleCard';
import { useBattleStore } from '@/shared/stores/battleStore';

const FAN_RADIUS = 4.0;
const FAN_CY = -6.0;
const MAX_ANGLE_DEG = 40;

function calcFanPos(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, FAN_CY + FAN_RADIUS, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = -MAX_ANGLE_DEG / 2 + step * index - 90;
  const rad = THREE.MathUtils.degToRad(deg);
  return [Math.cos(rad) * FAN_RADIUS, FAN_CY + Math.sin(rad) * FAN_RADIUS, index * 0.01];
}

function calcFanRotation(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, 0, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = -MAX_ANGLE_DEG / 2 + step * index;
  return [0, 0, THREE.MathUtils.degToRad(deg)];
}

export default function PlayerDeckZone() {
  const playerTeam = useBattleStore((state) => state.playerTeam);
  const available = playerTeam.filter((p) => p.status === 'available');

  const cards = useMemo(
    () =>
      available.map((pokemon, i) => ({
        pokemon,
        position: calcFanPos(i, available.length) as [number, number, number],
        rotation: calcFanRotation(i, available.length) as [number, number, number],
      })),
    [available],
  );

  return (
    <>
      {cards.map(({ pokemon, position, rotation }) => (
        <BattleCard
          key={pokemon.dexId}
          dexId={pokemon.dexId}
          position={position}
          rotation={rotation}
          faceUp
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: EnemyDeckZone.tsx 생성**

```typescript
// src/features/battle/game/r3f/zones/EnemyDeckZone.tsx
'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import BattleCard from '../card/BattleCard';
import { useBattleStore } from '@/shared/stores/battleStore';

const FAN_RADIUS = 4.0;
const FAN_CY = 6.0;
const MAX_ANGLE_DEG = 40;

function calcEnemyFanPos(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, FAN_CY - FAN_RADIUS, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = -MAX_ANGLE_DEG / 2 + step * index + 90;
  const rad = THREE.MathUtils.degToRad(deg);
  return [Math.cos(rad) * FAN_RADIUS, FAN_CY + Math.sin(rad) * FAN_RADIUS, index * 0.01];
}

function calcEnemyFanRotation(index: number, total: number): [number, number, number] {
  if (total === 1) return [0, 0, 0];
  const step = MAX_ANGLE_DEG / (total - 1);
  const deg = MAX_ANGLE_DEG / 2 - step * index;
  return [0, 0, THREE.MathUtils.degToRad(deg)];
}

export default function EnemyDeckZone() {
  const enemyTeam = useBattleStore((state) => state.enemyTeam);
  const alive = enemyTeam.filter((p) => !p.fainted);

  const cards = useMemo(
    () =>
      alive.map((pokemon, i) => ({
        pokemon,
        position: calcEnemyFanPos(i, alive.length) as [number, number, number],
        rotation: calcEnemyFanRotation(i, alive.length) as [number, number, number],
      })),
    [alive],
  );

  return (
    <>
      {cards.map(({ pokemon, position, rotation }) => (
        <BattleCard
          key={pokemon.dexId}
          dexId={pokemon.dexId}
          position={position}
          rotation={rotation}
          faceUp={false}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: BattleCanvas.tsx에 존 추가**

```typescript
import PlayerDeckZone from './zones/PlayerDeckZone';
import EnemyDeckZone from './zones/EnemyDeckZone';

// Canvas 안에:
<PlayerDeckZone />
<EnemyDeckZone />
```

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/zones/PlayerDeckZone.tsx \
        src/features/battle/game/r3f/zones/EnemyDeckZone.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add PlayerDeckZone and EnemyDeckZone fan layouts"
```

---

### Task 13: DropZone + placeCard 연결

**Files:**

- Create: `src/features/battle/game/r3f/zones/DropZone.tsx`

- [ ] **Step 1: DropZone.tsx 생성**

```typescript
// src/features/battle/game/r3f/zones/DropZone.tsx
'use client';

import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

const ZONE_W = 1.2;
const ZONE_H = 1.6;

interface DropZoneProps {
  position: [number, number, number];
  side: 'player' | 'enemy';
}

export default function DropZone({ position, side }: DropZoneProps) {
  const [highlighted, setHighlighted] = useState(false);
  const phase = useBattleStore((state) => state.phase);
  const canDrop = phase === 'awaiting_action' && side === 'player';

  return (
    <mesh
      position={position}
      onPointerEnter={() => canDrop && setHighlighted(true)}
      onPointerLeave={() => setHighlighted(false)}
    >
      <planeGeometry args={[ZONE_W, ZONE_H]} />
      <meshStandardMaterial
        color={highlighted ? 0x44aaff : 0x223366}
        transparent
        opacity={highlighted ? 0.35 : 0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// DropZone의 월드 중심과 크기를 외부에 노출 (CardDragController에서 사용)
export const PLAYER_DROP_ZONE = {
  center: new THREE.Vector3(0, -1.2, 0),
  size: { width: ZONE_W, height: ZONE_H },
};

export const ENEMY_DROP_ZONE = {
  center: new THREE.Vector3(0, 1.8, 0),
  size: { width: ZONE_W, height: ZONE_H },
};
```

- [ ] **Step 2: BattleCanvas.tsx에 DropZone 추가**

```typescript
import DropZone from './zones/DropZone';

// Canvas 안에:
<DropZone position={[0, -1.2, 0]} side="player" />
<DropZone position={[0, 1.8, 0]} side="enemy" />
```

- [ ] **Step 3: CardDragController의 onDrop에 battleStore.openSkillModal 호출 연결**

`CardDragController.tsx`에서 드롭 성공 시 실제 SkillModalData를 빌드해 openSkillModal 호출.

`CardDragController.tsx`의 `last` 핸들러 내부 수정:

```typescript
if (world2 && isOverDropZone(world2)) {
  // 실제 pokemon 데이터는 battleStore의 playerTeam에서 가져옴
  const team = useBattleStore.getState().playerTeam;
  const pokemon = team.find((p) => p.dexId === dexId);
  if (pokemon) {
    // Phase 3에서는 여기서 battleStore.placeCard()를 호출
    // 현재는 SkillModal 열기만 트리거 (BattleScene과 호환)
    useBattleStore.getState().selectMove(-1); // placeholder — Phase 3에서 제거
  }
  setPosition(initialPosition);
}
```

Note: 전투 로직은 여전히 BattleScene이 담당. Phase 3에서 R3F가 완전히 담당할 때 이 코드를 교체한다.

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/zones/DropZone.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add DropZone with highlight and battleStore connection"
```

---

### Task 14: HealthBar + Faint 애니메이션

**Files:**

- Create: `src/features/battle/game/r3f/hud/HealthBar.tsx`
- Modify: `src/features/battle/game/r3f/card/BattleCard.tsx`

- [ ] **Step 1: HealthBar.tsx 생성 (drei Html 사용)**

```typescript
// src/features/battle/game/r3f/hud/HealthBar.tsx
'use client';

import { Html } from '@react-three/drei';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  position: [number, number, number];
}

export default function HealthBar({ currentHp, maxHp, position }: HealthBarProps) {
  const ratio = Math.max(0, Math.min(1, currentHp / maxHp));
  const color = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';

  return (
    <Html position={position} center>
      <div style={{ width: 80, pointerEvents: 'none' }}>
        <div style={{ background: '#2d2d44', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${ratio * 100}%`,
              height: '100%',
              background: color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ color: '#fff', fontSize: 9, textAlign: 'center', marginTop: 2, fontFamily: 'Roboto, sans-serif' }}>
          {currentHp} / {maxHp}
        </div>
      </div>
    </Html>
  );
}
```

- [ ] **Step 2: BattleCard.tsx에 faint 애니메이션 추가**

`BattleCard.tsx`에 `fainted` prop 추가:

```typescript
interface BattleCardProps {
  // ... 기존 props
  fainted?: boolean;
}
```

`useFrame` 내부에 faint 처리 추가:

```typescript
// faint 시 카드를 위로 날려보냄
if (fainted) {
  const side = position[1] < 0 ? -1 : 1;
  meshRef.current.position.y += side * 0.05;
  // BoxGeometry는 6개 material 배열 — 전부 fade out
  const mats = Array.isArray(meshRef.current.material) ? meshRef.current.material : [meshRef.current.material];
  mats.forEach((m) => {
    (m as THREE.MeshStandardMaterial).transparent = true;
    (m as THREE.MeshStandardMaterial).opacity = Math.max(0, (m as THREE.MeshStandardMaterial).opacity - 0.02);
  });
}
```

- [ ] **Step 3: PlayerDeckZone.tsx에 HealthBar 추가 (필드 카드)**

필드에 놓인 카드 아래에 HealthBar를 렌더링. (DropZone 위에 놓인 카드의 position을 계산해 전달)

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/hud/HealthBar.tsx \
        src/features/battle/game/r3f/card/BattleCard.tsx
git commit -m "feat(r3f): add HealthBar and faint animation to BattleCard"
```

---

## PHASE 4: 이펙트

### Task 15: CardHologramShader — 전설 카드 홀로그램

**Files:**

- Create: `src/features/battle/game/r3f/card/CardHologramShader.ts`
- Modify: `src/features/battle/game/r3f/card/BattleCard.tsx`

- [ ] **Step 1: CardHologramShader.ts 생성**

```typescript
// src/features/battle/game/r3f/card/CardHologramShader.ts
import * as THREE from 'three';

export function createHologramMaterial(baseTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: baseTexture },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform sampler2D uTexture;
      varying vec2 vUv;
      varying vec3 vNormal;

      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
      }

      void main() {
        vec2 uv = vUv;
        float rainbow = sin(uv.x * 10.0 + uTime * 1.5) * 0.5 + 0.5;
        vec3 holoColor = hsl2rgb(vec3(rainbow, 0.8, 0.6));
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec4 baseColor = texture2D(uTexture, uv);
        gl_FragColor = vec4(mix(baseColor.rgb, holoColor, fresnel * 0.4), baseColor.a);
      }
    `,
    transparent: true,
  });
}
```

- [ ] **Step 2: BattleCard.tsx에 홀로그램 prop 추가**

```typescript
interface BattleCardProps {
  // ... 기존 props
  isLegendary?: boolean;
}
```

`useFrame`에서 uTime 업데이트:

```typescript
useFrame((_, delta) => {
  if (hologramMat.current) {
    hologramMat.current.uniforms.uTime.value += delta;
  }
  // ... 기존 tilt 로직
});
```

전면 material에 홀로그램 조건 분기:

```typescript
const hologramMat = useRef<THREE.ShaderMaterial | null>(null);

// useMemo에서:
const frontMaterial = useMemo(() => {
  if (isLegendary && faceUp) {
    const mat = createHologramMaterial(cardTexture);
    hologramMat.current = mat;
    return mat;
  }
  return new THREE.MeshStandardMaterial({ map: cardTexture });
}, [isLegendary, faceUp, cardTexture]);
```

- [ ] **Step 3: 커밋**

```bash
git add src/features/battle/game/r3f/card/CardHologramShader.ts \
        src/features/battle/game/r3f/card/BattleCard.tsx
git commit -m "feat(r3f): add hologram ShaderMaterial for legendary cards"
```

---

### Task 16: AttackParticles — 타입별 공격 파티클

**Files:**

- Create: `src/features/battle/game/r3f/effects/AttackParticles.tsx`

- [ ] **Step 1: AttackParticles.tsx 생성**

```typescript
// src/features/battle/game/r3f/effects/AttackParticles.tsx
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

interface ParticlePreset {
  color: string;
  count: number;
  spread: number;
}

const ATTACK_PARTICLES: Record<string, ParticlePreset> = {
  fire:     { color: '#FF4500', count: 80, spread: 0.8 },
  water:    { color: '#1E90FF', count: 60, spread: 0.6 },
  electric: { color: '#FFD700', count: 100, spread: 1.2 },
  grass:    { color: '#32CD32', count: 50, spread: 0.5 },
  psychic:  { color: '#FF69B4', count: 70, spread: 1.0 },
  rock:     { color: '#A0522D', count: 55, spread: 0.7 },
  ice:      { color: '#00BFFF', count: 65, spread: 0.8 },
  fighting: { color: '#FF6347', count: 60, spread: 0.6 },
  poison:   { color: '#9400D3', count: 55, spread: 0.6 },
  ground:   { color: '#DAA520', count: 50, spread: 0.7 },
  flying:   { color: '#87CEEB', count: 60, spread: 1.0 },
  bug:      { color: '#6B8E23', count: 50, spread: 0.5 },
  ghost:    { color: '#483D8B', count: 70, spread: 0.9 },
  steel:    { color: '#C0C0C0', count: 55, spread: 0.5 },
  dragon:   { color: '#6A0DAD', count: 90, spread: 1.1 },
  dark:     { color: '#2F4F4F', count: 60, spread: 0.8 },
  fairy:    { color: '#FFB6C1', count: 65, spread: 0.9 },
  normal:   { color: '#D3D3D3', count: 45, spread: 0.5 },
};

const DEFAULT_PRESET: ParticlePreset = { color: '#FFFFFF', count: 50, spread: 0.7 };

function useParticleSystem(preset: ParticlePreset, origin: THREE.Vector3) {
  const count = preset.count;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const velocities = useMemo(() => {
    const v = [];
    for (let i = 0; i < count; i++) {
      v.push(
        (Math.random() - 0.5) * preset.spread * 2,
        (Math.random() - 0.5) * preset.spread * 2,
        (Math.random() - 0.5) * preset.spread,
      );
    }
    return v;
  }, [count, preset.spread]);

  const age = useRef(0);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  useFrame((_, delta) => {
    age.current += delta;
    if (!geoRef.current) return;
    const pos = geoRef.current.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const t = age.current;
      pos.setXYZ(
        i,
        origin.x + (velocities[i * 3]! * t),
        origin.y + (velocities[i * 3 + 1]! * t) - 0.5 * t * t, // gravity
        origin.z + (velocities[i * 3 + 2]! * t),
      );
    }
    pos.needsUpdate = true;
  });

  return { positions, geoRef };
}

export default function AttackParticles() {
  const attackEffect = useBattleStore((state) => state.attackEffect);
  const clearAttackEffect = useBattleStore((state) => state.clearAttackEffect);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!attackEffect) return;
    timerRef.current = setTimeout(() => clearAttackEffect(), 1200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [attackEffect, clearAttackEffect]);

  if (!attackEffect) return null;

  const preset = ATTACK_PARTICLES[attackEffect.pokemonType] ?? DEFAULT_PRESET;
  const origin = new THREE.Vector3(
    attackEffect.attackerSide === 'player' ? -0.5 : 0.5,
    attackEffect.attackerSide === 'player' ? -1.0 : 1.0,
    0.5,
  );

  return <ParticleCloud preset={preset} origin={origin} color={preset.color} />;
}

function ParticleCloud({
  preset,
  origin,
  color,
}: {
  preset: ParticlePreset;
  origin: THREE.Vector3;
  color: string;
}) {
  const { positions, geoRef } = useParticleSystem(preset, origin);

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}
```

- [ ] **Step 2: BattleCanvas.tsx에 추가**

```typescript
import AttackParticles from './effects/AttackParticles';

// Canvas 안에:
<AttackParticles />
```

- [ ] **Step 3: 커밋**

```bash
git add src/features/battle/game/r3f/effects/AttackParticles.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add type-based attack particle system"
```

---

### Task 17: HitEffect + ScreenShake

**Files:**

- Create: `src/features/battle/game/r3f/effects/HitEffect.tsx`
- Create: `src/features/battle/game/r3f/effects/ScreenShake.tsx`

- [ ] **Step 1: HitEffect.tsx 생성**

```typescript
// src/features/battle/game/r3f/effects/HitEffect.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

export default function HitEffect() {
  const attackEffect = useBattleStore((state) => state.attackEffect);
  const meshRef = useRef<THREE.Mesh>(null);
  const age = useRef(0);

  useEffect(() => {
    age.current = 0;
  }, [attackEffect]);

  useFrame((_, delta) => {
    if (!meshRef.current || !attackEffect) return;
    age.current += delta;

    const opacity = Math.max(0, 1 - age.current * 4);
    const scale = 1 + age.current * 3;
    meshRef.current.scale.setScalar(scale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  if (!attackEffect) return null;

  const hitX = attackEffect.attackerSide === 'player' ? 0.5 : -0.5;
  const hitY = attackEffect.attackerSide === 'player' ? 1.8 : -1.2;

  return (
    <mesh ref={meshRef} position={[hitX, hitY, 0.3]}>
      <circleGeometry args={[0.25, 16]} />
      <meshBasicMaterial color={0xffffff} transparent opacity={1} />
    </mesh>
  );
}
```

- [ ] **Step 2: ScreenShake.tsx 생성**

```typescript
// src/features/battle/game/r3f/effects/ScreenShake.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

export default function ScreenShake() {
  const { camera } = useThree();
  const cameraEvent = useBattleStore((state) => state.cameraEvent);
  const clearCameraEvent = useBattleStore((state) => state.clearCameraEvent);
  const shakeRef = useRef({ active: false, age: 0, amplitude: 0 });
  const basePos = useRef(camera.position.clone());

  useEffect(() => {
    if (cameraEvent?.type === 'shake') {
      shakeRef.current = { active: true, age: 0, amplitude: 0.1 };
      clearCameraEvent();
    }
  }, [cameraEvent, clearCameraEvent]);

  useFrame((_, delta) => {
    const s = shakeRef.current;
    if (!s.active) return;

    s.age += delta;
    const decay = Math.max(0, 1 - s.age * 5);
    const offsetX = (Math.random() - 0.5) * s.amplitude * decay;
    const offsetY = (Math.random() - 0.5) * s.amplitude * decay;

    camera.position.x = basePos.current.x + offsetX;
    camera.position.y = basePos.current.y + offsetY;

    if (decay === 0) {
      s.active = false;
      camera.position.copy(basePos.current);
    }
  });

  return null;
}
```

- [ ] **Step 3: BattleCanvas.tsx에 추가**

```typescript
import HitEffect from './effects/HitEffect';
import ScreenShake from './effects/ScreenShake';

// Canvas 안에:
<HitEffect />
<ScreenShake />
```

- [ ] **Step 4: 커밋**

```bash
git add src/features/battle/game/r3f/effects/HitEffect.tsx \
        src/features/battle/game/r3f/effects/ScreenShake.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add HitEffect flash and ScreenShake camera"
```

---

### Task 18: BattleCamera — cameraEvent 연출

**Files:**

- Create: `src/features/battle/game/r3f/camera/BattleCamera.tsx`

- [ ] **Step 1: BattleCamera.tsx 생성**

```typescript
// src/features/battle/game/r3f/camera/BattleCamera.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

const DEFAULT_FOV = 60;
const DEFAULT_POS = new THREE.Vector3(0, 0, 5);

export default function BattleCamera() {
  const { camera } = useThree();
  const cameraEvent = useBattleStore((state) => state.cameraEvent);
  const clearCameraEvent = useBattleStore((state) => state.clearCameraEvent);
  const targetFov = useRef(DEFAULT_FOV);
  const targetPos = useRef(DEFAULT_POS.clone());

  useEffect(() => {
    if (!cameraEvent) return;

    switch (cameraEvent.type) {
      case 'zoom-in':
        targetFov.current = 50;
        break;
      case 'faint-zoom':
        targetFov.current = 45;
        // 서서히 줌아웃
        setTimeout(() => {
          targetFov.current = DEFAULT_FOV;
        }, 1000);
        break;
      case 'win':
        targetPos.current = new THREE.Vector3(0, -1.5, 4);
        break;
      case 'lose':
        targetPos.current = new THREE.Vector3(0, 1.5, 4);
        break;
      default:
        break;
    }
    clearCameraEvent();
  }, [cameraEvent, clearCameraEvent]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov.current, 0.05);
    cam.updateProjectionMatrix();
    cam.position.lerp(targetPos.current, 0.04);
  });

  return null;
}
```

- [ ] **Step 2: BattleCanvas.tsx에서 기본 camera prop 제거 후 BattleCamera로 교체**

```typescript
import BattleCamera from './camera/BattleCamera';

// Canvas에서 camera prop 제거, 대신 내부에:
<BattleCamera />
```

- [ ] **Step 3: 커밋**

```bash
git add src/features/battle/game/r3f/camera/BattleCamera.tsx \
        src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add BattleCamera with cameraEvent-driven fov and position animations"
```

---

### Task 19: Postprocessing — Bloom + Glow

**Files:**

- Modify: `src/features/battle/game/r3f/BattleCanvas.tsx`

- [ ] **Step 1: BattleCanvas.tsx에 EffectComposer 추가**

```typescript
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Canvas 안에:
<EffectComposer>
  <Bloom
    intensity={0.4}
    luminanceThreshold={0.7}
    luminanceSmoothing={0.3}
    mipmapBlur
  />
</EffectComposer>
```

- [ ] **Step 2: 피처 플래그를 r3f로 변경해서 블룸 효과 시각 확인**

개발 서버에서 R3F 씬의 빛나는 효과가 보이는지 확인한다.

- [ ] **Step 3: 커밋**

```bash
git add src/features/battle/game/r3f/BattleCanvas.tsx
git commit -m "feat(r3f): add Bloom postprocessing via @react-three/postprocessing"
```

---

## PHASE 5: Phaser 제거 + QA

### Task 20: BattleCanvas.tsx 최종 조립 확인

**Files:**

- Modify: `src/features/battle/game/r3f/BattleCanvas.tsx`

- [ ] **Step 1: BattleCanvas.tsx 최종 형태 확인**

모든 컴포넌트가 포함된 최종 BattleCanvas:

```typescript
// src/features/battle/game/r3f/BattleCanvas.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import BattleField from './BattleField';
import PlayerDeckZone from './zones/PlayerDeckZone';
import EnemyDeckZone from './zones/EnemyDeckZone';
import DropZone from './zones/DropZone';
import AttackParticles from './effects/AttackParticles';
import HitEffect from './effects/HitEffect';
import ScreenShake from './effects/ScreenShake';
import BattleCamera from './camera/BattleCamera';

export default function BattleCanvas() {
  return (
    <Canvas className="absolute inset-0" gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <BattleCamera />
        <ScreenShake />
        <BattleField />
        <PlayerDeckZone />
        <EnemyDeckZone />
        <DropZone position={[0, -1.2, 0]} side="player" />
        <DropZone position={[0, 1.8, 0]} side="enemy" />
        <AttackParticles />
        <HitEffect />
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 2: 피처 플래그 r3f로 변경 후 전체 배틀 플로우 테스트**

1. `/battle` 접속
2. 카드 6장이 팬 형태로 표시
3. 카드를 드래그해 드롭존에 배치
4. SkillModal이 열림
5. 기술 선택 후 공격 파티클 확인
6. AI 턴에 카메라 쉐이크 확인
7. 전설 카드에 홀로그램 효과 확인

---

### Task 21: Phaser 완전 제거

**Files:**

- Delete: `src/features/battle/game/scenes/` (BattleScene.ts, PreloadScene.ts)
- Delete: `src/features/battle/game/config.ts`
- Delete: `src/features/battle/game/battle-scene-constants.ts`
- Delete: `src/features/battle/game/battle-scene-types.ts`
- Modify: `package.json` (phaser 제거)
- Modify: `src/features/battle/_components/BattleScreen.tsx` (Phaser 관련 코드 제거)

Note: `battle-damage.ts`, `battle-log.ts`, `data-source.ts`, `player-deck-storage.ts`, `tower-progress-storage.ts` 는 R3F 씬에서도 사용하므로 **유지**한다.

- [ ] **Step 1: Phaser 제거 전 피처 플래그 확인**

`.env.local`에서 `NEXT_PUBLIC_BATTLE_ENGINE=r3f` 인지 확인. Phase 5에서는 영구 r3f로 전환.

- [ ] **Step 2: BattleScreen.tsx에서 Phaser 관련 코드 제거**

다음 코드 블록 제거:

- `import type { Game } from 'phaser';`
- `gameRef`, `containerRef`, `hasShownDeckAlertRef` ref들
- Phaser lazy import + `new Phaser.Game(...)` useEffect
- `phaser-container` div

피처 플래그 분기 단순화 (Phaser 조건부 제거):

```typescript
// 피처 플래그 제거, R3F만 렌더링
return (
  <div className="fixed inset-0 overflow-hidden">
    <BattleCanvas />
    {/* HUD 컴포넌트들 ... */}
  </div>
);
```

- [ ] **Step 3: Phaser 씬 파일 삭제**

```bash
rm src/features/battle/game/scenes/BattleScene.ts
rm src/features/battle/game/scenes/PreloadScene.ts
rm -r src/features/battle/game/scenes/
rm src/features/battle/game/config.ts
rm src/features/battle/game/battle-scene-constants.ts
rm src/features/battle/game/battle-scene-types.ts
```

- [ ] **Step 4: package.json에서 phaser 제거**

```bash
pnpm remove phaser
```

- [ ] **Step 5: 타입체크 + 빌드**

```bash
pnpm typecheck
pnpm build
```

Expected: 에러 없음

- [ ] **Step 6: 번들 크기 확인**

빌드 출력에서 `/battle` 페이지의 번들 크기를 확인한다. 목표: Phaser 제거로 ~150KB 이상 감소.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat(battle): complete R3F migration, remove Phaser"
```

---

### Task 22: 최종 QA 체크리스트

- [ ] **배틀 플로우 전체 검증**
  - [ ] 덱 미완성 시 `/mydeck` 리다이렉트
  - [ ] 카드 6장 팬 배치 표시
  - [ ] 카드 드래그 → 드롭존 배치
  - [ ] SkillModal 열림/닫힘
  - [ ] 기술 선택 → 공격 파티클
  - [ ] 적 카드 HP 감소 및 HealthBar 업데이트
  - [ ] 포켓몬 기절 애니메이션
  - [ ] 배틀 승/패 → 라우팅
  - [ ] BGM 정상 재생

- [ ] **HUD 기능 검증**
  - [ ] BattleTopBar: 층수 표시, 홈으로 버튼 → confirmQuitOpen
  - [ ] BattleBottomHUD: 포켓몬 상태 버튼 → pokemonStatusOpen
  - [ ] BattleLog: 배틀 로그 최신 6개 표시
  - [ ] 라이프 표시

- [ ] **모바일 성능 확인**

  모바일 에뮬레이터 또는 실기기에서 FPS 확인. 30 FPS 미달 시 EffectComposer Bloom의 `intensity`를 `0.2`로 줄이거나 조건부 비활성화.

- [ ] **타입체크 최종**

```bash
pnpm typecheck
```

- [ ] **최종 커밋**

```bash
git add -A
git commit -m "chore(battle): R3F migration complete — QA verified"
```
