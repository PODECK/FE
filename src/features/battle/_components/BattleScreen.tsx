'use client';

// Phaser 배틀 화면, React HUD, 결과 라우팅 연결 컨테이너

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import BattleTopBar from './BattleTopBar';
import BattleBottomHUD from './BattleBottomHUD';
import SkillModal, { type SkillModalData } from './SkillModal';
import PokemonSelectModal, { type PokemonEntry } from './PokemonStateModal';
import { REQUIRED_PLAYER_DECK_SIZE, readActivePlayerDeckDexIds } from '@/features/battle/game/player-deck-storage';
import { getPokemonByDexId } from '@/shared/data/pokemon-catalog';
import { useTowerProgress } from '@/shared/hooks/useTowerProgress';
import type { Game } from 'phaser';
import { useBgm } from '@/shared/hooks/useBgm';

function createInitialPokemon(): PokemonEntry[] {
  return readActivePlayerDeckDexIds().flatMap((dexId) => {
    const pokemon = getPokemonByDexId(dexId);
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

const NUNITO = { fontFamily: 'Nunito, sans-serif' } as const;
const ROBOTO = { fontFamily: 'Roboto, sans-serif' } as const;

type AiPokemonStatus = { dexId: number; types: string[]; fainted: boolean };
type BattleLogEntry = { id: number; message: string };
type TurnPhase = 'setup' | 'player' | 'ai' | 'ended';

export default function BattleScreen() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hasShownDeckAlertRef = useRef(false);
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

  useBgm('bgm/battle-wild.mp3');

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
      const { winner } = (e as CustomEvent<{ winner: 'player' | 'enemy' }>).detail;
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

      game = new Phaser.Game({
        ...phaserConfig,
        parent: containerRef.current!,
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
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} id="phaser-container" />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <BattleTopBar currentFloor={currentFloor} aiPokemon={aiPokemon} />
        <BattleBottomHUD playerPokemon={pokemonList} playerLives={progress.playerLives} battleLogs={battleLogs} />
        <button
          type="button"
          disabled={!isPlayerTurn}
          onClick={handleTurnEnd}
          aria-label={turnButtonLabel}
          style={{
            position: 'absolute',
            right: 48,
            bottom: 433,
            width: 136,
            height: 40,
            clipPath: 'polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%)',
            border: 'none',
            background: isPlayerTurn
              ? 'rgb(8,20,52)'
              : 'linear-gradient(180deg, rgba(82,91,112,0.72) 0%, rgba(34,41,61,0.82) 100%)',
            color: isPlayerTurn ? 'white' : 'rgba(255,255,255,0.45)',
            textShadow: 'none',
            cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 0,
            overflow: 'hidden',
            pointerEvents: 'auto',
            boxShadow: isPlayerTurn
              ? '0 12px 30px rgba(8,20,52,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'
              : 'inset 0 1px 0 rgba(255,255,255,0.12)',
            transition: 'background 220ms ease, color 220ms ease, box-shadow 220ms ease',
            ...ROBOTO,
          }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)',
          }}
        >
          <div
            style={{
              background: 'rgb(13,16,36)',
              borderRadius: 16,
              padding: '36px 44px',
              textAlign: 'center',
              minWidth: 320,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ color: 'white', fontSize: 20, fontWeight: 900, marginBottom: 8, ...NUNITO }}>
              정말 포기하시겠습니까?
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 28, ...NUNITO }}>
              진행 중인 배틀이 종료됩니다.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmQuit(false)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  ...ROBOTO,
                }}
              >
                취소
              </button>
              <button
                onClick={() => router.push('/home')}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(220,60,50,0.9)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  ...ROBOTO,
                }}
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
