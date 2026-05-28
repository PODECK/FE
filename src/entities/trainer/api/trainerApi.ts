import { createClient } from '@/shared/lib/supabase/server';
import type { TrainerSummary } from '@/entities/trainer/model/types';

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

  if (!user) return '/login';

  const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).maybeSingle();

  if (!profile?.nickname) return '/nickname';

  const { count } = await supabase
    .from('trainer_pokemons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (!count) return '/build-deck';

  return '/home';
}

export async function getTrainerSummary(): Promise<TrainerSummary | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('id, nickname').eq('id', user.id).maybeSingle();

  if (!profile?.nickname) return null;

  const { data: stats } = await supabase
    .from('trainer_stats')
    .select('card_pack_count, wins, losses, current_floor')
    .eq('user_id', user.id)
    .maybeSingle();

  const { count: ownedPokemonCount } = await supabase
    .from('trainer_pokemons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: deckSlots } = await supabase
    .from('active_deck_slots')
    .select('dex_id')
    .eq('user_id', user.id)
    .order('slot_index', { ascending: true });

  return {
    id: profile.id,
    nickname: profile.nickname,
    cardPackCount: stats?.card_pack_count ?? 0,
    battleRecord: {
      wins: stats?.wins ?? 0,
      loses: stats?.losses ?? 0,
    },
    ownedPokemonCount: ownedPokemonCount ?? 0,
    activeDeckDexIds: deckSlots?.map((slot) => slot.dex_id) ?? [],
    currentFloor: stats?.current_floor ?? 1,
  };
}
