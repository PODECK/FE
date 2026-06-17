// 특정 타입 미션 및 3승 미션 작동을 위한 배틀 결과 저장

'use server';

import { createClient } from '@/shared/lib/supabase/server';

type SaveBattleResultInput = {
  floor: number;
  won: boolean;
  turnCount: number;
  playerDeckDexIds: number[];
  playerDeckTypeIds: string[];
};

export async function saveBattleResult(input: SaveBattleResultInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: '로그인이 필요합니다.' };
  }

  const { error } = await supabase.from('battle_histories').insert({
    user_id: user.id,
    floor: input.floor,
    won: input.won,
    turn_count: input.turnCount,
    player_deck_dex_ids: input.playerDeckDexIds,
    player_deck_type_ids: [...new Set(input.playerDeckTypeIds)],
    fought_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, message: '배틀 결과 저장에 실패했습니다.' };
  }

  return { ok: true };
}
