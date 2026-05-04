import fs from 'fs';
import path from 'path';
import {
  fetchWithRetry,
  pokeApi,
  logProgress,
  findKoName,
  sleep,
} from './_utils';

import type { MoveData } from '@/shared/types';

const TYPE_MAP: Record<string, string> = {
  normal: 'normal',
  fire: 'fire',
  water: 'water',
  electric: 'electric',
  grass: 'grass',
  ice: 'ice',
  fighting: 'fighting',
  poison: 'poison',
  ground: 'ground',
  flying: 'flying',
  psychic: 'psychic',
  bug: 'bug',
  rock: 'rock',
  ghost: 'ghost',
  dragon: 'dragon',
  dark: 'dark',
  steel: 'steel',
};

async function buildOneMove(moveName: string): Promise<MoveData | null> {
  const data = (await fetchWithRetry(pokeApi.move(moveName))) as any;

  const type = TYPE_MAP[data.type.name];
  if (!type) return null; // 페어리 타입 스킵

  const koName = findKoName(data.names, moveName);
  const damageClass = data.damage_class.name as
    | 'physical'
    | 'special'
    | 'status';

  return {
    id: moveName,
    koName,
    enName: moveName,
    type: type as any,
    damageClass,
    power: data.power ?? 0,
    accuracy: data.accuracy ?? 0,
    pp: data.pp,
  };
}

async function main() {
  const pokemonMovesPath = path.resolve('data/pokemon-moves.json');
  if (!fs.existsSync(pokemonMovesPath)) {
    console.error(
      'data/pokemon-moves.json 없음. 먼저 build-pokemon-moves.ts를 실행하세요.',
    );
    process.exit(1);
  }

  const pokemonMoves: Record<string, string[]> = JSON.parse(
    fs.readFileSync(pokemonMovesPath, 'utf-8'),
  );

  const moveNames = [...new Set(Object.values(pokemonMoves).flat())].sort();

  console.log(`기술 데이터 수집 시작 (${moveNames.length}개)\n`);

  const BATCH_SIZE = 20;
  const DELAY_MS = 200;

  const result: Record<string, MoveData> = {};
  const errors: string[] = [];
  let processed = 0;

  for (let start = 0; start < moveNames.length; start += BATCH_SIZE) {
    const batch = moveNames.slice(start, start + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((name) => buildOneMove(name)),
    );

    for (let i = 0; i < results.length; i++) {
      const moveName = batch[i];
      const res = results[i];
      processed++;

      if (res.status === 'fulfilled' && res.value !== null) {
        result[moveName] = res.value;
      } else if (res.status === 'rejected') {
        errors.push(moveName);
        console.error(`\n[오류] ${moveName}: ${res.reason}`);
      }

      logProgress(processed, moveNames.length, moveName);
    }

    if (start + BATCH_SIZE < moveNames.length) await sleep(DELAY_MS);
  }

  const outputPath = path.resolve('data/moves.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\n완료: data/moves.json (${Object.keys(result).length}개)`);

  if (errors.length > 0) {
    console.warn(`실패한 기술: [${errors.join(', ')}]`);
  }
}

main().catch((err) => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
