// BattleScene의 카드 배치, 필드 효과, 애니메이션 기준값

import { CARD_W, CARD_H, GAME_WIDTH, GAME_HEIGHT } from './config';

export const AI_CARD_COUNT = 6;
export const AI_CARD_SCALE_X = CARD_W / 271;
export const AI_CARD_SCALE_Y = CARD_H / 371;

export const ANIM = {
  cardFly: 400,
  hover: 220,
  drag: 160,
  aiThink: 1500,
  opponentPlace: 560,
  return: 300,
  rearrange: 180,
  breathe: 2000,
} as const;

export const EASE = {
  fly: 'Cubic.easeOut',
  hover: 'Back.easeOut',
  return: 'Back.easeOut',
  rearrange: 'Sine.easeInOut',
} as const;

export const SCALE = { normal: 0.5, hover: 1.0, drag: 0.625 } as const;
export const FAN_CFG = { anglePerCard: 8, maxAngle: 60 } as const;
export const LERP = 0.08;

export const ZONE_CFG = {
  width: CARD_W * 2.0,
  height: CARD_H * 2.0,
  cardScale: 0.85,
  cardScaleY: 0.95,
  cardOffsetY: -5,
  gap: 30,
  opponentOffset: 80,
  playerOffset: 50,
  opponentCardScale: 0.7,
  opponentCardScaleY: 0.95,
  opponentCardOffsetY: 5,
} as const;

export const HEALTH_BAR_H_BASE = 8;
export const HEALTH_BAR_GAP_BASE = 10;

export const HIT_MOTION_THRESHOLDS = { strong: 5, normal: 15 } as const;

export const HIT_MOTION = {
  basic: {
    rushRatio: 0.72,
    liftScale: 1.04,
    liftMs: 90,
    rushMs: 180,
    returnMs: 250,
    shake: 8,
    shakeRepeats: 1,
    shakeDurationMs: 50,
    flashMult: 0.18,
    flashAlpha: 0.2,
    flashEndScale: 1.35,
  },
  normal: {
    rushRatio: 0.84,
    liftScale: 1.07,
    liftMs: 110,
    rushMs: 200,
    returnMs: 280,
    shake: 15,
    shakeRepeats: 2,
    shakeDurationMs: 55,
    flashMult: 0.26,
    flashAlpha: 0.25,
    flashEndScale: 1.55,
  },
  strong: {
    rushRatio: 0.94,
    liftScale: 1.12,
    liftMs: 130,
    rushMs: 220,
    returnMs: 320,
    shake: 26,
    shakeRepeats: 3,
    shakeDurationMs: 60,
    flashMult: 0.34,
    flashAlpha: 0.32,
    flashEndScale: 1.85,
  },
} as const;

export const FIELD_CRYSTAL_GLOWS = [
  { x: 0.108, y: 0.765, width: 0.09, height: 0.16, delay: 0 },
  { x: 0.89, y: 0.765, width: 0.09, height: 0.16, delay: 520 },
] as const;

export const PLAYER_LEVEL = 5;

export const REF_W = GAME_WIDTH;
export const REF_H = GAME_HEIGHT;

export const LIFT_MS_AFTER_FAINT = 360;
