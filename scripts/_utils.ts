const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// PokeAPI 호출 시 retry 기능 추가
export async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 1000,
): Promise<unknown> {
  for (let attemp = 1; attemp <= retries; attemp++) {
    try {
      const res = await fetch(url);

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? 60);
        console.warn(`\n[Rate Limit] ${retryAfter}초 대기 중...`);

        await sleep(retryAfter * 1000);
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);

      return await res.json();
    } catch (err) {
      if (attemp === retries) throw err;
      console.warn(`\n[재시도 ${attemp}/${retries}] ${url}`);
      await sleep(delayMs * attemp);
    }
  }
  throw new Error(`fetchWithRetry 실패: ${url}`);
}

export const pokeApi = {
  // 포켓몬 기본 데이터(타입, 능력치, 스포트라이트, 기술 목록, 특성)
  fetchPokemon: (id: number) =>
    fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${id}`) as Promise<unknown>,
  // 포켓몬 종 데이터(한국어 이름, 도감, 설명 분류, 진화 정보)
  fetchSpecies: (id: number) =>
    fetchWithRetry(
      `${POKEAPI_BASE_URL}/pokemon-species/${id}`,
    ) as Promise<unknown>,
  // 특성 데이터(한국어 이름, 설명)
  fetchAbility: (name: string) =>
    fetchWithRetry(`${POKEAPI_BASE_URL}/ability/${name}`) as Promise<unknown>,
  // 기술 데이터(한국어 이름, 위력, 명중률, pp, 타입, 물리/특수)
  fetchMove: (name: string) =>
    fetchWithRetry(`${POKEAPI_BASE_URL}/move/${name}`) as Promise<unknown>,

  sleep,
};

// 진행률 콘솔
export function logProgress(current: number, total: number, label: string) {
  const percent = Math.floor((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 5)).padEnd(20, '░');

  process.stdout.write(`\r[${bar}] ${percent}% (${current}/${total}) ${label}`);

  if (current === total) process.stdout.write('\n');
}

export function findKoName(
  names: Array<{ name: string; language: { name: string } }>,
  fallback = '',
): string {
  return names.find((n) => n.language.name === 'ko')?.name ?? fallback;
}

export function findKoFlavorText(
  entries: Array<{
    flavor_text: string;
    language: { name: string };
    version?: { name: string };
    version_group?: { name: string };
  }>,
): string {
  const GEN4_VERSIONS = ['diamond', 'pearl', 'platinum'];

  for (const version of GEN4_VERSIONS) {
    const entry = entries.find(
      (e) =>
        e.language.name === 'ko' &&
        (e.version?.name === version ||
          e.version_group?.name.includes(version)),
    );
    if (entry) return entry.flavor_text.replace(/\f|\n/g, ' ').trim();
  }
  return (
    entries
      .filter((e) => e.language.name === 'ko')
      .at(-1)
      ?.flavor_text.replace(/\f|\n/g, ' ')
      .trim() ?? ''
  );
}

// 세대 번호 (4세대까지)
export function getGEneration(dexId: number): number {
  if (dexId <= 151) return 1;
  if (dexId <= 251) return 2;
  if (dexId <= 386) return 3;
  return 4;
}

// PokeAPI 내부 타입 키
export const TYPE_MAP: Record<string, string> = {
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
