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

  // 현재 로그인한 Supabase 유저가 Google 계정으로 로그인한 유저인지 확인하고, Google 계정의 고유 식별자(sub)를 꺼내는 코드
  const googleIdentity = user.identities?.find((identity) => identity.provider === 'google');
  const googleSub = googleIdentity?.identity_data?.sub ?? user.user_metadata?.sub;

  if (!googleSub) {
    return {
      ok: false,
      message: 'Google 계정 정보를 확인할 수 없습니다',
    };
  }

  const { error: userError } = await supabase.from('users').upsert({
    id: user.id,
    google_sub: googleSub,
    nickname: parsed.data,
  });

  if (userError) {
    return {
      ok: false,
      message: userError.code === '23505' ? '이미 사용 중인 닉네임입니다' : '닉네임 저장에 실패했습니다',
    };
  }

  // 최초 가입 기본 카드팩 생성
  const { error: packError } = await supabase.from('pack_inventory').upsert(
    {
      id: user.id,
      pack_count: 1,
    },
    { onConflict: 'id' },
  );

  if (packError) {
    return {
      ok: false,
      message: '카드팩 정보를 생성하지 못했습니다.',
    };
  }

  // 최초 생성 시 기본 트레이너 상태 준비
  const { error: towerError } = await supabase.from('tower_progress').upsert(
    {
      user_id: user.id,
      current_floor: 1,
      max_cleared_floor: 0,
      player_lives: 4,
    },
    { onConflict: 'user_id' },
  );

  if (towerError) {
    return {
      ok: false,
      message: '탑 진행도를 생성하지 못했습니다.',
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

  const { error } = await supabase.rpc('create_starter_pokemons', { p_dex_ids: uniqueDexIds });

  if (error) {
    return {
      ok: false,
      message: error.code === '23505' ? '이미 스타팅 포켓몬을 선택하셨습니다' : '스타팅 포켓몬 저장에 실패했습니다',
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
