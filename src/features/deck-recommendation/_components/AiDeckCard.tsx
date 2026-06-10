'use client';

import { cn } from '@/shared/lib/cn';

const DEFAULT_SLOT_COUNT = 6;

interface AiDeckCardProps {
  badge?: string;
  title: string;
  description: string;
  slotCount?: number;
  onUseDeck?: () => void;
  disabled?: boolean;
  className?: string;
}

function DeckPokemonSlot({ wide = false }: { wide?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'shrink-0 rounded-sm border border-[#DBDBDB] bg-[var(--color-base-3)]',
        wide ? 'h-8.25 w-9' : 'h-8.25 w-8.5',
      )}
    />
  );
}

export default function AiDeckCard({
  badge = '추천',
  title,
  description,
  slotCount = DEFAULT_SLOT_COUNT,
  onUseDeck,
  disabled = false,
  className,
}: AiDeckCardProps) {
  const slots = Array.from({ length: slotCount }, (_, index) => {
    const isEdge = index === 0 || index === slotCount - 1;
    return { id: index, wide: isEdge };
  });

  return (
    <article className={cn('flex flex-col gap-3.75 rounded-xl bg-[#F9F9F9] px-3 py-3.75', className)}>
      <div className="flex gap-2.5">
        <span className="bg-base-3 text-primary flex h-5 w-10.5 shrink-0 items-center justify-center rounded-full px-1.5 text-sm leading-[1.4] font-bold tracking-tight">
          {badge}
        </span>

        <div className="flex min-w-0 flex-col gap-1.25">
          <h3 className="text-base-0 text-base leading-[1.4] font-bold tracking-tight">{title}</h3>
          <p className="text-base-1 max-w-45 text-sm leading-[1.4] font-semibold tracking-tight">{description}</p>
        </div>
      </div>

      <div className="flex h-8.25 items-center justify-between">
        {slots.map((slot) => (
          <DeckPokemonSlot key={slot.id} wide={slot.wide} />
        ))}
      </div>

      <button
        type="button"
        onClick={onUseDeck}
        disabled={disabled}
        className="bg-primary text-base-3 flex h-8.75 w-full items-center justify-center rounded-md px-5 text-sm leading-[1.4] font-bold tracking-tight transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        덱 사용하기
      </button>
    </article>
  );
}
