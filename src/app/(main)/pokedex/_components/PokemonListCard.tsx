'use client';

import Image from 'next/image';
import type { PokemonData } from '@/shared/types/pokemon';
import { TYPE_CONFIG } from '../_constants/pokemon-type';

type Props = {
  pokemon: PokemonData;
  owned?: boolean;
  onClick?: () => void;
};

export default function PokemonListCard({ pokemon, owned = true, onClick }: Props) {
  const primaryType = pokemon.types?.[0];
  const typeConfig = primaryType ? TYPE_CONFIG[primaryType] : null;
  const dexIdStr = String(pokemon.dexId).padStart(3, '0');

  // 미획득 카드
  if (!owned) {
    return (
      <div
        className="flex w-full flex-col items-center overflow-hidden rounded-2xl shadow-sm select-none"
        style={{
          background: 'linear-gradient(180deg, #E4E4E4 0%, #E4E4E4 0%, white 50%)',
          border: '5px solid #f5f5f5',
          padding: '0 0 20px 0',
        }}
      >
        <div className="mb-1 flex w-full items-center justify-center" style={{ height: '140px' }}>
          <Image
            src="/images/pokedex/lock-icon.svg"
            alt="미획득 포켓몬"
            width={89}
            height={89}
            style={{ opacity: 0.3 }}
            unoptimized
          />
        </div>
        {/* 개체번호 */}
        <p className="font-mono text-xs font-semibold" style={{ color: 'var(--color-base-1)' }}>
          #{dexIdStr}
        </p>
        {/* 이름 */}
        <p className="mb-2 text-xl font-extrabold" style={{ color: 'var(--color-base-0)' }}>
          ???
        </p>
        {/* 속성 */}
        <span
          className="flex items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: '#E2E2E2', color: '#939393', width: '60px', height: '22px' }}
        >
          속성
        </span>
      </div>
    );
  }

  // 획득 카드
  return (
    <div
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl shadow-sm transition-shadow select-none hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-base-3)',
        border: '5px solid #f5f5f5',
        padding: '0 0 20px 0',
      }}
    >
      {/* 이미지 영역 */}
      <div
        className="mb-1 flex w-full items-center justify-center"
        style={{
          height: '140px',
          background: typeConfig?.gradient ?? 'var(--color-base-2)',
        }}
      >
        <Image
          src={pokemon.artworkUrl}
          alt={pokemon.koName}
          width={110}
          height={110}
          className="object-contain drop-shadow-md"
        />
      </div>

      {/* 개체번호 */}
      <p className="font-mono text-xs font-semibold" style={{ color: 'var(--color-base-1)' }}>
        #{dexIdStr}
      </p>
      {/* 이름 */}
      <p className="mb-2 text-xl font-extrabold" style={{ color: 'var(--color-base-0)' }}>
        {pokemon.koName}
      </p>
      {/* 속성 */}
      <div className="flex flex-wrap justify-center" style={{ gap: '5px' }}>
        {pokemon.types.map((type) => {
          const config = TYPE_CONFIG[type];
          if (!config) return null;
          return (
            <span
              key={type}
              className="flex items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
              style={{
                width: '60px',
                height: '22px',
                gap: '3px',
                backgroundColor: config.color,
              }}
            >
              <Image
                src={config.icon}
                alt={config.label}
                width={12}
                height={12}
                className="flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>{config.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
