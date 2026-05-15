'use client';

// 배틀 화면 하단의 플레이어 상태, 포켓몬 상태 버튼, 배틀 로그 표시 HUD

import Image from 'next/image';
import { useMemo, useSyncExternalStore } from 'react';
import type { TrainerData } from '@/app/(main)/(start)/_types/trainer';
import { storageKeys } from '@/app/(main)/(start)/_constants/key';
import { getTypeBadgeColor } from '@/shared/constants/type-colors';
import type { PokemonEntry } from './PokemonStateModal';

const NUNITO = { fontFamily: 'Nunito, sans-serif' } as const;
const ROBOTO = { fontFamily: 'Roboto, sans-serif' } as const;

interface Props {
  playerPokemon: PokemonEntry[];
  playerLives: number;
  battleLogs: { id: number; message: string }[];
}

const DEFAULT_NICKNAME = 'NickName';

const subscribeTrainerStorage = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
};

const getTrainerSnapshot = () => {
  try {
    return localStorage.getItem(storageKeys.TRAINER_DATA);
  } catch {
    return null;
  }
};

const getServerTrainerSnapshot = () => null;

export default function BattleBottomHUD({ playerPokemon, playerLives, battleLogs }: Props) {
  const trainerData = useSyncExternalStore(subscribeTrainerStorage, getTrainerSnapshot, getServerTrainerSnapshot);

  const nickname = useMemo(() => {
    try {
      const data = trainerData ? (JSON.parse(trainerData) as TrainerData) : null;
      const nextNickname = data?.nickname?.trim();
      return nextNickname || DEFAULT_NICKNAME;
    } catch {
      return DEFAULT_NICKNAME;
    }
  }, [trainerData]);

  return (
    <div className="absolute inset-0 z-20">
      <div className="absolute bottom-[50px] left-12 z-[1] h-[114px] w-[180px] overflow-hidden rounded-xl bg-[var(--color-battle-panel-soft)]">
        <div className="absolute top-[11px] left-[11px] text-[9px] font-black text-white/45" style={NUNITO}>
          트레이너
        </div>
        <div
          className="absolute top-[30px] left-[11px] text-[15px] leading-none font-black text-white"
          style={NUNITO}
          suppressHydrationWarning
        >
          {nickname}
        </div>
        <div className="absolute top-[57px] left-[11px] h-[20px] w-[158px]">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const p = playerPokemon[i];
            const primaryType = p?.types[0];
            const fainted = p?.status === 'fainted';
            return (
              <div
                key={i}
                className="absolute top-0 flex h-[20px] w-[20px] items-center justify-center overflow-hidden rounded-full"
                style={{
                  left: i * 24,
                  background: primaryType && !fainted ? getTypeBadgeColor(primaryType) : 'rgba(255,255,255,0.08)',
                  border: fainted ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  opacity: fainted ? 0.4 : 1,
                  transition: 'opacity 0.4s ease',
                }}
              >
                {primaryType && (
                  <Image
                    src={`/images/pokemon-types/${primaryType}.svg`}
                    alt={primaryType}
                    width={12}
                    height={12}
                    style={{ filter: fainted ? 'grayscale(1)' : 'none' }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {playerPokemon.length > 0 && (
          <div className="absolute top-[83px] left-[11px] text-[11px] font-bold text-white/[0.48]" style={NUNITO}>
            포켓몬 {playerPokemon.filter((p) => p.status !== 'fainted').length}/{playerPokemon.length}
          </div>
        )}
      </div>

      <div className="pointer-events-auto absolute right-4 bottom-4 h-[405px] w-[200px] overflow-hidden rounded-xl bg-[var(--color-battle-panel-soft)]">
        <span className="absolute top-[11px] left-[11px] w-[80px] text-[9px] font-black text-white/40" style={NUNITO}>
          포켓몬 상태
        </span>
        <div className="absolute top-[40px] left-[11px] h-[292px] w-[178px] rounded-[8px] border border-white/10 bg-black/15 px-[10px] py-[9px]">
          <div className="mb-[7px] text-[9px] font-black tracking-[0.08em] text-white/35" style={NUNITO}>
            배틀 로그
          </div>
          <div className="flex h-[250px] flex-col justify-end gap-[6px] overflow-hidden">
            {battleLogs.length === 0 ? (
              <p className="text-[11px] leading-[1.35] font-bold text-white/30" style={NUNITO}>
                전투 기록이 표시됩니다.
              </p>
            ) : (
              battleLogs.map((log) => (
                <p key={log.id} className="text-[11px] leading-[1.35] font-bold text-white/70" style={NUNITO}>
                  {log.message}
                </p>
              ))
            )}
          </div>
        </div>
        <button
          className="absolute top-[355px] left-[11px] h-[39px] w-[178px] overflow-hidden rounded-[7px] bg-white"
          style={ROBOTO}
          onClick={() => window.dispatchEvent(new CustomEvent('battle:pokemon-status'))}
        >
          <span
            className="absolute top-[10px] left-[48px] text-[15px] font-black text-[rgba(12,12,22,1)]"
            style={ROBOTO}
          >
            포켓몬 상태
          </span>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-[2] h-[46px] w-[244px] overflow-hidden rounded-xl bg-[var(--color-battle-navy)]">
        <span
          className="absolute top-[13px] left-[26px] text-[15px] leading-none font-black text-white"
          style={NUNITO}
          suppressHydrationWarning
        >
          {nickname}
        </span>
        <div className="absolute top-[13px] left-[134px] flex gap-[5px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[20px] w-[22px] rounded-[10px]"
              style={{
                background: i < playerLives ? 'var(--color-battle-life-active)' : 'var(--color-battle-life-empty)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
