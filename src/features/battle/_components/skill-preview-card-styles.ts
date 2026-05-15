// 스킬 모달 포켓몬 카드의 레이아웃과 스타일 계산을 담당한다.

import { CARD_H, CARD_W, SX, SY } from './skill-modal-constants';

import type { TypeGradient } from '@/shared/constants/type-colors';
import type { CSSProperties } from 'react';

export function createPreviewShellStyle(isVisible: boolean, isClosing: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: CARD_W,
    height: CARD_H,
    perspective: 700,
    opacity: isClosing ? 0 : isVisible ? 1 : 0,
    transition: 'opacity 250ms ease',
  };
}

export function createCardFrameStyle(gradient: TypeGradient, isVisible: boolean): CSSProperties {
  return {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12 * SX,
    overflow: 'hidden',
    background: `linear-gradient(180deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    boxShadow: '12px 20px 48px rgba(0,0,0,0.8), -4px 0 16px rgba(0,0,0,0.3)',
    transformOrigin: '0% 50%',
    transform: isVisible ? 'rotateY(-10deg)' : 'rotateY(0deg)',
    transition: 'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
}

export function createTypeListStyle(typeCount: number): CSSProperties {
  return {
    position: 'absolute',
    top: 207 * SY,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: typeCount === 1 ? 'center' : 'flex-start',
    paddingLeft: typeCount === 1 ? 0 : 23 * SX,
    gap: 5 * SX,
  };
}

export function createMoveRowStyle(rowY: number): CSSProperties {
  return {
    ...cardMoveRowStyle,
    top: rowY * SY,
  };
}

export function createTypeBadgeStyle(background: string): CSSProperties {
  const pillH = 22 * SY;

  return {
    width: 100 * SX,
    height: pillH,
    borderRadius: pillH / 2,
    background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export const typeBadgeIconSize = 22 * SY * 0.75;

export const decorationImageStyle: CSSProperties = {
  position: 'absolute',
  left: 78 * SX,
  top: -24 * SY,
  pointerEvents: 'none',
};

export const centerCircleStyle: CSSProperties = {
  position: 'absolute',
  width: 411 * SX,
  height: 319 * SY,
  left: (121.5 - 205.5) * SX,
  top: (306.5 - 159.5) * SY,
  background: 'white',
  borderRadius: '50%',
};

export const pokemonImageStyle: CSSProperties = {
  position: 'absolute',
  left: 50 * SX,
  top: 60 * SY,
  objectFit: 'contain',
};

export const cardNumberStyle: CSSProperties = {
  position: 'absolute',
  left: 23 * SX,
  top: 12 * SY,
  fontSize: 14 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
};

export const hpStyle: CSSProperties = {
  position: 'absolute',
  right: (255 - 230) * SX,
  top: 17 * SY,
  fontSize: 14 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
};

export const koNameStyle: CSSProperties = {
  position: 'absolute',
  left: 23 * SX,
  top: 39 * SY,
  fontSize: 24 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
  lineHeight: 1,
};

export const enNameStyle: CSSProperties = {
  position: 'absolute',
  left: 25 * SX,
  top: 63 * SY,
  fontSize: 13 * SY,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  fontFamily: 'Roboto, sans-serif',
};

export const moveDotStyle: CSSProperties = {
  width: 10 * SX,
  height: 10 * SX,
  borderRadius: '50%',
  marginLeft: 10 * SX,
  flexShrink: 0,
};

export const mutedMoveDotStyle: CSSProperties = {
  ...moveDotStyle,
  background: '#d9d9d9',
  marginLeft: 5 * SX,
};

export const cardMoveNameStyle: CSSProperties = {
  marginLeft: 10 * SX,
  fontSize: 12 * SY,
  fontWeight: 700,
  color: 'var(--color-base-0)',
  fontFamily: 'Roboto, sans-serif',
};

const cardMoveRowStyle: CSSProperties = {
  position: 'absolute',
  left: 23 * SX,
  width: 205 * SX,
  height: 20 * SY,
  borderRadius: 10 * SY,
  background: 'rgba(0,0,0,0.07)',
  display: 'flex',
  alignItems: 'center',
};
