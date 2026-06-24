'use server';

import { revalidatePath } from 'next/cache';

import type { DailyMissionId } from '@/entities/mission/model/types';
import { createClient } from '@/shared/lib/supabase/server';

const DAILY_MISSION_IDS = ['attendance', 'battle-win', 'type-win'] as const;

export type ClaimDailyMissionRewardState = {
  ok: boolean;
  message: string;
};

type ClaimDailyMissionRewardResult = {
  ok?: boolean;
  message?: string;
};

function isDailyMissionId(value: unknown): value is DailyMissionId {
  return typeof value === 'string' && DAILY_MISSION_IDS.includes(value as DailyMissionId);
}

export async function claimDailyMissionReward(
  _previousState: ClaimDailyMissionRewardState,
  formData: FormData,
): Promise<ClaimDailyMissionRewardState> {
  const missionId = formData.get('missionId');

  if (!isDailyMissionId(missionId)) {
    return { ok: false, message: '올바르지 않은 미션입니다.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('claim_daily_mission_reward', {
    p_mission_id: missionId,
  });

  if (error) {
    console.error('Failed to claim daily mission reward:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, message: '보상 수령에 실패했습니다. 다시 시도해주세요.' };
  }

  const result = data as ClaimDailyMissionRewardResult | null;

  if (!result?.ok) {
    return { ok: false, message: result?.message ?? '보상 수령에 실패했습니다. 다시 시도해주세요.' };
  }

  revalidatePath('/home');
  return { ok: true, message: result.message ?? '보상을 수령했습니다.' };
}
