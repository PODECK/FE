import { createClient } from '@/shared/lib/supabase/server';
import type { TrainerSummary } from '@/entities/trainer/model/types';
import { getOnboardingPathForUser } from '@/entities/trainer/api/onboarding';

export async function getOwnedPokemonDexIds(): Promise<number[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase.from('owned_pokemon').select('dex_id').eq('user_id', user.id);

  if (error) return [];

  return data.map((row: { dex_id: number }) => row.dex_id);
}

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

  const { data: appUser } = await supabase
    .from('users')
    .select('id, nickname, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

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

  const googleAvatarUrl =
    typeof user.user_metadata.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === 'string'
        ? user.user_metadata.picture
        : null;

  const { data: activeDeck } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  let activeDeckDexIds: number[] = [];
  if (activeDeck) {
    const { data: deckNumbers } = await supabase
      .from('deck_numbers')
      .select('instance_id, position')
      .eq('deck_id', activeDeck.id)
      .order('position');

    if (deckNumbers && deckNumbers.length > 0) {
      const instanceIds = deckNumbers.map((row) => row.instance_id as string);
      const { data: ownedPokemons } = await supabase
        .from('owned_pokemon')
        .select('instance_id, dex_id')
        .in('instance_id', instanceIds);

      const instanceIdToDexId = new Map(
        (ownedPokemons ?? []).map((p) => [p.instance_id as string, p.dex_id as number]),
      );

      activeDeckDexIds = deckNumbers
        .map((row) => instanceIdToDexId.get(row.instance_id as string))
        .filter((id): id is number => id !== undefined);
    }
  }

  return {
    id: appUser.id,
    nickname: appUser.nickname,
    avatarUrl: appUser.avatar_url ?? googleAvatarUrl,
    cardPackCount: pack?.pack_count ?? 0,
    battleRecord: {
      wins: wins ?? 0,
      losses: losses ?? 0,
    },
    ownedPokemonCount: ownedPokemonCount ?? 0,
    activeDeckDexIds,
    currentFloor: tower?.current_floor ?? 1,
  };
}
