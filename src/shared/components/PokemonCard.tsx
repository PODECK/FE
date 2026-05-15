// 포켓몬 카드 컴포넌트 - 타입별 그라디언트 배경과 PokeAPI 데이터 표시

import Image from 'next/image';
import type { PokemonData } from '@/shared/types/pokemon';
import { typeGradients } from '@/shared/constants/type-colors';

// card.svg 기준 치수
const CARD_W = 271;
const CARD_H = 371;

interface Props {
  pokemon: PokemonData;
  moveNames: string[]; // 한국어 기술명 최대 4개
}

export default function PokemonCard({ pokemon, moveNames }: Props) {
  const primaryType = pokemon.types[0];
  const { from, to } = typeGradients[primaryType];
  const displayMoves = moveNames.slice(0, 4);

  return (
    <div
      className="relative overflow-hidden rounded-[13px] shadow-xl select-none"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* 타입별 그라디언트 배경 */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }} />

      {/* 하단 흰색 타원 — card.svg 동일 수치 */}
      <svg className="pointer-events-none absolute inset-0" width={CARD_W} height={CARD_H} aria-hidden="true">
        <ellipse cx="129.5" cy="314.5" rx="205.5" ry="159.5" fill="white" fillOpacity="0.96" />
      </svg>

      {/* 타입 워터마크 (우상단, 매우 투명) */}
      <div
        className="pointer-events-none absolute"
        style={{ right: -14, top: -16, width: 210, height: 212, opacity: 0.1 }}
        aria-hidden="true"
      >
        <Image src={`/images/pokemon-types/${primaryType}.svg`} alt="" width={210} height={210} />
      </div>

      {/* 상단 헤더: 번호 (좌) + HP (우) — card.svg 텍스트 y≈52 기준 */}
      <div className="absolute z-10 flex items-center justify-between" style={{ top: 36, left: 16, right: 16 }}>
        <span className="font-['Pixelify_Sans'] text-[13px] font-bold text-white drop-shadow">
          No.{String(pokemon.dexId).padStart(4, '0')}
        </span>
        <span className="font-['Pixelify_Sans'] text-[13px] font-bold text-white drop-shadow">
          HP {pokemon.baseStats.hp}
        </span>
      </div>

      {/* 포켓몬 공식 아트워크 — card.svg rect 좌표 그대로 */}
      <div className="absolute z-10" style={{ left: 58, top: 68, width: 144, height: 144 }}>
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.dexId}.png`}
          alt={pokemon.koName}
          fill
          className="object-contain drop-shadow-lg"
          unoptimized
        />
      </div>

      {/* 타입 뱃지 — 스프라이트 하단 10px 아래, 속성 1개면 중앙 */}
      <div className="absolute z-10 flex justify-center gap-2" style={{ top: 224, left: 0, right: 0 }}>
        {pokemon.types.map((type) => (
          <div key={type} className="h-7.5 w-7.5">
            <Image src={`/images/pokemon-types/${type}.svg`} alt={type} width={30} height={30} />
          </div>
        ))}
      </div>

      {/* 이름: 한국어 (대) + 영문 (소) */}
      <div className="absolute z-10 text-center" style={{ top: 261, left: 12, right: 12 }}>
        <p className="font-['Pixelify_Sans'] text-[18px] leading-tight font-bold text-gray-800">{pokemon.koName}</p>
        <p className="mt-0.75 font-['Pixelify_Sans'] text-[11px] tracking-wider text-gray-500 capitalize">
          {pokemon.enName}
        </p>
      </div>

      {/* 기술 목록 (최대 4개) */}
      <div className="absolute z-10" style={{ top: 304, left: 20, right: 20 }}>
        {displayMoves.map((moveName, i) => (
          <div key={i} className="flex items-center gap-1.5 font-['Pixelify_Sans'] text-[11px] leading-4 text-gray-700">
            <span className="text-[8px] text-gray-400">▸</span>
            {moveName}
          </div>
        ))}
      </div>
    </div>
  );
}
