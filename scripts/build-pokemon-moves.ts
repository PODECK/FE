import fs from 'fs';
import path from 'path';
import { fetchWithRetry, sleep, logProgress, pokeApi } from './_utils';

const GEN4_VERSION_GROUPS = ['platinum', 'diamond-pearl'];
const STATUS_DAMAGE_CLASS = 'status';

interface RawMove {
  name: string;
  level: number;
  method: string;
  damageClass: string;
  power: number | null;
}

async function selectMoves(dexId: number): Promise<string[]> {
  const data = (await fetchWithRetry(pokeApi.pokemon(dexId))) as any;

  const gen4Moves: RawMove[] = [];

  for (const moveEntry of data.moves) {
    for (const vgDetail of moveEntry.version_group_details) {
      if (!GEN4_VERSION_GROUPS.includes(vgDetail.version_group.name)) continue;

      gen4Moves.push({
        name: moveEntry.move.name,
        level: vgDetail.level_learned_at,
        method: vgDetail.move_learn_method.name,
        damageClass: '',
        power: null,
      });
    }
  }

  const uniqueMoves = [...new Map(gen4Moves.map((m) => [m.name, m])).values()];

  const moveDetails = await Promise.allSettled(
    uniqueMoves.map(async (m) => {
      const detail = (await fetchWithRetry(
        `https://pokeapi.co/api/v2/move/${m.name}`,
      )) as any;
      return {
        ...m,
        damageClass: detail.damage_class?.name ?? STATUS_DAMAGE_CLASS,
        power: detail.power ?? 0,
        type: detail.type?.name ?? '',
      };
    }),
  );

  const resolved = moveDetails
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<any>).value);

  const levelUpAttacks = resolved
    .filter(
      (m) =>
        m.method === 'level-up' &&
        m.damageClass !== STATUS_DAMAGE_CLASS &&
        m.power > 0,
    )
    .sort((a, b) => b.level - a.level);

  const levelUpStatus = resolved
    .filter(
      (m) => m.method === 'level-up' && m.damageClass === STATUS_DAMAGE_CLASS,
    )
    .sort((a, b) => b.level - a.level);

  const tmAttacks = resolved
    .filter(
      (m) =>
        m.method === 'machine' &&
        m.damageClass !== STATUS_DAMAGE_CLASS &&
        m.power > 0,
    )
    .sort((a, b) => (b.power ?? 0) - (a.power ?? 0));

  const selected: typeof resolved = [];
  const used = new Set<string>();

  const addMove = (m: (typeof resolved)[0]) => {
    if (selected.length < 4 && !used.has(m.name)) {
      selected.push(m);
      used.add(m.name);
    }
  };

  for (const m of levelUpAttacks.slice(0, 4)) addMove(m);

  if (selected.length < 4) {
    for (const m of tmAttacks) addMove(m);
  }

  if (selected.length < 4) {
    for (const m of levelUpStatus) addMove(m);
  }

  if (selected.length === 0) {
    return ['tackle', 'growl', 'leer', 'struggle'];
  }

  while (selected.length < 4) {
    selected.push({
      name: 'struggle',
      damageClass: 'physical',
      power: 50,
      level: 0,
      method: '',
      type: 'normal',
    });
    used.add('struggle');
  }

  return selected.map((m) => m.name);
}

async function main() {
  const TOTAL = 493;
  const BATCH_SIZE = 5;
  const DELAY_MS = 300;

  const result: Record<number, string[]> = {};
  const errors: number[] = [];

  console.log(`포켓몬 기술 매핑 수집 시작 (1~${TOTAL})\n`);

  for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
    const batch = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const results = await Promise.allSettled(
      batch.map((id) => selectMoves(id)),
    );

    for (let i = 0; i < results.length; i++) {
      const dexId = batch[i];
      const res = results[i];

      if (res.status === 'fulfilled') {
        result[dexId] = res.value;
      } else {
        errors.push(dexId);
        console.error(`\n[오류] #${dexId}: ${res.reason}`);
      }

      logProgress(start + i, TOTAL, `#${dexId}`);
    }

    if (end < TOTAL) await sleep(DELAY_MS);
  }

  const outputPath = path.resolve('data/pokemon-moves.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(
    `\n완료: data/pokemon-moves.json (${Object.keys(result).length}마리)`,
  );

  if (errors.length > 0) {
    console.warn(`실패한 dexId: [${errors.join(', ')}]`);
    console.warn('실패 항목은 수동으로 확인 후 개별 재실행하세요.');
  }

  console.log('\n[다음 단계]');
  console.log('1. npx tsx scripts/build-moves.ts 실행');
  console.log('2. data/pokemon-moves.json 검수 (무한의 탑 등장 포켓몬 위주)');
  console.log('3. 변화기만 4개인 포켓몬, 기술 0개 포켓몬 수동 수정');
}

main().catch((err) => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
