'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, GripVertical } from 'lucide-react';
import type { PokemonData } from '@/shared/types/pokemon';

const MAX_DECK_SIZE = 6;

type Props = {
  deckPokemons: PokemonData[];
  onRemove: (dexId: number) => void;
  onAdd: (dexId: number) => void;
  onReorder: (dexIds: number[]) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function DeckSidePanel({ deckPokemons, onRemove, onAdd, onReorder, onClear, onClose }: Props) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const slots = Array.from({ length: MAX_DECK_SIZE }, (_, i) => deckPokemons[i] ?? null);

  const handleSlotDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('deckSlotIndex', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDragSourceIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number, pokemon: PokemonData | null) => {
    const isInternal = e.dataTransfer.types.includes('deckslotindex');
    if (isInternal) {
      if (dragSourceIndex === index) return;
    } else {
      if (pokemon) return;
    }
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDragSourceIndex(null);

    const slotIndexStr = e.dataTransfer.getData('deckSlotIndex');
    if (slotIndexStr !== '') {
      const sourceIdx = Number(slotIndexStr);
      if (sourceIdx === index) return;
      const newSlots = [...slots];
      [newSlots[sourceIdx], newSlots[index]] = [newSlots[index], newSlots[sourceIdx]];
      onReorder(newSlots.filter((p): p is PokemonData => p !== null).map((p) => p.dexId));
      return;
    }

    const dexId = Number(e.dataTransfer.getData('pokemonDexId'));
    if (dexId && !slots[index]) onAdd(dexId);
  };

  return (
    <div className="flex flex-col rounded-3xl bg-[#f9f9f9]" style={{ width: '280px', padding: '20px' }}>
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black" style={{ color: 'var(--color-base-0)' }}>
            내 덱 관리
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-base-1)' }}>
            {deckPokemons.length} / {MAX_DECK_SIZE}
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={deckPokemons.length === 0}
          className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-opacity duration-150 disabled:cursor-default disabled:opacity-30"
          style={{ backgroundColor: '#E8E8E8', color: 'var(--color-base-1)' }}
          aria-label="덱 초기화"
        >
          초기화
        </button>
      </div>

      {/* 팁 */}
      <p className="mb-3 text-xs" style={{ color: '#BDBDBD' }}>
        드래그하거나 + 버튼을 눌러 덱을 편집하세요.
      </p>

      {/* 슬롯 */}
      <div className="flex flex-col gap-2">
        {slots.map((pokemon, index) => (
          <div
            key={pokemon?.dexId ?? `empty-${index}`}
            className="group flex items-center gap-1 rounded-xl transition-colors duration-150"
            draggable={!!pokemon}
            onDragStart={pokemon ? (e) => handleSlotDragStart(e, index) : undefined}
            onDragEnd={() => {
              setDragSourceIndex(null);
              setDragOverIndex(null);
            }}
            data-deck-slot={pokemon ? undefined : 'true'}
            onDragOver={(e) => handleDragOver(e, index, pokemon)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              padding: '10px 12px',
              minHeight: '56px',
              cursor: pokemon ? 'grab' : 'default',
              backgroundColor: dragOverIndex === index ? 'rgba(255, 180, 29, 0.08)' : 'var(--color-base-3)',
              border:
                dragOverIndex === index
                  ? '1.5px dashed var(--color-primary)'
                  : dragSourceIndex === index
                    ? '1.5px dashed #BDBDBD'
                    : pokemon
                      ? '1px solid #ffca45'
                      : '1px solid #EFEFEF',
              opacity: dragSourceIndex === index ? 0.4 : 1,
            }}
          >
            <span className="shrink-0 text-sm font-bold" style={{ color: 'var(--color-base-1)', width: '18px' }}>
              {String(index + 1).padStart(2, '0')}
            </span>

            {pokemon ? (
              <div className="flex flex-1 items-center gap-1">
                <GripVertical
                  size={14}
                  className="shrink-0 opacity-30 transition-opacity duration-150 group-hover:opacity-60"
                  style={{ color: 'var(--color-base-1)' }}
                />
                <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
                  <Image
                    src={pokemon.spriteUrl || pokemon.artworkUrl}
                    alt={pokemon.koName}
                    fill
                    className="object-contain"
                    draggable={false}
                  />
                </div>
                <span className="flex-1 text-base font-semibold" style={{ color: 'var(--color-base-0)' }}>
                  {pokemon.koName}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(pokemon.dexId)}
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full"
                  style={{ backgroundColor: '#EFEFEF' }}
                  aria-label={`${pokemon.koName} 제거`}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Plus
                  size={16}
                  style={{ color: dragOverIndex === index ? 'var(--color-primary)' : '#BDBDBD' }}
                  className="shrink-0"
                />
                <span
                  className="text-sm"
                  style={{ color: dragOverIndex === index ? 'var(--color-primary)' : '#BDBDBD' }}
                >
                  {dragOverIndex === index ? '여기에 놓기' : '카드 추가'}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 완료 */}
      <button
        type="button"
        onClick={onClose}
        className="mt-5 cursor-pointer rounded-full py-3 text-base font-bold text-white transition-opacity duration-200"
        style={{ backgroundColor: 'var(--color-primary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        편성 완료
      </button>
    </div>
  );
}
