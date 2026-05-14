// BattleScene에서 사용하는 Phaser 표시 객체와 전투 흐름 타입

import type Phaser from 'phaser';

export interface CardData {
  id: string;
  texture: string;
  name: string;
}

export interface FanPos {
  x: number;
  y: number;
  angle: number;
}

export interface ZoneHealthBar {
  g: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  maxHp: number;
  currentHp: number;
}

export type TurnPhase = 'setup' | 'player' | 'ai' | 'ended';
export type HitMotionLevel = 'basic' | 'normal' | 'strong';
