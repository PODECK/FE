'use client';

import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import type { PokemonData } from '@/shared/types/pokemon';
import { TYPE_CONFIG } from '../_constants/pokemon-type';

type Props = {
  pokemon: PokemonData;
  owned?: boolean;
  onClick?: () => void;
  isDeckMode?: boolean;
  isInDeck?: boolean;
  onAddToDeck?: (pokemon: PokemonData) => void;
  onRemoveFromDeck?: (dexId: number) => void;
};

export default function PokemonListCard({
  pokemon,
  owned = true,
  onClick,
  isDeckMode,
  isInDeck,
  onAddToDeck,
  onRemoveFromDeck,
}: Props) {
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
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('pokemonDexId', String(pokemon.dexId));
    e.dataTransfer.effectAllowed = 'copy';

    // 드래그 시 기본 고스트 이미지 제거
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    document.body.appendChild(canvas);
    e.dataTransfer.setDragImage(canvas, 0, 0);
    requestAnimationFrame(() => canvas.remove());

    window.dispatchEvent(new CustomEvent('pokemon-drag-start', { detail: pokemon }));
  };

  return (
    <div
      className="relative"
      draggable={isDeckMode && !isInDeck}
      onDragStart={isDeckMode && !isInDeck ? handleDragStart : undefined}
      style={{ cursor: isDeckMode && !isInDeck ? 'grab' : undefined }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`${pokemon.koName} 상세 보기`}
        className="flex w-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl shadow-sm transition-shadow select-none hover:shadow-md"
        style={{
          backgroundColor: 'var(--color-base-3)',
          borderWidth: '5px',
          borderStyle: 'solid',
          borderColor: isDeckMode && isInDeck ? '#ffca45' : '#f5f5f5',
          padding: '0 0 20px 0',
          transition: 'border-color 0.3s ease',
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
            draggable={false}
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
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{config.label}</span>
              </span>
            );
          })}
        </div>
      </button>

      {/* 덱 모드: 추가/제거 토글 버튼 */}
      {isDeckMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isInDeck) onRemoveFromDeck?.(pokemon.dexId);
            else onAddToDeck?.(pokemon);
          }}
          aria-label={isInDeck ? `${pokemon.koName} 덱에서 제거` : `${pokemon.koName} 덱에 추가`}
          className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          style={{
            backgroundColor: isInDeck ? 'var(--color-primary)' : 'white',
            borderColor: isInDeck ? 'var(--color-primary)' : '#DEDEDE',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          {isInDeck ? (
            <Check size={14} className="text-white" strokeWidth={2.5} />
          ) : (
            <Plus size={14} style={{ color: 'var(--color-primary)' }} strokeWidth={2.5} />
          )}
        </button>
      )}
    </div>
  );
}
