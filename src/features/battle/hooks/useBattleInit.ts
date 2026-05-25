'use client';

import { useEffect, useState } from 'react';
import { buildAiDeck } from '@/shared/temp-ai/deck-builder';
import { createRng, generateSeed } from '@/shared/lib/rng';
import { TOWER_FLOORS } from '@/shared/config/tower-floors';
import { readActivePlayerDeckDexIds, REQUIRED_PLAYER_DECK_SIZE } from '@/features/battle/game/player-deck-storage';
import { FetchPokemonDataSource } from '@/features/battle/game/fetch-data-source';
import { useBattleStore } from '@/shared/stores/battleStore';
import type { PlayerPokemonState, EnemyPokemonState } from '@/shared/stores/battleStore';
import type { PokemonJson, MovesJson, PokemonMovesJson } from '@/features/battle/game/fetch-data-source';

const DEFAULT_PLAYER_LEVEL = 5;

type BattleInitStatus = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready' };

export function useBattleInit(currentFloor: number): BattleInitStatus {
  const [initStatus, setInitStatus] = useState<BattleInitStatus>(() => {
    // 이미 초기화됐으면 스킵 (phase가 init이 아닐 때)
    const currentPhase = useBattleStore.getState().phase;
    return currentPhase !== 'init' ? { status: 'ready' } : { status: 'loading' };
  });

  useEffect(() => {
    if (initStatus.status === 'ready') return;

    let cancelled = false;

    async function run() {
      try {
        // 1. JSON 병렬 fetch
        const [pokemonJson, movesJson, pokemonMovesJson] = await Promise.all([
          fetch('/api/data/pokemon.json').then((r) => r.json()) as Promise<PokemonJson>,
          fetch('/api/data/moves.json').then((r) => r.json()) as Promise<MovesJson>,
          fetch('/api/data/pokemon-moves.json').then((r) => r.json()) as Promise<PokemonMovesJson>,
        ]);
        if (cancelled) return;

        const dataSource = new FetchPokemonDataSource(pokemonJson, movesJson, pokemonMovesJson);

        // 2. 플레이어 덱 검증
        const playerDexIds = readActivePlayerDeckDexIds();
        if (playerDexIds.length !== REQUIRED_PLAYER_DECK_SIZE) {
          useBattleStore.getState().setDeckInvalid(true);
          setInitStatus({ status: 'ready' });
          return;
        }

        // 3. 플레이어 팀 빌드
        const playerTeam: PlayerPokemonState[] = playerDexIds.map((dexId) => {
          const p = dataSource.getPokemon(dexId, DEFAULT_PLAYER_LEVEL);
          return {
            dexId: p.dexId,
            koName: p.koName,
            types: p.types,
            currentHp: p.currentHp,
            maxHp: p.maxHp,
            status: 'available' as const,
          };
        });

        // 4. AI 덱 빌드
        const floorIndex = Math.max(0, Math.min(currentFloor - 1, TOWER_FLOORS.length - 1));
        const floorConfig = TOWER_FLOORS[floorIndex]!;
        const rng = createRng(generateSeed());
        const aiPokemon = buildAiDeck(floorConfig, rng, dataSource);
        const enemyTeam: EnemyPokemonState[] = aiPokemon.map((p) => ({
          dexId: p.dexId,
          types: p.types,
          fainted: false,
        }));

        // 5. 스토어 초기화
        useBattleStore.getState().initBattle({ playerTeam, enemyTeam, floor: currentFloor });
        if (!cancelled) setInitStatus({ status: 'ready' });
      } catch (err) {
        if (!cancelled) setInitStatus({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [currentFloor]);

  return initStatus;
}
