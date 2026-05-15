// 기술 모달 중앙의 포켓몬 카드 미리보기
import Image from 'next/image';

import { getTypeBadgeColor, typeGradients } from '@/shared/constants/type-colors';
import type { PokemonType } from '@/shared/types/pokemon';

import { SX } from './skill-modal-constants';
import {
  cardMoveNameStyle,
  cardNumberStyle,
  centerCircleStyle,
  createCardFrameStyle,
  createMoveRowStyle,
  createPreviewShellStyle,
  createTypeBadgeStyle,
  createTypeListStyle,
  decorationImageStyle,
  enNameStyle,
  hpStyle,
  koNameStyle,
  moveDotStyle,
  mutedMoveDotStyle,
  pokemonImageStyle,
  typeBadgeIconSize,
} from './styles/skill-preview-card.style';
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
    <div onClick={(event) => event.stopPropagation()} style={createPreviewShellStyle(isVisible, isClosing)}>
      <div style={createCardFrameStyle(gradient, isVisible)}>
        <Image
          src="/sim.svg"
          alt=""
          aria-hidden={true}
          width={Math.round(210 * SX)}
          height={Math.round(210 * SX)}
          style={decorationImageStyle}
        />

        <div style={centerCircleStyle} />

        <Image
          src={spriteUrl}
          alt={data.koName}
          unoptimized
          width={Math.round(144 * SX)}
          height={Math.round(144 * SX)}
          style={pokemonImageStyle}
        />

        <span style={cardNumberStyle}>#{data.dexId}</span>
        <span style={hpStyle}>HP {data.hp}</span>
        <span style={koNameStyle}>{data.koName}</span>
        <span style={enNameStyle}>{enName}</span>

        <div style={createTypeListStyle(data.types.length)}>
          {data.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>

        {([242, 265, 288, 311] as const).map((rowY, index) => {
          const move = data.moves[index];
          if (!move) return null;

          return (
            <div key={index} style={createMoveRowStyle(rowY)}>
              <div style={{ ...moveDotStyle, background: gradient.to }} />
              <div style={mutedMoveDotStyle} />
              <span style={cardMoveNameStyle}>{move.koName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <div style={createTypeBadgeStyle(getTypeBadgeColor(type))}>
      <Image
        src={`/images/pokemon-types/${type}.svg`}
        alt={type}
        width={Math.round(typeBadgeIconSize)}
        height={Math.round(typeBadgeIconSize)}
      />
    </div>
  );
}
