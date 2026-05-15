'use client';
// 배틀 중 포켓몬 선택 및 상태 확인 모달

import Image from 'next/image';
import { useState } from 'react';
import { getTypeBadgeColor } from '@/shared/constants/type-colors';

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

const ROBOTO = { fontFamily: 'Roboto, sans-serif' } as const;

function hpBarColor(current: number, max: number): string {
  const pct = max === 0 ? 0 : current / max;
  if (pct >= 0.5) return 'var(--color-battle-hp-high)';
  if (pct >= 0.2) return 'var(--color-battle-hp-mid)';
  return 'var(--color-battle-hp-low)';
}

function arrowBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...ROBOTO,
    flexShrink: 0,
  };
}

export default function PokemonSelectModal({ pokemon, onClose }: Props) {
  const [idx, setIdx] = useState(0);

  const aliveCount = pokemon.filter((p) => p.status !== 'fainted').length;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-battle-overlay-strong)', ...ROBOTO }}
    >
      {/* 헤더 */}
      <div style={{ position: 'absolute', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: 'white',
            fontSize: 18,
            fontWeight: 900,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...ROBOTO,
          }}
        >
          X
        </button>
        <span style={{ color: 'white', fontSize: 22, fontWeight: 900 }}>포켓몬의 상태를 확인하세요</span>
      </div>

      {/* 캐러셀 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <button
          type="button"
          aria-label="이전 포켓몬"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={arrowBtn(idx === 0)}
        >
          {'<'}
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
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
          style={arrowBtn(idx === pokemon.length - 1)}
        >
          {'>'}
        </button>
      </div>

      {/* 푸터 */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {pokemon.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i === idx ? 'white' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>보유 포켓몬 {aliveCount}마리 생존</div>
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
      style={{
        width: sz.w,
        height: sz.h,
        flexShrink: 0,
        background: 'rgba(22,22,40,0.96)',
        borderRadius: 12,
        overflow: 'hidden',
        opacity,
        cursor: isCenter ? 'default' : 'pointer',
        marginTop: isCenter ? 0 : 20,
        transition: 'all 250ms ease',
      }}
    >
      {/* 이미지 영역 */}
      <div
        style={{
          width: '100%',
          height: sz.imgH,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {entry.status === 'battle' && (
          <div
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              background: 'rgba(28,56,130,0.7)',
              color: 'rgba(136,176,240,1)',
              fontSize: 9,
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: 4,
            }}
          >
            배틀 중
          </div>
        )}
        {entry.status === 'fainted' && (
          <div
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              background: 'rgba(100,18,18,0.7)',
              color: 'rgba(240,128,128,1)',
              fontSize: 9,
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: 4,
            }}
          >
            기절
          </div>
        )}
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.dexId}.png`}
          alt={entry.koName}
          width={160}
          height={160}
          style={{ width: '72%', height: '72%', objectFit: 'contain' }}
        />
      </div>

      {/* 정보 영역 */}
      <div style={{ padding: '9px 11px' }}>
        <div style={{ color: 'white', fontWeight: 900, fontSize: sz.nameFz }}>{entry.koName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          {primaryType && (
            <span
              style={{
                background: getTypeBadgeColor(primaryType),
                color: 'white',
                fontSize: 9,
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              {TYPE_KO[primaryType] ?? primaryType}
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.44)', fontSize: 11, fontWeight: 700 }}>
            {entry.currentHp}/{entry.maxHp}
          </span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 6 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              width: `${hpPct * 100}%`,
              background: hpBarColor(entry.currentHp, entry.maxHp),
            }}
          />
        </div>
      </div>
    </div>
  );
}
