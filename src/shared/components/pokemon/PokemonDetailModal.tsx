'use client';

import { typeColorMap, typeIconMap, typeLabelMap } from '@/app/(main)/(start)/build-deck/_constants/pokemon-type';
import { getTypeEffectiveness, TYPE_CHART } from '../../../../data/type-chart';
import type { PokemonData, PokemonType } from '@/shared/types/pokemon';
import { X } from 'lucide-react';
import Image from 'next/image';

interface PokemonDetailModalProps {
  pokemon: PokemonData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PokemonDetailModal({ pokemon, isOpen, onClose }: PokemonDetailModalProps) {
  if (!isOpen || pokemon === null) return null;

  const weaknesses = (Object.keys(TYPE_CHART) as PokemonType[]).filter((attackType) => {
    return getTypeEffectiveness(attackType, pokemon.types) > 1;
  });

  const mainType = pokemon.types[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-0)]/60 px-4">
      {/* 뒤에 배경 흐리게 */}
      <article className="relative grid w-[800px] grid-cols-[240px_1fr] gap-15 rounded-[20px] border-4 border-[#999999] bg-[var(--color-secondary-2)] p-6">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-[#999999] transition"
        >
          <X size={36} strokeWidth={1.8} />
        </button>

        {/* 포켓몬 카드 뒷면 */}
        <div className="flex h-[390px] w-[260px] items-center justify-center self-center rounded-[12px] bg-[var(--color-secondary-2)] p-3 shadow-[0_0_16px_rgba(0,0,0,0.18)]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-sm">
            <Image
              src={`/images/pokemon-cards/${pokemon.dexId}.png`}
              alt={`${pokemon.koName} 카드`}
              width={260}
              height={390}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <section className="scrollbar-hide h-[390px] self-center overflow-y-auto pr-6">
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-bold text-[var(--color-base-0)]">{pokemon.koName}</h2>
            <span className="pb-1 text-base font-bold text-[#AAAAAA]">#{String(pokemon.dexId).padStart(3, '0')}</span>
          </div>

          <div className="mt-4 flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`flex h-6 w-16 items-center justify-center gap-1 rounded-full text-xs font-bold text-[var(--color-base-3)] ${
                  typeColorMap[type] ?? 'bg-gray-400'
                }`}
              >
                <Image src={typeIconMap[type]} alt="" width={14} height={14} className="shrink-0" />
                <span className="leading-none">{typeLabelMap[type] ?? type}</span>
              </span>
            ))}
          </div>

          <p className="text-body-sm mt-4 font-medium text-[#666666]">
            {pokemon.category} | 키 {pokemon.height}m | 몸무게 {pokemon.weight}kg
          </p>

          <p className="text-body-sm mt-4 rounded-lg bg-[#F9F9F9] px-4 py-5 leading-6 [word-break:keep-all] break-keep text-[#666666]">
            {pokemon.flavorText}
          </p>

          <dl className="text-body-sm mt-5 space-y-4">
            <div className="flex gap-6">
              <dt className="w-12 font-extrabold text-[#666666]">특성</dt>
              <dd className="space-y-1 break-keep text-[#666666]">{pokemon.ability.description}</dd>
            </div>

            <div className="flex gap-6">
              <dt className="w-12 font-extrabold text-[#666666]">약점</dt>
              <dd className="flex flex-wrap gap-2">
                {weaknesses.map((type) => (
                  <span
                    key={type}
                    className={`flex h-6 w-16 items-center justify-center gap-1 rounded-full text-xs font-bold text-[var(--color-secondary-2)] ${
                      typeColorMap[type] ?? 'bg-gray-400'
                    }`}
                  >
                    <Image src={typeIconMap[type]} alt="" width={14} height={14} className="shrink-0" />
                    <span className="leading-none">{typeLabelMap[type] ?? type}</span>
                  </span>
                ))}
              </dd>
            </div>

            <div className="flex gap-6">
              <dt className="w-12 font-extrabold text-[#666666]">스탯</dt>
              <dd className="ml-3 w-full space-y-1">
                <StatRow label="HP" value={pokemon.baseStats.hp} type={mainType} />
                <StatRow label="ATK" value={pokemon.baseStats.attack} type={mainType} />
                <StatRow label="DEF" value={pokemon.baseStats.defense} type={mainType} />
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </div>
  );
}

function StatRow({ label, value, type }: { label: string; value: number; type?: PokemonType }) {
  return (
    <div className="grid grid-cols-[36px_32px_1fr] items-center gap-3 text-xs text-[#666666]">
      <span className="font-extrabold">{label}</span>
      <span className="font-medium">{value}</span>
      <div className="h-2 rounded-full bg-[#ECECEC]">
        <div
          className={`h-2 rounded-full ${type ? typeColorMap[type] : 'bg-[var(--color-primary)]'}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
