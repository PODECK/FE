import { z } from 'zod';
import { BattlePokemon } from './pokemon';

/**
 * 포켓몬 배틀의 진행 상태(Phase)를 정의하는 스키마입니다.
 * * @typedef {z.infer<typeof BattlePhase>} BattlePhaseType
 * * @property {'init'} init - 초기 상태. 배틀 데이터가 생성되기 전의 기본 상태.
 * @property {'setup'} setup - 준비 단계. 덱 데이터를 로딩하고 첫 출전 포켓몬을 선출하는 대기 상태.
 * @property {'awaiting_action'} awaiting_action - 플레이어 입력 대기 단계. 공격 또는 교체 등의 행동 선택을 기다림.
 * @property {'attack_resolving'} attack_resolving - 공격 처리 단계. 선택된 기술의 데미지 계산 및 애니메이션 실행 (자동 전이).
 * @property {'swap_resolving'} swap_resolving - 자발적 교체 처리 단계. 플레이어의 선택에 의한 포켓몬 교체 로직 실행 (자동 전이).
 * @property {'post_turn'} post_turn - 턴 종료 정리 단계. 상태 이상 데미지 계산 및 턴 관련 버프/너프 갱신 (자동 전이).
 * @property {'awaiting_swap'} awaiting_swap - 강제 교체 대기 단계. 포켓몬 기절 후 다음 포켓몬을 내보내야 하는 상태.
 * @property {'ended'} ended - 배틀 종료 상태. 승패가 결정되어 결과 화면으로 넘어가기 전 단계.
 */

export const BattlePhase = z.enum([
  'init',
  'setup',
  'awaiting_action',
  'attack_resolving',
  'swap_resolving',
  'post_turn',
  'awaiting_swap',
  'ended',
]);

// 유저가 발생시키는 이벤트
export type UserBattleEvent =
  | { type: 'USER_SELECT_STARTER'; index: number }
  | { type: 'USER_SELECT_MOVE'; moveIndex: number }
  | { type: 'USER_SELECT_SWAP'; index: number } // 자발적 교체
  | { type: 'USER_FORCED_SWAP'; index: number } // 기절 후 강제 교체
  | { type: 'USER_SURRENDER' };

// ai가 발생시키는 이벤트
export type AIBattleEvent =
  | { type: 'AI_RESOLVE_ATTACK' } // 공격 처리
  | { type: 'AI_RESOLVE_SWAP' } // 자발적 교체 처리
  | { type: 'AI_APPLY_POST_TURN' }; // 턴 종료 정리

// 플레이어/AI 행동 선택 타입
export const ActionType = z.enum(['attack', 'swap']);

export const PendingAction = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('attack'),
    moveIndex: z.number().int().min(0).max(3),
  }),
  z.object({
    type: z.literal('swap'),
    targetIndex: z.number().int().min(0).max(3),
  }),
]);

// 플레이어/AI 편
export const Side = z.object({
  team: z.array(BattlePokemon).min(3).max(6),
  activeIndex: z.number().int().min(0).max(5), // 출전중인 포켓몬
  pendingAction: PendingAction.nullable(),
});

// -------------------------------------------------
// 배틀 로그 표시 UI용 (추후 확장)
// -------------------------------------------------
// 배틀 로그 엔트리
export const LogEntryKind = z.enum([
  'move_user', // 기술 사용
  'damage',
  'miss',
  'swap',
  'forced_swap',
  'effectiveness', // 효과 메시지
  'surrender', // 항복
  'battle_start',
  'battle_end',
]);

// 턴 로그 엔트리
export const TurnLogEntry = z.object({
  kind: LogEntryKind,
  turn: z.number().int().min(0), // 현재 턴 번호
  actorName: z.string(), // 행동자
  targetName: z.string(), // 대상
  damage: z.number().int().min(0),
  effectiveness: z.number().optional(),
  message: z.string(), // UI에 표시할 문구
});

// 전체 배틀 상태
export const BattleState = z.object({
  phase: BattlePhase,
  player: Side,
  enemy: Side,
  turn: z.number().int().min(0),
  rngSeed: z.number(),
  log: z.array(TurnLogEntry),
  winner: z.enum(['player', 'enemy']).nullable(),
  floor: z.number().int().min(1),
});

// 배틀 결과
export const BattleResult = z.object({
  winner: z.enum(['player', 'enemy']),
  floor: z.number().int().min(1),
  turnsPlayed: z.number().int(),
  isSurrendered: z.boolean(),
  reward: z
    .object({
      packCount: z.number().int().min(0),
    })
    .nullable(),
});

// Phase 전이 허용 액션 (가드 함수용)
export const ALLOWED_EVENTS_BY_PHASE: Record<BattlePhase, BattleEvent['type'][]> = {
  init: ['USER_SELECT_STARTER'],
  setup: ['USER_SELECT_STARTER'],
  awaiting_action: ['USER_SELECT_MOVE', 'USER_SELECT_SWAP', 'USER_SURRENDER'],
  attack_resolving: ['AI_RESOLVE_ATTACK'],
  swap_resolving: ['AI_RESOLVE_SWAP'],
  post_turn: ['AI_APPLY_POST_TURN'],
  awaiting_swap: ['USER_FORCED_SWAP'],
  ended: [],
};

// infer types
export type BattlePhase = z.infer<typeof BattlePhase>;
export type BattleEvent = UserBattleEvent | AIBattleEvent;
export type ActionType = z.infer<typeof ActionType>;
export type PendingAction = z.infer<typeof PendingAction>;
export type Side = z.infer<typeof Side>;
export type LogEntryKind = z.infer<typeof LogEntryKind>;
export type TurnLogEntry = z.infer<typeof TurnLogEntry>;
export type BattleState = z.infer<typeof BattleState>;
export type BattleResult = z.infer<typeof BattleResult>;
