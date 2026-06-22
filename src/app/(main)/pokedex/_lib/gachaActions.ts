'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { GachaCard } from './cardGacha';

export async function pullGachaAction(): Promise<{ ok: true; cards: GachaCard[] } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: '로그인이 필요합니다' };
  }

  const { data, error } = await supabase.rpc('pull_gacha');

  if (error) {
    const message = error.message?.includes('NO_PACKS') ? 'NO_PACKS' : '뽑기에 실패했습니다';
    return { ok: false, message };
  }

  const rows = data as Array<{ dex_id: number; is_new: boolean }>;
  const dexIds = rows.map((r) => r.dex_id);

  const { data: species, error: speciesError } = await supabase
    .from('pokemon_species')
    .select('dex_id, ko_name')
    .in('dex_id', dexIds);

  if (speciesError) {
    return { ok: false, message: '포켓몬 정보를 불러오지 못했습니다' };
  }

  const koNameMap = new Map((species ?? []).map((s) => [s.dex_id as number, s.ko_name as string]));

  revalidatePath('/pokedex');

  return {
    ok: true,
    cards: rows.map((row) => ({
      pokemon: {
        dexId: row.dex_id,
        koName: koNameMap.get(row.dex_id) ?? String(row.dex_id),
      },
      isNew: row.is_new,
    })),
  };
}
