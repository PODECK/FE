// Phaser 게임 기본 설정

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const CARD_W = 140;
export const CARD_H = 200;

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
