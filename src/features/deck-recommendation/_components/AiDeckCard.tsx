'use client';

import Image from 'next/image';

import { cn } from '@/shared/lib/cn';
import Tooltip from '@/shared/components/Tooltip';
import { DeckCopyButton } from '@/shared/components/DeckCopyButton';

const DEFAULT_SLOT_COUNT = 6;

type DeckSlot = {
  artworkUrl: string;
  koName: string;
};

interface AiDeckCardProps {
  badge?: string;
  title: string;
  description: string;
  deck: DeckSlot[];
  slotCount?: number;
  onUseDeck?: () => void;
  disabled?: boolean;
  className?: string;
}

function DeckPokemonSlot({ artworkUrl, koName }: DeckSlot) {
  const slotClassName = cn('bg-base-3 shrink-0 overflow-hidden rounded-sm border border-[#DBDBDB] h-8.25 w-8.5');

  if (!artworkUrl) {
    return <div aria-hidden className={slotClassName} />;
  }

  return (
    <div className="group relative shrink-0">
      <Tooltip
        text={koName}
        className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-1/2 z-10 w-max -translate-x-1/2 group-hover:visible"
      />
      <div className={slotClassName}>
        <Image src={artworkUrl} alt={koName} width={34} height={34} className="h-full w-full object-contain" />
      </div>
    </div>
  );
}

export default function AiDeckCard({
  badge = '추천',
  title,
  description,
  deck,
  slotCount = deck.length || DEFAULT_SLOT_COUNT,
  onUseDeck,
  disabled = false,
  className,
}: AiDeckCardProps) {
  const slots = Array.from({ length: slotCount }, (_, index) => {
    const isEdge = index === 0 || index === slotCount - 1;
    const pokemon = deck[index];
    return {
      id: index,
      wide: isEdge,
      artworkUrl: pokemon?.artworkUrl ?? '',
      koName: pokemon?.koName ?? '',
    };
  });

  return (
    <article className={cn('flex flex-col gap-2.5 rounded-xl bg-[#F9F9F9] px-3 py-3', className)}>
      <div className="flex gap-2.5">
        <span className="bg-base-3 text-primary flex h-5 w-10.5 shrink-0 items-center justify-center rounded-full px-1.5 text-sm leading-[1.4] font-bold tracking-tight">
          {badge}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base-0 text-base leading-[1.4] font-bold tracking-tight">{title}</h3>
          <p className="text-base-1 truncate text-sm leading-[1.4] tracking-tight">{description}</p>
        </div>
      </div>

      <div className="flex h-8.25 items-center justify-start gap-1.25 overflow-visible">
        {slots.map((slot) => (
          <DeckPokemonSlot key={slot.id} artworkUrl={slot.artworkUrl} koName={slot.koName} />
        ))}
      </div>

      <DeckCopyButton onUseDeck={onUseDeck ?? (() => {})} disabled={disabled} />
    </article>
  );
}
