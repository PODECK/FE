'use server';

import { nicknameSchema } from '@/app/(main)/(start)/_schemas/nicknameSchema';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveNickname(nickname: string) {
  const parsed = nicknameSchema.safeParse(nickname);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? '닉네임을 확인해주세요',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: '로그인이 필요합니다',
    };
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    nickname: parsed.data,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  });

  if (profileError) {
    return {
      ok: false,
      message: profileError.code === '23505' ? '이미 사용 중인 닉네임입니다' : '닉네임 저장에 실패했습니다',
    };
  }

  // 최초 생성 시 기본 트레이너 상태 준비
  const { error: statsError } = await supabase.from('trainer_stats').upsert(
    {
      user_id: user.id,
      card_pack_count: 1,
      wins: 0,
      loses: 0,
      current_floor: 1,
    },
    { onConflict: 'user_id' },
  );

  if (statsError) {
    console.error('trainer_stats upsert error:', statsError);

    return {
      ok: false,
      message: '트레이너 상태 생성에 실패했습니다.',
    };
  }

  revalidatePath('/home');

  return {
    ok: true,
    message: '닉네임이 정상적으로 저장되었습니다',
  };
}

export async function selectStarterPokemons(dexIds: number[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: '로그인이 필요합니다',
    };
  }

  const uniqueDexIds = [...new Set(dexIds)];

  if (uniqueDexIds.length !== 3) {
    return {
      ok: false,
      message: '스타팅 포켓몬은 3마리를 선택해야합니다',
    };
  }

  const { count } = await supabase
    .from('trainer_pokemons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count && count > 0) {
    return {
      ok: false,
      message: '이미 스타팅 포켓몬을 선택하셨습니다',
    };
  }

  const { error } = await supabase.from('trainer_pokemons').insert(
    uniqueDexIds.map((dexIds) => ({
      user_id: user.id,
      dex_id: dexIds,
    })),
  );

  if (error) {
    return {
      ok: false,
      message: '스타팅 포켓몬 저장에 실패했습니다',
    };
  }

  revalidatePath('/home');
  revalidatePath('/mydeck');
  revalidatePath('/pokedex');

  return {
    ok: true,
    message: '스타팅 포켓몬을 선택했습니다.',
  };
}
