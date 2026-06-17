// 미션 조회 API

import type { DailyMissionView } from '@/entities/mission/model/types';
import { getKstDayRange } from '@/features/mission/lib/missionDate';
import { pokemonTypeLabels, type PokemonTypeId } from '@/shared/constants/pokemonTypes';
import { createClient } from '@/shared/lib/supabase/server';

type DailyMissionProgress = {
  id: string;
  user_id: string;
  mission_date: string;
  target_type: string;
  attendance_claimed: boolean;
  battle_win_claimed: boolean;
  type_win_claimed: boolean;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function getPokemonTypeLabel(typeId: string) {
  if (typeId in pokemonTypeLabels) {
    return pokemonTypeLabels[typeId as PokemonTypeId];
  }

  return typeId;
}

function logSupabaseError(message: string, error: SupabaseErrorLike) {
  console.error(message, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
}

export async function getDailyMissions(): Promise<DailyMissionView[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { startIso, endIso } = getKstDayRange();

  const { data: progress, error } = await supabase.rpc('ensure_daily_mission_progress');

  if (error) {
    logSupabaseError('Failed to ensure daily mission progress:', error);
    return [];
  }

  if (!progress) return [];

  const missionProgress = progress as DailyMissionProgress;

  const { count: todayWins, error: todayWinsError } = await supabase
    .from('battle_histories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('won', true)
    .gte('fought_at', startIso)
    .lt('fought_at', endIso);

  if (todayWinsError) {
    logSupabaseError('Failed to count daily battle wins:', todayWinsError);
  }

  const { count: typeWins, error: typeWinsError } = await supabase
    .from('battle_histories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('won', true)
    .contains('player_deck_type_ids', [missionProgress.target_type])
    .gte('fought_at', startIso)
    .lt('fought_at', endIso);

  if (typeWinsError) {
    logSupabaseError('Failed to count daily type wins:', typeWinsError);
  }

  const winCount = todayWins ?? 0;
  const typeWinCount = typeWins ?? 0;
  const targetTypeLabel = getPokemonTypeLabel(missionProgress.target_type);

  return [
    {
      id: 'attendance',
      title: '출석 체크',
      progressText: '1/1',
      rewardText: '카드팩 x 1',
      progressRate: 100,
      isCompleted: missionProgress.attendance_claimed,
    },
    {
      id: 'battle-win',
      title: '배틀 3회 승리',
      progressText: `${Math.min(winCount, 3)}/3`,
      rewardText: '카드팩 x 3',
      progressRate: Math.min(winCount / 3, 1) * 100,
      isCompleted: missionProgress.battle_win_claimed,
    },
    {
      id: 'type-win',
      title: `${targetTypeLabel} 타입 포함 덱으로 승리`,
      progressText: '',
      rewardText: '카드팩 x 1',
      progressRate: typeWinCount > 0 ? 100 : 0,
      isCompleted: missionProgress.type_win_claimed,
    },
  ];
}
