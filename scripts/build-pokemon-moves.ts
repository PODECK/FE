import path from 'path';
import { BuildPipeline } from './_pipeline';
import { pokeApi } from './_utils';

interface MoveCandidate {
  name: string;
  level: number;
  method: string;
  damageClass: string;
  power: number;
}

// TODO: 기술 선택 로직이 늘어나면 책임 연쇄 패턴으로 리팩토링
function selectMoves(candidates: MoveCandidate[]): string[] {
  const used = new Set<string>();
  const result: string[] = [];

  const attacks = candidates
    .filter(
      (m) =>
        m.method === 'level-up' && m.damageClass !== 'status' && m.power > 0,
    )
    .sort((a, b) => b.level - a.level);

  for (const move of attacks) {
    if (result.length >= 4) break;
    if (!used.has(move.name)) {
      result.push(move.name);
      used.add(move.name);
    }
  }

  while (result.length < 4) {
    result.push('struggle');
  }

  return result;
}

const GEN4_VERSIONS = ['platinum', 'diamond-pearl', 'heartgold-soulsilver'];

class PokemonMovesBuildPipeline extends BuildPipeline<number, string[]> {
  constructor() {
    super({
      total: 493,
      batchSize: 5,
      delayMs: 300,
      outputPath: path.resolve('data/pokemon-moves.json'),
      label: '포켓몬 기술 매핑 수집',
    });
  }

  protected getTargets(): number[] {
    return Array.from({ length: 493 }, (_, i) => i + 1);
  }

  protected async fetch(dexId: number): Promise<string[]> {
    const pokemonRaw = await pokeApi.fetchPokemon(dexId);

    const gen4MoveNames = new Set<string>();
    for (const moveEntry of pokemonRaw.moves) {
      for (const vg of moveEntry.version_group_details) {
        if (GEN4_VERSIONS.includes(vg.version_group.name)) {
          gen4MoveNames.add(moveEntry.move.name);
        }
      }
    }

    const details = await Promise.allSettled(
      [...gen4MoveNames].map(async (name) => {
        const detail = await pokeApi.fetchMove(name);
        const vgDetail = pokemonRaw.moves
          .find((m: any) => m.move.name === name)
          ?.version_group_details.find((vg: any) =>
            GEN4_VERSIONS.includes(vg.version_group.name),
          );

        return {
          name,
          level: vgDetail?.level_learned_at ?? 0,
          method: vgDetail?.move_learn_method.name ?? 'level-up',
          damageClass: detail.damage_class?.name ?? 'status',
          power: detail.power ?? 0,
        } as MoveCandidate;
      }),
    );

    const candidates = details
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<MoveCandidate>).value);

    return selectMoves(candidates);
  }

  protected getKey(dexId: number): string {
    return dexId.toString();
  }

  protected onComplete(): void {
    console.log('\n[다음 단계]');
    console.log('1. npx tsx scripts/build-moves.ts');
    console.log('2. data/pokemon-moves.json 검수 (등장 예정 포켓몬 위주)');
    console.log('3. 변화기만 4개인 포켓몬 수동 수정');
  }
}

new PokemonMovesBuildPipeline().run().catch((err) => {
  console.error('포켓몬 기술 매핑 수집 실패:', err);
  process.exit(1);
});
