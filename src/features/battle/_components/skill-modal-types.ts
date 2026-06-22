// 배틀 기술 모달에서 공유하는 표시용 타입
export interface MoveInfo {
  koName: string;
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
}

export interface SkillModalData {
  dexId: number;
  koName: string;
  enName: string;
  types: string[];
  hp: number;
  moves: MoveInfo[];
  flightDuration: number;
}
