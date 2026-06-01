// 사용자의 온보딩 진행 상태에 따라 다음 이동 경로를 반환
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOnboardingPathForUser(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', userId).maybeSingle();

  if (!profile?.nickname) return '/nickname';

  const { count } = await supabase
    .from('trainer_pokemons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!count) return '/build-deck';

  return '/home';
}
