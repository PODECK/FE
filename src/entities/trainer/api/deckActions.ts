'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveDeckAction(dexIds: number[]): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false };

  const { data: existingDeck } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  let deckId: string;

  if (existingDeck) {
    deckId = existingDeck.id as string;
    await supabase.from('decks').update({ updated_at: new Date().toISOString() }).eq('id', deckId);
  } else {
    const { data: newDeck, error } = await supabase
      .from('decks')
      .insert({ user_id: user.id, is_active: true })
      .select('id')
      .single();
    if (error || !newDeck) {
      console.error('[saveDeckAction] decks insert error:', error);
      return { ok: false };
    }
    deckId = newDeck.id as string;
  }

  const { error: deleteError } = await supabase.from('deck_numbers').delete().eq('deck_id', deckId);
  if (deleteError) console.error('[saveDeckAction] deck_numbers delete error:', deleteError);

  if (dexIds.length > 0) {
    const { data: ownedPokemons, error: ownedError } = await supabase
      .from('owned_pokemon')
      .select('instance_id, dex_id')
      .eq('user_id', user.id)
      .in('dex_id', dexIds);

    if (ownedError) {
      console.error('[saveDeckAction] owned_pokemon fetch error:', ownedError);
      return { ok: false };
    }

    const dexIdToInstanceId = new Map((ownedPokemons ?? []).map((p) => [p.dex_id as number, p.instance_id as string]));

    const insertRows = dexIds
      .map((dexId, position) => {
        const instanceId = dexIdToInstanceId.get(dexId);
        if (!instanceId) return null;
        return { deck_id: deckId, instance_id: instanceId, position };
      })
      .filter((row): row is { deck_id: string; instance_id: string; position: number } => row !== null);

    if (insertRows.length > 0) {
      const { error } = await supabase.from('deck_numbers').insert(insertRows);
      if (error) {
        console.error('[saveDeckAction] deck_numbers insert error:', error);
        return { ok: false };
      }
    }
  }

  revalidatePath('/pokedex');
  return { ok: true };
}
