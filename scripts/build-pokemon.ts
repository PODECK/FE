import path from 'path';
import { BuildPipeline } from './_pipeline';
import { pokeApi, findKoName, findKoFlavorText, mapApiType, getGeneration, findKoGenus } from './_utils';

import type { PokemonData } from '@/shared/types';

// 포켓몬 데이터 빌더
class PokemonBuilder {
  private data: Partial<PokemonData> = {};

  // 기본 정보 설정
  setBase(raw: any): this {
    const statMap: Record<string, keyof PokemonData['baseStats']> = {
      hp: 'hp',
      attack: 'attack',
      defense: 'defense',
      'special-attack': 'specialAttack',
      'special-defense': 'specialDefense',
      speed: 'speed',
    };

    const baseStats = {} as PokemonData['baseStats'];
    for (const s of raw.stats) {
      const key = statMap[s.stat.name];
      if (key) baseStats[key] = s.base_stat;
    }

    const types = raw.types.sort((a: any, b: any) => a.slot - b.slot).map((t: any) => mapApiType(t.type.name));

    this.data = {
      ...this.data,
      dexId: raw.id,
      enName: raw.name,
      types,
      baseStats,
      height: raw.height / 10,
      weight: raw.weight / 10,
      spriteUrl:
        raw.sprites.front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${raw.id}.png`,
      artworkUrl:
        raw.sprites.other?.['official-artwork']?.front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`,
    };

    return this;
  }

  // 종족 정보 설정
  setSpecies(raw: any, dexId: number): this {
    const koName = findKoName(raw.names, this.data.koName ?? '');
    const category = findKoGenus(raw.genera, '???');
    const flavorText = findKoFlavorText(raw.flavor_text_entries);

    const evolvesFromDexId = raw.evolves_from_species ? Number(raw.evolves_from_species.url.split('/').at(-2)) : null;

    const evolutionStage = raw.evolution_from_species ? (raw.is_baby ? 1 : 2) : 1;

    this.data = {
      ...this.data,
      koName,
      category,
      flavorText,
      generation: getGeneration(dexId),
      evolvesFromDexId,
      evolutionStage,
      evolvesAtFloor: null,
    };
    return this;
  }

  // 특성 정보 설정
  setAbility(raw: any, fallbackName: string): this {
    const name = findKoName(raw.names, fallbackName);
    const description = findKoFlavorText(raw.flavor_text_entries);

    this.data = {
      ...this.data,
      ability: { name, description },
    };
    return this;
  }

  // 데이터 빌드
  build(): PokemonData {
    if (!this.data.dexId || !this.data.koName) {
      throw new Error(`PokemonBuilder: 필수 필드 누락 (dexId: ${this.data.dexId}`);
    }
    return this.data as PokemonData;
  }
}

// 포켓몬 데이터 수집 파이프라인
class PokemonBuildPipeline extends BuildPipeline<number, PokemonData> {
  constructor() {
    super({
      total: 493,
      batchSize: 10,
      delayMs: 200,
      outputPath: path.resolve('data/pokemon.json'),
      label: '포켓몬 데이터 수집',
    });
  }

  // 포켓몬 데이터 가져오기
  protected getTargets(): number[] {
    return Array.from({ length: 493 }, (_, i) => i + 1);
  }

  protected async fetch(dexId: number): Promise<PokemonData> {
    const [pokemonRaw, speciesRaw] = await Promise.all([pokeApi.fetchPokemon(dexId), pokeApi.fetchSpecies(dexId)]);

    const builder = new PokemonBuilder().setBase(pokemonRaw).setSpecies(speciesRaw, dexId);

    // 일반 특성 가져오기
    const mainAbility = pokemonRaw.abilities.find((a: any) => !a.is_hidden);
    if (mainAbility) {
      const abilityRaw = await pokeApi.fetchAbility(mainAbility.ability.name);
      builder.setAbility(abilityRaw, mainAbility.ability.name);
    } else {
      builder.setAbility({ names: [], flavor_text_entries: [] }, '없음');
    }

    return builder.build();
  }

  // 키 가져오기
  protected getKey(dexId: number): string {
    return String(dexId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onComplete(result: Record<string, PokemonData>): void {
    console.log(`\n[다음 단계]`);
    console.log(`npx tsx scripts/build-pokemon-moves.ts`);
  }
}

new PokemonBuildPipeline().run().catch((err) => {
  console.error(`스크립트 오류: ${err.message}`);
  process.exit(1);
});
