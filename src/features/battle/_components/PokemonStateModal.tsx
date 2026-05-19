'use client';
// 배틀 중 포켓몬 선택 및 상태 확인 모달

import Image from 'next/image';
import { useState } from 'react';
import { getTypeBadgeColor } from '@/shared/constants/type-colors';
import { cn } from '@/shared/lib/cn';

export interface PokemonEntry {
  dexId: number;
  koName: string;
  types: string[];
  currentHp: number;
  maxHp: number;
  status: 'available' | 'battle' | 'fainted';
}

interface Props {
  pokemon: PokemonEntry[];
  onClose: () => void;
}

const TYPE_KO: Record<string, string> = {
  fire: '불꽃',
  water: '물',
  grass: '풀',
  electric: '전기',
  ice: '얼음',
  fighting: '격투',
  poison: '독',
  ground: '땅',
  flying: '비행',
  psychic: '에스퍼',
  bug: '벌레',
  rock: '바위',
  ghost: '고스트',
  dragon: '드래곤',
  dark: '악',
  steel: '강철',
  normal: '노말',
};

const CARD = {
  near: { w: 130, h: 167, imgH: 98, nameFz: 13 },
  center: { w: 169, h: 208, imgH: 130, nameFz: 17 },
} as const;

function arrowBtn(disabled: boolean) {
  return cn(
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-none bg-white/10 text-[26px] leading-none font-black text-white',
    disabled ? 'cursor-default opacity-30' : 'cursor-pointer opacity-100 hover:bg-white/20',
  );
}

export default function PokemonSelectModal({ pokemon, onClose }: Props) {
  const [idx, setIdx] = useState(0);

  const aliveCount = pokemon.filter((p) => p.status !== 'fainted').length;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--color-battle-overlay-strong)]">
      {/* 헤더 */}
      {/* 닫기 버튼 */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--color-base-3)]/10 text-lg leading-none font-black text-[var(--color-base-3)]"
        >
          X
        </button>
      </div>

      {/* 제목 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2">
        <span className="text-[22px] font-black whitespace-nowrap text-[var(--color-base-3)]">
          포켓몬의 상태를 확인하세요
        </span>
      </div>

      {/* 캐러셀 + 푸터 */}
      <div className="absolute top-1/2 left-1/2 flex w-full max-w-[1200px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 px-6">
        {/* 카드 캐러셀 */}
        <div className="flex w-full items-center justify-center gap-5">
          <button
            type="button"
            aria-label="이전 포켓몬"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className={arrowBtn(idx === 0)}
          >
            {'<'}
          </button>

          <div className="flex items-start gap-1.5">
            {([-2, -1, 0, 1, 2] as const).map((offset) => {
              const entry = pokemon[idx + offset];
              const isCenter = offset === 0;
              const isFar = Math.abs(offset) >= 2;
              const sz = isCenter ? CARD.center : CARD.near;

              if (!entry) {
                return <div key={offset} style={{ width: sz.w, height: sz.h, flexShrink: 0 }} />;
              }

              return (
                <PokemonCard
                  key={offset}
                  entry={entry}
                  sz={sz}
                  isCenter={isCenter}
                  opacity={isFar ? 0.32 : 1}
                  onClick={() => !isCenter && setIdx(idx + offset)}
                />
              );
            })}
          </div>

          <button
            type="button"
            aria-label="다음 포켓몬"
            onClick={() => setIdx((i) => Math.min(pokemon.length - 1, i + 1))}
            disabled={idx === pokemon.length - 1}
            className={arrowBtn(idx === pokemon.length - 1)}
          >
            {'>'}
          </button>
        </div>

        {/* 푸터 */}
        <div className="flex flex-col items-center">
          <div className="mb-1.5 flex gap-1.5">
            {pokemon.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full',
                  i === idx ? 'bg-[var(--color-base-3)]' : 'bg-[var(--color-base-3)]/30',
                )}
              />
            ))}
          </div>

          <div className="text-xs text-[var(--color-base-3)]/60">보유 포켓몬 {aliveCount}마리 생존</div>
        </div>
      </div>
    </div>
  );
}

interface CardSz {
  w: number;
  h: number;
  imgH: number;
  nameFz: number;
}

function PokemonCard({
  entry,
  sz,
  isCenter,
  opacity,
  onClick,
}: {
  entry: PokemonEntry;
  sz: CardSz;
  isCenter: boolean;
  opacity: number;
  onClick: () => void;
}) {
  const hpPct = entry.maxHp === 0 ? 0 : Math.max(0, entry.currentHp / entry.maxHp);
  const primaryType = entry.types[0];

  return (
    <div
      onClick={onClick}
      className={cn(
        'shrink-0 overflow-hidden rounded-xl bg-[rgba(22,22,40,0.96)] transition-all duration-200 ease-in-out',
        isCenter ? 'mt-0 cursor-default' : 'mt-5 cursor-pointer',
      )}
      style={{
        width: sz.w,
        height: sz.h,
        opacity,
      }}
    >
      {/* 이미지 영역 */}
      <div
        className="relative flex w-full items-center justify-center bg-[var(--color-base-3)]/5"
        style={{ height: sz.imgH }}
      >
        {entry.status === 'battle' && <StatusBadge variant="battle">배틀 중</StatusBadge>}
        {entry.status === 'fainted' && <StatusBadge variant="fainted">기절</StatusBadge>}

        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.dexId}.png`}
          alt={entry.koName}
          width={160}
          height={160}
          className="h-[72%] w-[72%] object-contain"
        />
      </div>

      {/* 정보 영역 */}
      <div className="px-[11px] py-[9px]">
        <div className="font-black text-[var(--color-base-3)]" style={{ fontSize: sz.nameFz }}>
          {entry.koName}
        </div>

        <div className="mt-1 flex items-center gap-1">
          {primaryType && (
            <span
              className="rounded-[10px] px-[7px] py-0.5 text-[9px] font-black text-[var(--color-base-3)]"
              style={{ background: getTypeBadgeColor(primaryType) }}
            >
              {TYPE_KO[primaryType] ?? primaryType}
            </span>
          )}

          <span className="text-[11px] font-bold text-[var(--color-base-3)]/45">
            {entry.currentHp}/{entry.maxHp}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-base-3)]/15">
          <div className="h-full rounded-full bg-green-400" style={{ width: `${hpPct * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ variant, children }: { variant: 'battle' | 'fainted'; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'absolute top-[7px] right-2 rounded px-[7px] py-0.5 text-[9px] font-black',
        variant === 'battle' && 'bg-blue-950/70 text-blue-300',
        variant === 'fainted' && 'bg-red-950/70 text-red-300',
      )}
    >
      {children}
    </div>
  );
}
