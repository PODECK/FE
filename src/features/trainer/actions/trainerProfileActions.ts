'use server';

import { nicknameSchema } from '@/app/(main)/(start)/_schemas/nicknameSchema';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const MAX_AVATAR_SIZE = 1024 * 1024 * 2;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_EXTENSIONS_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const AVATAR_EXTENSIONS = Object.values(AVATAR_EXTENSIONS_BY_TYPE);

export async function updateTrainerProfile(formData: FormData) {
  const rawNickname = formData.get('nickname');
  const avatarFile = formData.get('avatar');

  if (typeof rawNickname !== 'string') {
    return { ok: false, message: '닉네임을 입력해주세요' };
  }

  const nickname = nicknameSchema.safeParse(rawNickname);

  if (!nickname.success) {
    return {
      ok: false,
      message: nickname.error.issues[0].message ?? '닉네임을 확인해주세요',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: '로그인이 필요합니다' };
  }

  let avatarUrl: string | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
      return { ok: false, message: 'jpg, png, webp 이미지만 업로드할 수 있습니다' };
    }

    if (avatarFile.size > MAX_AVATAR_SIZE) {
      return { ok: false, message: '프로필 이미지는 2MB 이하만 가능합니다' };
    }

    const extension = AVATAR_EXTENSIONS_BY_TYPE[avatarFile.type] ?? 'png';
    const filePath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, {
      upsert: true,
      contentType: avatarFile.type,
    });

    if (uploadError) {
      return { ok: false, message: '프로필 이미지 업로드에 실패했습니다' };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
  }

  const updatePayload: {
    nickname: string;
    updated_at: string;
    avatar_url?: string;
  } = {
    nickname: nickname.data,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl;
  }

  const { error } = await supabase.from('users').update(updatePayload).eq('id', user.id);

  if (error) {
    return {
      ok: false,
      message: error.code === '23505' ? '이미 사용 중인 닉네임입니다.' : '프로필 수정에 실패했습니다.',
    };
  }

  revalidatePath('/home');
  revalidatePath('/pokedex');
  revalidatePath('/mydeck');
  revalidatePath('/battle');

  return { ok: true, message: '프로필이 수정되었습니다' };
}

export async function signOutTrainer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function deleteTrainerAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: '로그인이 필요합니다.' };
  }

  const adminSupabase = createAdminClient();

  await adminSupabase.storage
    .from('avatars')
    .remove(AVATAR_EXTENSIONS.map((extension) => `${user.id}/avatar.${extension}`));

  const { error: dbDeleteError } = await adminSupabase.from('users').delete().eq('id', user.id);

  if (dbDeleteError) {
    return { ok: false, message: '회원 탈퇴에 실패했습니다.' };
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (error) {
    return { ok: false, message: '회원 탈퇴에 실패했습니다.' };
  }

  await supabase.auth.signOut();

  redirect('/');
}
