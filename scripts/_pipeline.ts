import fs from 'fs';
import path from 'path';
import { logProgress, pokeApi } from './_utils';

export interface PipelineConfig {
  total: number; // 수집할 항목 총 개수
  batchSize: number; // 동시 요청 배치 크기
  delayMs: number; // 배치 간 딜레이(ms)
  outputPath: string; // 출력 파일 경로
  label: string; // 콘솔 출력용 라벨
}

export abstract class BuildPipeline<TInput, TOutput> {
  protected errors: TInput[] = [];

  constructor(protected readonly config: PipelineConfig) {}

  async run(): Promise<void> {
    await this.prepare();

    const result = await this.collectAll();

    await this.save(result);
    this.onComplete(result);
  }

  // 수집 대상 목록 반환
  protected abstract getTargets(): TInput[];
  // 1개 항목 수집 및 변환
  protected abstract fetch(target: TInput): Promise<TOutput>;
  // 완료 후 안내 메시지
  protected abstract onComplete(result: Record<string, TOutput>): void;

  // 실행 전 준비 작업 (선행 파일 확인)
  protected async prepare(): Promise<void> {
    console.log(`\n${this.config.label} 시작 (총 ${this.config.total}개)\n`);
  }
  // 결과 키 생성
  protected getKey(target: TInput): string {
    return String(target);
  }

  private async collectAll(): Promise<Record<string, TOutput>> {
    const { batchSize, delayMs } = this.config;
    const targets = this.getTargets();
    const result: Record<string, TOutput> = {};
    let processed = 0;

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);

      const settled = await Promise.allSettled(batch.map((target) => this.fetch(target)));

      for (let j = 0; j < settled.length; j++) {
        const target = batch[j]!;
        const res = settled[j]!;
        processed++;

        if (res.status === 'fulfilled') {
          result[this.getKey(target)] = res.value;
        } else {
          this.errors.push(target);
          console.error(`\n[오류] ${target}: ${res.reason}`);
        }

        logProgress(processed, targets.length, String(target));
      }

      if (i + batchSize < targets.length) {
        await pokeApi.sleep(delayMs);
      }
    }

    return result;
  }

  private async save(result: Record<string, TOutput>): Promise<void> {
    const { outputPath } = this.config;
    const dir = path.dirname(outputPath);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`\n저장 완료: ${outputPath} (${Object.keys(result).length}개)\n`);

    if (this.errors.length > 0) {
      console.warn(`실패한 항목: [${this.errors.join(', ')}]`);
    }
  }
}
