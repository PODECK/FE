'use server';

import { revalidatePath } from 'next/cache';

import type { DailyMissionId } from '@/entities/mission/model/types';
import { createClient } from '@/shared/lib/supabase/server';

const DAILY_MISSION_IDS = ['attendance', 'battle-win', 'type-win'] as const;

function isDailyMissionId(value: unknown): value is DailyMissionId {
  return typeof value === 'string' && DAILY_MISSION_IDS.includes(value as DailyMissionId);
}

export async function claimDailyMissionReward(formData: FormData): Promise<void> {
  const missionId = formData.get('missionId');

  if (!isDailyMissionId(missionId)) {
    return;
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc('claim_daily_mission_reward', {
    p_mission_id: missionId,
  });

  if (error) {
    console.error('Failed to claim daily mission reward:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return;
  }

  revalidatePath('/home');
}
