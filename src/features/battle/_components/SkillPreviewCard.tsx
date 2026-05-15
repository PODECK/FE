// 기술 모달 중앙의 포켓몬 카드 미리보기
import Image from 'next/image';

import { getTypeBadgeColor, typeGradients } from '@/shared/constants/type-colors';
import type { PokemonType } from '@/shared/types/pokemon';

import { CARD_H, CARD_W, SX, SY } from './skill-modal-constants';
import type { SkillModalData } from './skill-modal-types';

interface Props {
  data: SkillModalData;
  isVisible: boolean;
  isClosing: boolean;
}

export default function SkillPreviewCard({ data, isVisible, isClosing }: Props) {
  const primaryType = data.types[0] as PokemonType;
  const gradient = typeGradients[primaryType] ?? { from: 'var(--color-base-1)', to: 'var(--color-secondary-1)' };
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.dexId}.png`;
  const enName = data.enName
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: CARD_W,
        height: CARD_H,
        perspective: 700,
        opacity: isClosing ? 0 : isVisible ? 1 : 0,
        transition: 'opacity 250ms ease',
      }}
    >
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: 12 * SX,
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          boxShadow: '12px 20px 48px rgba(0,0,0,0.8), -4px 0 16px rgba(0,0,0,0.3)',
          transformOrigin: '0% 50%',
          transform: isVisible ? 'rotateY(-10deg)' : 'rotateY(0deg)',
          transition: 'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Image
          src="/sim.svg"
          alt=""
          aria-hidden={true}
          width={Math.round(210 * SX)}
          height={Math.round(210 * SX)}
          style={{ position: 'absolute', left: 78 * SX, top: -24 * SY, pointerEvents: 'none' }}
        />

        <div
          style={{
            position: 'absolute',
            width: 411 * SX,
            height: 319 * SY,
            left: (121.5 - 205.5) * SX,
            top: (306.5 - 159.5) * SY,
            background: 'white',
            borderRadius: '50%',
          }}
        />

        <Image
          src={spriteUrl}
          alt={data.koName}
          unoptimized
          width={Math.round(144 * SX)}
          height={Math.round(144 * SX)}
          style={{ position: 'absolute', left: 50 * SX, top: 60 * SY, objectFit: 'contain' }}
        />

        <span style={cardNumberStyle}>#{data.dexId}</span>
        <span style={hpStyle}>HP {data.hp}</span>
        <span style={koNameStyle}>{data.koName}</span>
        <span style={enNameStyle}>{enName}</span>

        <div
          style={{
            position: 'absolute',
            top: 207 * SY,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: data.types.length === 1 ? 'center' : 'flex-start',
            paddingLeft: data.types.length === 1 ? 0 : 23 * SX,
            gap: 5 * SX,
          }}
        >
          {data.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        {([242, 265, 288, 311] as const).map((rowY, index) => {
          const move = data.moves[index];
          if (!move) return null;

          return (
            <div key={index} style={{ ...cardMoveRowStyle, top: rowY * SY }}>
              <div style={{ ...moveDotStyle, background: gradient.to }} />
              <div style={{ ...moveDotStyle, background: '#D9D9D9', marginLeft: 5 * SX }} />
              <span style={cardMoveNameStyle}>{move.koName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const pillW = 100 * SX;
  const pillH = 22 * SY;
  const iconSize = pillH * 0.75;

  return (
    <div
      style={{
        width: pillW,
        height: pillH,
        borderRadius: pillH / 2,
        background: getTypeBadgeColor(type),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={`/images/pokemon-types/${type}.svg`}
        alt={type}
        width={Math.round(iconSize)}
        height={Math.round(iconSize)}
      />
    </div>
  );
}

const cardNumberStyle = {
  position: 'absolute',
  left: 23 * SX,
  top: 12 * SY,
  fontSize: 14 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
} as const;

const hpStyle = {
  position: 'absolute',
  right: (255 - 230) * SX,
  top: 17 * SY,
  fontSize: 14 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
} as const;

const koNameStyle = {
  position: 'absolute',
  left: 23 * SX,
  top: 39 * SY,
  fontSize: 24 * SY,
  fontWeight: 700,
  color: 'white',
  fontFamily: 'Roboto, sans-serif',
  lineHeight: 1,
} as const;

const enNameStyle = {
  position: 'absolute',
  left: 25 * SX,
  top: 63 * SY,
  fontSize: 13 * SY,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  fontFamily: 'Roboto, sans-serif',
} as const;

const cardMoveRowStyle = {
  position: 'absolute',
  left: 23 * SX,
  width: 205 * SX,
  height: 20 * SY,
  borderRadius: 10 * SY,
  background: 'rgba(0,0,0,0.07)',
  display: 'flex',
  alignItems: 'center',
} as const;

const moveDotStyle = {
  width: 10 * SX,
  height: 10 * SX,
  borderRadius: '50%',
  marginLeft: 10 * SX,
  flexShrink: 0,
} as const;

const cardMoveNameStyle = {
  marginLeft: 10 * SX,
  fontSize: 12 * SY,
  fontWeight: 700,
  color: '#212121',
  fontFamily: 'Roboto, sans-serif',
} as const;
