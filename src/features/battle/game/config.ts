// Phaser 게임 기본 설정

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const CARD_W = 140;
export const CARD_H = 200;
export const CARD_TEXTURE_SCALE = 3;
export const CARD_TEXTURE_W = CARD_W * CARD_TEXTURE_SCALE;
export const CARD_TEXTURE_H = CARD_H * CARD_TEXTURE_SCALE;
export const CARD_RENDER_SCALE = 2 / CARD_TEXTURE_SCALE;

export const phaserConfig = {
  type: 0, // Phaser.AUTO
  transparent: true,
  render: {
    transparent: true,
    clearBeforeRender: true,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
};
