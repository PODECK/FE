// 배틀 기술 모달의 카드 비율과 타입 배지 색상
export const CARD_W = 300;
export const CARD_H = Math.round((CARD_W * 355) / 255);
export const SX = CARD_W / 255;
export const SY = CARD_H / 355;

export const typeBadgeColors: Record<string, string> = {
  normal: '#9DA2A4',
  fire: '#FF6C31',
  water: '#4590F0',
  electric: '#F0D030',
  grass: '#42BF24',
  ice: '#74CEC0',
  fighting: '#C03028',
  poison: '#994DCF',
  ground: '#E0C068',
  flying: '#89B1F5',
  psychic: '#FF519B',
  bug: '#90C127',
  rock: '#B8A038',
  ghost: '#735898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
};
