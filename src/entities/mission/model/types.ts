// 미션 타입 정의

export type DailyMissionId = 'attendance' | 'battle-win' | 'type-win';

export type DailyMissionView = {
  id: DailyMissionId;
  title: string;
  progressText: string;
  rewardText: string;
  progressRate: number;
  isCompleted?: boolean;
};
