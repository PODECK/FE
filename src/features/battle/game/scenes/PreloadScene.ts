// 배틀 화면 이미지와 데이터 사전 로드 Scene

import Phaser from 'phaser';
import { CARD_W, CARD_H } from '../config';

const STARTER_DEX_IDS = [1, 2, 3, 4, 5, 6];

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.json('pokemon-data', '/api/data/pokemon.json');
    this.load.json('moves-data', '/api/data/moves.json');
    this.load.json('pokemon-moves-data', '/api/data/pokemon-moves.json');
    this.load.image('battle-field', '/images/battle/trainer-tower-field.png');

    STARTER_DEX_IDS.forEach((dexId) => {
      this.load.image(`card-${dexId}`, `/images/pokemon-cards/${dexId}.png`);
    });

    this.load.image('aiCardBack', '/Selected=CARD_back.svg');
  }

  create() {
    this.createCardBack();
    this.scene.start('BattleScene');
  }

  // 기본 카드 뒷면 텍스처가 없을 때 사용하는 안전한 fallback
  private createCardBack() {
    const s = 2;
    const g = this.add.graphics();
    g.fillStyle(0x0d1433);
    g.fillRoundedRect(0, 0, CARD_W * s, CARD_H * s, 10 * s);
    g.lineStyle(2 * s, 0x4444aa);
    g.strokeRoundedRect(s, s, (CARD_W - 2) * s, (CARD_H - 2) * s, 10 * s);
    g.lineStyle(s, 0x4444aa, 0.4);
    g.strokeRect(12 * s, 12 * s, (CARD_W - 24) * s, (CARD_H - 24) * s);
    g.generateTexture('cardBack', CARD_W * s, CARD_H * s);
    g.destroy();
  }
}
