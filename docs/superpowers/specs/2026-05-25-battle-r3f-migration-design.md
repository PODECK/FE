# PODECK 배틀 페이지 R3F 전환 설계서

**날짜:** 2026-05-25  
**상태:** 승인 완료  
**접근 방식:** Approach B — State Machine First

---

## 1. 목적

Phaser 4 기반 배틀 캔버스를 React Three Fiber(R3F)로 전환해 카드 연출 퀄리티를 높이고, Phaser↔React 간 CustomEvent 브릿지(12개)를 제거해 아키텍처를 단순화한다.

---

## 2. 아키텍처 결정

### 2-1. 접근 방식: State Machine First

`shared/types/battle.ts`에 이미 설계된 Zod 기반 `BattleState` 스키마를 Zustand 스토어로 활성화한다. CustomEvent 브릿지를 먼저 제거한 뒤 R3F 씬이 스토어를 구독하는 순서로 진행한다.

**이유:** 스토어가 먼저 안정화되면 R3F 렌더링이 순수 "뷰"로 붙는다. Phaser와 R3F가 같은 스토어를 바라보므로 피처 플래그 토글이 자연스럽다.

### 2-2. BattleStore

`shared/stores/battleStore.ts` — Zustand + `BattleState` Zod 스키마 기반.

```
BattleStore
├── state: BattleState
│   ├── phase: init | setup | awaiting_action | attack_resolving |
│   │          swap_resolving | post_turn | awaiting_swap | ended
│   ├── player: Side  (team, activeIndex, pendingAction)
│   ├── enemy: Side
│   ├── turn: number
│   ├── log: TurnLogEntry[]
│   ├── winner: 'player' | 'enemy' | null
│   └── floor: number
│
├── R3F 전용 파생 상태
│   ├── attackEffect: AttackEffect | null   ← 파티클 트리거
│   └── cameraEvent: CameraEvent | null     ← 카메라 연출 트리거
│
├── UI 플래그 (HUD 모달 상태 — CustomEvent 브릿지 제거 후 스토어로 관리)
│   ├── pokemonStatusOpen: boolean
│   ├── confirmQuitOpen: boolean
│   ├── skillModalOpen: boolean
│   ├── skillModalData: SkillModalData | null
│   └── deckInvalid: boolean
│
└── 액션 (CustomEvent 12개 대체)
    ├── dispatch(event: BattleEvent)   ← 단일 진입점 (phase guard 포함)
    ├── placeCard(dexId)               ← battle:zone-card-click 대체
    ├── selectMove(moveIndex)          ← battle:move-selected 대체
    ├── endPlayerTurn()                ← battle:turn-ended 대체
    └── endBattle(winner)              ← battle:ended 대체
```

### 2-3. 피처 플래그

환경 변수: `NEXT_PUBLIC_BATTLE_ENGINE=r3f`

```tsx
// BattleScreen.tsx
const useR3F = process.env.NEXT_PUBLIC_BATTLE_ENGINE === 'r3f';
return useR3F ? <BattleCanvas /> : <div ref={containerRef} />;
```

로컬 `.env.local`에서 제어. 프로덕션 기본값은 Phaser.  
Phaser와 R3F 모두 동일한 `battleStore`를 구독하므로 토글 시 스토어 재사용.

### 2-4. 파일 구조

```
battle/game/r3f/
├── BattleCanvas.tsx
├── BattleField.tsx
├── zones/
│   ├── PlayerDeckZone.tsx
│   ├── EnemyDeckZone.tsx
│   └── DropZone.tsx
├── card/
│   ├── BattleCard.tsx
│   ├── CardHologramShader.ts
│   └── CardDragController.ts
├── effects/
│   ├── AttackParticles.tsx
│   ├── HitEffect.tsx
│   └── ScreenShake.tsx
└── camera/
    └── BattleCamera.tsx

shared/stores/battleStore.ts
```

---

## 3. Phase 계획

| Phase | 작업                                                                                                                                                     | 기간 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1     | R3F 환경 설치 + BattleStore 구축 + 기존 BattleScene.ts가 CustomEvent 대신 battleStore.dispatch()를 호출하도록 전환 + HUD 컴포넌트를 스토어 구독으로 전환 | 2일  |
| 2     | BattleCard 메시 + useTexture + 카드 틸트 인터랙션 + Raycaster 드래그앤드롭                                                                               | 3일  |
| 3     | 배틀 씬 완성 (Zone, HealthBar, 기절 애니메이션, AI 연결)                                                                                                 | 2일  |
| 4     | 이펙트 (홀로그램 쉐이더, 타입별 파티클, 카메라 연출, postprocessing 블룸)                                                                                | 3일  |
| 5     | Phaser 완전 제거 + 번들 최적화 + 모바일 성능 확인 + QA                                                                                                   | 2일  |

**총 예상: 12일**

---

## 4. 핵심 구현 상세

### 4-1. BattleCard 메시

```tsx
<mesh geometry={new BoxGeometry(1.4, 2.0, 0.02)}>
  <meshStandardMaterial attach="material-0" map={cardTexture} />
  <meshStandardMaterial attach="material-1" map={backTexture} />
  {isLegendary && <HologramShaderMaterial uTime={clock.elapsedTime} />}
</mesh>
```

- 앞면: `/images/pokemon-cards/{dexId}.png` — `useTexture`로 로드
- 뒷면: `/Selected=CARD_back.svg`
- 희귀도 판단: `pokemon.isLegendary || pokemon.isMythical` → 홀로그램 쉐이더 적용

### 4-2. 홀로그램 쉐이더

```glsl
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  vec2 uv = vUv;
  float rainbow = sin(uv.x * 10.0 + uTime) * 0.5 + 0.5;
  vec3 holoColor = hsl2rgb(vec3(rainbow, 0.8, 0.6));
  float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
  vec4 baseColor = texture2D(uTexture, uv);
  gl_FragColor = vec4(mix(baseColor.rgb, holoColor, fresnel * 0.4), baseColor.a);
}
```

전설/준전설 카드에만 적용.

### 4-3. 드래그앤드롭

`@use-gesture/react`의 `useDrag` + Three.js Raycaster:

```
onDragStart → 카드 z축 위로 올림
onDrag      → Raycaster plane intersection으로 3D 좌표 추적
onDragEnd   → DropZone AABB 충돌 판정 → battleStore.placeCard(dexId)
```

### 4-4. 공격 파티클

타입별 `ATTACK_PARTICLES` 프리셋 정의. `attackEffect` 스토어 상태를 `AttackParticles` 컴포넌트가 구독해 트리거.

```typescript
const ATTACK_PARTICLES: Record<PokemonType, ParticlePreset> = {
  fire: { color: '#FF4500', count: 80, spread: 0.8 },
  water: { color: '#1E90FF', count: 60, spread: 0.6 },
  electric: { color: '#FFD700', count: 100, spread: 1.2 },
  grass: { color: '#32CD32', count: 50, spread: 0.5 },
  psychic: { color: '#FF69B4', count: 70, spread: 1.0 },
};
```

### 4-5. 카메라 연출

`<PerspectiveCamera>`를 `useRef`로 참조, `useFrame`에서 lerp:

```
turn:start        → fov 60 → 50 (줌인)
attack:hit        → 카메라 쉐이크 (0.2s)
pokemon:faint     → 줌인 후 슬로우 줌아웃
battle:win        → 플레이어 덱 쪽 이동
battle:lose       → 상대 덱 쪽 이동
```

### 4-6. 배틀 이벤트 → 스토어 액션 매핑

| 기존 CustomEvent                   | 방향         | 대체 방식                              |
| ---------------------------------- | ------------ | -------------------------------------- |
| `battle:turn-phase`                | Phaser→React | `store.state.phase` 구독               |
| `battle:ai-deck-status`            | Phaser→React | `store.state.enemy.team` 구독          |
| `battle:log`                       | Phaser→React | `store.state.log` 구독                 |
| `battle:zone-card-click`           | Phaser→React | `store.placeCard(dexId)`               |
| `battle:pokemon-status`            | Phaser→React | `store.pokemonStatusOpen` 플래그       |
| `battle:confirm-quit`              | Phaser→React | `store.confirmQuitOpen` 플래그         |
| `battle:pokemon-fainted`           | Phaser→React | `store.state.player/enemy.team` 구독   |
| `battle:player-pokemon-hp-changed` | Phaser→React | `store.state.player.team[i].currentHp` |
| `battle:ended`                     | Phaser→React | `store.state.winner` 구독              |
| `battle:player-deck-invalid`       | Phaser→React | `store.deckInvalid` 플래그             |
| `battle:move-selected`             | React→Phaser | `store.selectMove(moveIndex)`          |
| `battle:turn-ended`                | React→Phaser | `store.endPlayerTurn()`                |
| `battle:modal-close`               | React→Phaser | `store.skillModalOpen` 플래그          |

---

## 5. 유지 불변 항목

```
shared/temp-ai/           ← AI 덱 빌더, 기술 선택 로직 — 코드 변경 없음
shared/config/tower-floors  ← 층 설정 — 변경 없음
shared/lib/bgm.ts           ← 사운드 — 변경 없음
shared/hooks/useBgm         ← 변경 없음
_components/BattleTopBar    ← HUD — props 소스만 스토어로 전환
_components/BattleBottomHUD ← HUD — props 소스만 스토어로 전환
_components/SkillModal      ← 스토어 구독으로 전환
_components/PokemonStateModal
_components/QuitConfirmModal (현재 BattleScreen.tsx 인라인)
hooks/useTowerProgress
```

---

## 6. 의존성 추가

```json
{
  "@react-three/fiber": "^8",
  "@react-three/drei": "^9",
  "@react-three/postprocessing": "^2",
  "@use-gesture/react": "^10",
  "three": "^0.162",
  "@types/three": "^0.162"
}
```

`leva`는 dev only, 필요 시 추가. `phaser`는 Phase 5에서 제거.

---

## 7. 리스크 및 대응

| 리스크                                                    | 대응                                        |
| --------------------------------------------------------- | ------------------------------------------- |
| BattleState Zod 스키마와 현재 Phaser 로직 간 phase 불일치 | Phase 1에서 매핑 테이블 작성 후 점진적 이관 |
| 모바일 WebGL 성능                                         | 이펙트 퀄리티 레벨 분기 (low/high)          |
| 드래그앤드롭 구현 복잡도                                  | `@use-gesture/react` 활용                   |
| 개발 중 배틀 불가 기간                                    | 피처 플래그로 Phaser 유지                   |
| Three.js 학습 곡선                                        | drei 유틸 컴포넌트로 복잡도 낮춤            |
