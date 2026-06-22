// 약점 목록만 계산
import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { PokemonType, type PokemonType as PokemonTypeValue } from '@/shared/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const defenderTypes = searchParams
    .get('types')
    ?.split(',')
    .map((type) => type.trim())
    .filter(Boolean);

  if (!defenderTypes?.length) {
    return NextResponse.json({ weaknesses: [] });
  }

  const parsedTypes = defenderTypes.map((type) => PokemonType.safeParse(type));

  if (parsedTypes.some((result) => !result.success)) {
    return NextResponse.json({ error: 'Invalid pokemon type' }, { status: 400 });
  }

  const validDefenderTypes = parsedTypes.map((result) => result.data) as PokemonTypeValue[];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('type_charts')
    .select('attack_type_id, defense_type_id, multiplier')
    .in('defense_type_id', validDefenderTypes);

  if (error) {
    return NextResponse.json({ error: 'Failed to load type chart' }, { status: 500 });
  }

  const effectivenessByAttackType = new Map<PokemonTypeValue, number>();
  const rows = data ?? [];

  for (const row of rows) {
    const parsedAttackType = PokemonType.safeParse(row.attack_type_id);

    if (!parsedAttackType.success) continue;

    const attackType = parsedAttackType.data;
    const current = effectivenessByAttackType.get(attackType) ?? 1;

    effectivenessByAttackType.set(attackType, current * Number(row.multiplier));
  }
  const weaknesses = [...effectivenessByAttackType.entries()]
    .filter(([, effectiveness]) => effectiveness > 1)
    .map(([attackType]) => attackType);

  return NextResponse.json({ weaknesses });
}
