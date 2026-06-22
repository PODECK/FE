// 기술 모달 중앙의 포켓몬 카드 미리보기
import Image from 'next/image';

import { getTypeBadgeColor, typeGradients } from '@/shared/constants/type-colors';
import type { PokemonType } from '@/shared/types/pokemon';
import { cn } from '@/shared/lib/cn';

import { CARD_H, CARD_W, SX, SY } from './skill-modal-constants';
import type { SkillModalData } from './skill-modal-types';

interface Props {
  data: SkillModalData;
  isVisible: boolean;
  isClosing: boolean;
}

const TYPE_BADGE_HEIGHT = 22 * SY;
const TYPE_BADGE_WIDTH = 100 * SX;
const TYPE_BADGE_ICON_SIZE = TYPE_BADGE_HEIGHT * 0.75;

export default function SkillPreviewCard({ data, isVisible, isClosing }: Props) {
  const primaryType = data.types[0] as PokemonType;
  const gradient = typeGradients[primaryType] ?? {
    from: 'var(--color-base-1)',
    to: 'var(--color-secondary-1)',
  };

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.dexId}.png`;

  const enName = data.enName
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={cn(
        'absolute top-[30%] left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-[250ms] ease-in-out',
        isVisible && !isClosing && 'opacity-100',
      )}
      style={{
        width: CARD_W,
        height: CARD_H,
        perspective: 700,
      }}
    >
      <div
        className={cn(
          'relative overflow-hidden transition-transform duration-[340ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isVisible ? 'rotate-y-[-10deg]' : 'rotate-y-0',
        )}
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: 12 * SX,
          background: `linear-gradient(180deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          boxShadow: '12px 20px 48px rgba(0,0,0,0.8), -4px 0 16px rgba(0,0,0,0.3)',
          transformOrigin: '0% 50%',
          transform: isVisible ? 'rotateY(-10deg)' : 'rotateY(0deg)',
        }}
      >
        <Image
          src="/sim.svg"
          alt=""
          aria-hidden={true}
          width={Math.round(210 * SX)}
          height={Math.round(210 * SX)}
          className="pointer-events-none absolute"
          style={{
            left: 78 * SX,
            top: -24 * SY,
          }}
        />

        <div
          className="absolute rounded-full bg-[var(--color-base-3)]"
          style={{
            width: 411 * SX,
            height: 319 * SY,
            left: (121.5 - 205.5) * SX,
            top: (306.5 - 159.5) * SY,
          }}
        />

        <Image
          src={spriteUrl}
          alt={data.koName}
          unoptimized
          width={Math.round(144 * SX)}
          height={Math.round(144 * SX)}
          className="absolute object-contain"
          style={{
            left: 50 * SX,
            top: 60 * SY,
          }}
        />

        <span
          className="absolute font-bold text-[var(--color-base-3)]"
          style={{
            left: 23 * SX,
            top: 12 * SY,
            fontSize: 14 * SY,
          }}
        >
          #{data.dexId}
        </span>

        <span
          className="absolute font-bold text-[var(--color-base-3)]"
          style={{
            right: (255 - 230) * SX,
            top: 17 * SY,
            fontSize: 14 * SY,
          }}
        >
          HP {data.hp}
        </span>

        <span
          className="absolute leading-none font-bold text-[var(--color-base-3)]"
          style={{
            left: 23 * SX,
            top: 39 * SY,
            fontSize: 24 * SY,
          }}
        >
          {data.koName}
        </span>

        <span
          className="absolute font-bold text-[var(--color-base-3)]/60"
          style={{
            left: 25 * SX,
            top: 63 * SY,
            fontSize: 13 * SY,
          }}
        >
          {enName}
        </span>

        <div
          className={cn('absolute right-0 left-0 flex', data.types.length === 1 ? 'justify-center' : 'justify-start')}
          style={{
            top: 207 * SY,
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
            <div
              key={index}
              className="absolute flex items-center bg-black/7"
              style={{
                left: 23 * SX,
                top: rowY * SY,
                width: 205 * SX,
                height: 20 * SY,
                borderRadius: 10 * SY,
              }}
            >
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: 10 * SX,
                  height: 10 * SX,
                  marginLeft: 10 * SX,
                  background: gradient.to,
                }}
              />

              <div
                className="shrink-0 rounded-full bg-[#d9d9d9]"
                style={{
                  width: 10 * SX,
                  height: 10 * SX,
                  marginLeft: 5 * SX,
                }}
              />

              <span
                className="font-bold text-[var(--color-base-0)]"
                style={{
                  marginLeft: 10 * SX,
                  fontSize: 12 * SY,
                }}
              >
                {move.koName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: TYPE_BADGE_WIDTH,
        height: TYPE_BADGE_HEIGHT,
        borderRadius: TYPE_BADGE_HEIGHT / 2,
        background: getTypeBadgeColor(type),
      }}
    >
      <Image
        src={`/images/pokemon-types/${type}.svg`}
        alt={type}
        width={Math.round(TYPE_BADGE_ICON_SIZE)}
        height={Math.round(TYPE_BADGE_ICON_SIZE)}
      />
    </div>
  );
}
