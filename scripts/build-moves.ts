import fs from 'fs';
import path from 'path';
import { BuildPipeline } from './_pipeline';
import { findKoName, pokeApi, TYPE_MAP } from './_utils';

import type { MoveData } from '@/shared/types';

class MoveBuildPipeline extends BuildPipeline<string, MoveData> {
  constructor() {
    super({
      total: 0,
      batchSize: 20,
      delayMs: 200,
      outputPath: path.resolve('data/moves.json'),
      label: '기술 데이터 수집',
    });
  }

  // 기술 데이터 수집
  protected getTargets(): string[] {
    const pokemonMovesPath = path.resolve('data/pokemon-moves.json');

    if (!fs.existsSync(pokemonMovesPath)) {
      console.error('[오류] data/pokemon-moves.json 없음. ' + '먼저 build-pokemon-moves.ts를 실행하세요.');
      process.exit(1);
    }

    const pokemonMoves: Record<string, string[]> = JSON.parse(fs.readFileSync(pokemonMovesPath, 'utf-8'));

    const moveNames = [...new Set(Object.values(pokemonMoves).flat())].sort();

    (this.config as any).total = moveNames.length;
    return moveNames;
  }

  // 기술 데이터 가져오기
  protected async fetch(moveName: string): Promise<MoveData> {
    const data = await pokeApi.fetchMove(moveName);

    const type = TYPE_MAP[data.type.name];
    if (!type) {
      throw new Error(`SKIP: 페어리타입: ${moveName}`);
    }

    const koName = findKoName(data.names, moveName);

    return {
      id: moveName,
      koName,
      enName: moveName,
      type: type as any,
      damageClass: data.damage_class.name,
      power: data.power ?? 0,
      accuracy: data.accuracy ?? 0,
      pp: data.pp,
    };
  }

  // 완료 시 메시지 출력
  protected onComplete(): void {
    console.log(`\n[다음 단계]`);
    console.log(`npx tsx scripts/build-pokemon.ts`);
  }
}

new MoveBuildPipeline().run().catch((err) => {
  console.error(`스크립트 오류: ${err.message}`);
  process.exit(1);
});
