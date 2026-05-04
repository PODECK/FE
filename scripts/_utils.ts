const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 내부 구현
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
  pokemon: (id: number) => `${POKEAPI_BASE_URL}/pokemon/${id}`,
  species: (id: number) => `${POKEAPI_BASE_URL}/pokemon-species/${id}`,
  ability: (name: string) => `${POKEAPI_BASE_URL}/ability/${name}`,
  move: (name: string) => `${POKEAPI_BASE_URL}/move/${name}`,
};

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
  fallback = '',
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
  return entries.find((e) => e.language.name === 'ko')?.flavor_text ?? fallback;
}
