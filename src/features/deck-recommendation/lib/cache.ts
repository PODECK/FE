import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecommendRequest, RecommendedDeck, RosterPokemon } from '../model/schemas';

export async function computeRosterHash(roster: RosterPokemon[]): Promise<string> {
  const input = roster
    .map((p) => `${p.dexId}:${p.level}`)
    .sort()
    .join('|');
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function themeKey(req: RecommendRequest): string {
  if (req.theme === 'counter' && req.counterTarget) {
    return `counter:${req.counterTarget}`;
  }
  return req.theme;
}

export async function getCachedRecommendation(
  supabase: SupabaseClient,
  userId: string,
  rosterHash: string,
  theme: string,
): Promise<{ data: RecommendedDeck; model: string } | null> {
  const { data } = await supabase
    .from('deck_recommendation_cache')
    .select('result, model')
    .eq('user_id', userId)
    .eq('roster_hash', rosterHash)
    .eq('theme', theme)
    .maybeSingle();

  if (!data) return null;
  return { data: data.result as RecommendedDeck, model: data.model as string };
}

export async function setCachedRecommendation(
  supabase: SupabaseClient,
  userId: string,
  rosterHash: string,
  theme: string,
  result: RecommendedDeck,
  model: string,
): Promise<void> {
  await supabase
    .from('deck_recommendation_cache')
    .upsert(
      { user_id: userId, roster_hash: rosterHash, theme, result, model },
      { onConflict: 'user_id,roster_hash,theme' },
    );
}
