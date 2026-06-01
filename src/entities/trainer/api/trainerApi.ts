import { createClient } from '@/shared/lib/supabase/server';
import type { TrainerSummary } from '@/entities/trainer/model/types';
import { getOnboardingPathForUser } from '@/entities/trainer/api/onboarding';

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function getOnboardingPath() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return '/';

  return getOnboardingPathForUser(supabase, user.id);
}

export async function getTrainerProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('users').select('id, nickname').eq('id', user.id).maybeSingle();

  return data;
}

export async function getTrainerSummary(): Promise<TrainerSummary | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appUser } = await supabase.from('users').select('id, nickname').eq('id', user.id).maybeSingle();

  if (!appUser?.nickname) return null;

  const { data: pack } = await supabase.from('pack_inventory').select('pack_count').eq('id', user.id).maybeSingle();

  const { data: tower } = await supabase
    .from('tower_progress')
    .select('current_floor')
    .eq('user_id', user.id)
    .maybeSingle();

  const { count: ownedPokemonCount } = await supabase
    .from('owned_pokemon')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: wins } = await supabase
    .from('battle_histories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('won', true);

  const { count: losses } = await supabase
    .from('battle_histories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('won', false);

  return {
    id: appUser.id,
    nickname: appUser.nickname,
    cardPackCount: pack?.pack_count ?? 0,
    battleRecord: {
      wins: wins ?? 0,
      losses: losses ?? 0,
    },
    ownedPokemonCount: ownedPokemonCount ?? 0,
    activeDeckDexIds: [], // mydeck 전환 시 decks/deck_numbers 기준으로 채움
    currentFloor: tower?.current_floor ?? 1,
  };
}
