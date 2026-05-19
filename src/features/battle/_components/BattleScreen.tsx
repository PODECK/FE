'use client';

// Phaser 배틀 화면, React HUD, 결과 라우팅 연결 컨테이너

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BattleTopBar from './BattleTopBar';
import BattleBottomHUD from './BattleBottomHUD';
import SkillModal, { type SkillModalData } from './SkillModal';
import PokemonSelectModal, { type PokemonEntry } from './PokemonStateModal';
import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import pokemonDataJson from '../../../../data/pokemon.json';
import { REQUIRED_PLAYER_DECK_SIZE, readActivePlayerDeckDexIds } from '@/features/battle/game/player-deck-storage';
import { useTowerProgress } from '@/shared/hooks/useTowerProgress';
import type { PokemonData } from '@/shared/types/pokemon';
import type { Game } from 'phaser';
import { useBgm } from '@/shared/hooks/useBgm';
import { cn } from '@/shared/lib/cn';

const pokemonDataById = pokemonDataJson as Record<string, PokemonData>;
const TRAINER_DATA_UPDATED_EVENT = 'trainer-data-updated';

function recordBattleResult(winner: 'player' | 'enemy') {
  try {
    const rawTrainerData = localStorage.getItem(storageKeys.TRAINER_DATA);
    if (!rawTrainerData) return;

    const trainerData = JSON.parse(rawTrainerData) as TrainerData;
    const battleRecord = trainerData.battleRecord ?? { wins: 0, losses: 0 };
    const nextTrainerData: TrainerData = {
      ...trainerData,
      battleRecord: {
        wins: battleRecord.wins + (winner === 'player' ? 1 : 0),
        losses: battleRecord.losses + (winner === 'enemy' ? 1 : 0),
      },
    };

    localStorage.setItem(storageKeys.TRAINER_DATA, JSON.stringify(nextTrainerData));
    window.dispatchEvent(new CustomEvent(TRAINER_DATA_UPDATED_EVENT));
  } catch (error) {
    console.error('배틀 전적을 저장하지 못했습니다.', error);
  }
}

function createInitialPokemon(): PokemonEntry[] {
  return readActivePlayerDeckDexIds().flatMap((dexId) => {
    const pokemon = pokemonDataById[String(dexId)];
    if (!pokemon) {
      console.warn(`[BattleScreen] pokemon.json에 dexId=${dexId} 데이터가 없습니다.`);
      return [];
    }

    return [
      {
        dexId,
        koName: pokemon.koName,
        types: pokemon.types,
        currentHp: pokemon.baseStats.hp,
        maxHp: pokemon.baseStats.hp,
        status: 'available',
      },
    ];
  });
}

type AiPokemonStatus = { dexId: number; types: string[]; fainted: boolean };
type BattleLogEntry = { id: number; message: string };
type TurnPhase = 'setup' | 'player' | 'ai' | 'ended';

export default function BattleScreen() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hasShownDeckAlertRef = useRef(false);
  const hasHandledBattleEndRef = useRef(false);
  const [skillModal, setSkillModal] = useState<SkillModalData | null>(null);
  const [pokemonSelectOpen, setPokemonSelectOpen] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [pokemonList, setPokemonList] = useState<PokemonEntry[]>([]);
  const [isDeckLoaded, setIsDeckLoaded] = useState(false);
  const [aiPokemon, setAiPokemon] = useState<AiPokemonStatus[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('setup');

  const { progress, loseLife, markWinRewardPending } = useTowerProgress();
  const currentFloor = progress.currentFloor;
  const isPlayerTurn = turnPhase === 'player';
  const hasCompleteBattleDeck = isDeckLoaded && pokemonList.length === REQUIRED_PLAYER_DECK_SIZE;
  const turnButtonLabel = isPlayerTurn ? '턴 종료' : turnPhase === 'ai' ? '상대 턴' : '대기';

  useBgm('/bgm/battle-wild.mp3');

  const handleTurnEnd = () => {
    if (!isPlayerTurn) return;
    window.dispatchEvent(new CustomEvent('battle:turn-ended'));
  };

  const handleIncompleteDeck = useCallback(() => {
    if (hasShownDeckAlertRef.current) return;

    hasShownDeckAlertRef.current = true;
    window.alert('포켓몬 6마리를 선택해 주세요 !');
    router.replace('/mydeck');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setPokemonList(createInitialPokemon());
      setIsDeckLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDeckLoaded || hasCompleteBattleDeck) return;

    handleIncompleteDeck();
  }, [handleIncompleteDeck, hasCompleteBattleDeck, isDeckLoaded]);

  useEffect(() => {
    window.addEventListener('battle:player-deck-invalid', handleIncompleteDeck);
    return () => window.removeEventListener('battle:player-deck-invalid', handleIncompleteDeck);
  }, [handleIncompleteDeck]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { phase } = (e as CustomEvent<{ phase: TurnPhase }>).detail;
      setTurnPhase(phase);
    };
    window.addEventListener('battle:turn-phase', handler);
    return () => window.removeEventListener('battle:turn-phase', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setAiPokemon((e as CustomEvent<AiPokemonStatus[]>).detail);
    window.addEventListener('battle:ai-deck-status', handler);
    return () => window.removeEventListener('battle:ai-deck-status', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message } = (e as CustomEvent<{ message: string }>).detail;
      setBattleLogs((prev) => [...prev.slice(-5), { id: Date.now() + Math.random(), message }]);
    };
    window.addEventListener('battle:log', handler);
    return () => window.removeEventListener('battle:log', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setSkillModal((e as CustomEvent<SkillModalData>).detail);
    window.addEventListener('battle:zone-card-click', handler);
    return () => window.removeEventListener('battle:zone-card-click', handler);
  }, []);

  useEffect(() => {
    const handler = () => setPokemonSelectOpen(true);
    window.addEventListener('battle:pokemon-status', handler);
    return () => window.removeEventListener('battle:pokemon-status', handler);
  }, []);

  useEffect(() => {
    const handler = () => setConfirmQuit(true);
    window.addEventListener('battle:confirm-quit', handler);
    return () => window.removeEventListener('battle:confirm-quit', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { dexId } = (e as CustomEvent<{ dexId: number }>).detail;
      setPokemonList((prev) => prev.map((p) => (p.dexId === dexId ? { ...p, status: 'fainted', currentHp: 0 } : p)));
    };
    window.addEventListener('battle:pokemon-fainted', handler);
    return () => window.removeEventListener('battle:pokemon-fainted', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { dexId, currentHp } = (e as CustomEvent<{ dexId: number; currentHp: number }>).detail;
      setPokemonList((prev) => prev.map((p) => (p.dexId === dexId ? { ...p, currentHp: Math.max(0, currentHp) } : p)));
    };
    window.addEventListener('battle:player-pokemon-hp-changed', handler);
    return () => window.removeEventListener('battle:player-pokemon-hp-changed', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if (hasHandledBattleEndRef.current) return;
      hasHandledBattleEndRef.current = true;

      const { winner } = (e as CustomEvent<{ winner: 'player' | 'enemy' }>).detail;
      recordBattleResult(winner);

      if (winner === 'player') {
        markWinRewardPending();
        router.push('/battle/win');
        return;
      }

      loseLife();
      router.push('/battle/lose');
    };
    window.addEventListener('battle:ended', handler);
    return () => window.removeEventListener('battle:ended', handler);
  }, [loseLife, markWinRewardPending, router]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    if (!hasCompleteBattleDeck) return;

    let cancelled = false;
    let game: Game;

    (async () => {
      const Phaser = (await import('phaser')).default;
      const { phaserConfig } = await import('../game/config');
      const { PreloadScene } = await import('../game/scenes/PreloadScene');
      const { BattleScene } = await import('../game/scenes/BattleScene');

      if (cancelled) return;

      const renderConfig = {
        ...phaserConfig.render,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      };

      game = new Phaser.Game({
        ...phaserConfig,
        parent: containerRef.current!,
        render: renderConfig,
        scene: [PreloadScene, BattleScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      game?.destroy(true);
      gameRef.current = null;
    };
  }, [hasCompleteBattleDeck]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div ref={containerRef} id="phaser-container" className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0">
        <BattleTopBar currentFloor={currentFloor} aiPokemon={aiPokemon} />
        <BattleBottomHUD playerPokemon={pokemonList} playerLives={progress.playerLives} battleLogs={battleLogs} />

        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={handleTurnEnd}
          aria-label={turnButtonLabel}
          className={cn(
            'pointer-events-auto absolute right-12 bottom-[433px] h-10 w-[136px]',
            'border-0 text-sm font-black tracking-normal text-shadow-none',
            'overflow-hidden transition-[background,color,box-shadow] duration-200 ease-in-out',
            '[clip-path:polygon(12%_0,88%_0,100%_50%,88%_100%,12%_100%,0_50%)]',
            isPlayerTurn
              ? 'cursor-pointer bg-[rgb(8,20,52)] text-[var(--color-base-3)] shadow-[0_12px_30px_rgba(8,20,52,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]'
              : 'cursor-not-allowed bg-[linear-gradient(180deg,rgba(82,91,112,0.72)_0%,rgba(34,41,61,0.82)_100%)] text-[var(--color-base-3)]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
          )}
        >
          <span key={turnButtonLabel} className="turn-button-count-text">
            {turnButtonLabel}
          </span>
        </button>
      </div>

      {skillModal && (
        <SkillModal
          data={skillModal}
          onClose={() => setSkillModal(null)}
          onConfirmMove={(moveIndex) => {
            window.dispatchEvent(new CustomEvent('battle:move-selected', { detail: { moveIndex } }));
          }}
        />
      )}

      {pokemonSelectOpen && <PokemonSelectModal pokemon={pokemonList} onClose={() => setPokemonSelectOpen(false)} />}

      {confirmQuit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65">
          <div className="min-w-[320px] rounded-2xl bg-[rgb(13,16,36)] px-11 py-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            <div className="mb-2 text-xl font-black text-[var(--color-base-3)]">정말 포기하시겠습니까?</div>

            <div className="mb-7 text-[13px] text-[var(--color-base-3)]/45">진행 중인 배틀이 종료됩니다.</div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmQuit(false)}
                className="h-11 flex-1 cursor-pointer rounded-lg border-0 bg-[var(--color-base-3)]/10 text-[15px] font-bold text-[var(--color-base-3)]"
              >
                취소
              </button>

              <button
                type="button"
                onClick={() => router.push('/home')}
                className="h-11 flex-1 cursor-pointer rounded-lg border-0 bg-[rgba(220,60,50,0.9)] text-[15px] font-bold text-[var(--color-base-3)]"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
