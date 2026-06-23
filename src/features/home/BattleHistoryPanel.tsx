import Image from 'next/image';

import { homeBattleHistoryItem } from '@/app/(main)/home/_constants/home';
import type { BattleHistoryPokemon, HomeBattleHistoryItem } from '@/app/(main)/home/_types/home';
import Tooltip from '@/shared/components/Tooltip';
import { cn } from '@/shared/lib/cn';

function BattlePokemonSlot({ artworkUrl, koName }: BattleHistoryPokemon) {
  if (!artworkUrl) {
    return <div aria-hidden className="size-[30px] shrink-0 rounded-[3px] border border-[#d9d9d9]" />;
  }

  return (
    <div className="group relative shrink-0">
      <Tooltip
        text={koName}
        className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-1/2 z-10 w-max -translate-x-1/2 group-hover:visible"
      />
      <div className="size-[30px] overflow-hidden rounded-[3px] border border-[#d9d9d9]">
        <Image src={artworkUrl} alt={koName} width={30} height={30} className="h-full w-full object-contain" />
      </div>
    </div>
  );
}

function BattleHistoryRow({ item }: { item: HomeBattleHistoryItem }) {
  const isWin = item.result === 'WIN';

  return (
    <div className="flex w-full">
      <div
        className={cn(
          'flex max-h-15.5 w-[33px] shrink-0 items-center justify-center rounded-tl-lg rounded-bl-lg',
          isWin ? 'bg-[#e6f1ff]' : 'bg-[#ffeded]',
        )}
      >
        <span
          className={cn(
            '-rotate-90 text-[13px] leading-[1.4] font-bold tracking-[-0.325px] whitespace-nowrap',
            isWin ? 'text-[#4795ff]' : 'text-[#ff4747]',
          )}
        >
          {item.result}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-3 rounded-tr-lg rounded-br-lg border-t border-r border-b border-[#d9d9d9] py-2 pr-[15px] pl-[10px]">
        <div className="flex w-[190px] shrink-0 items-center gap-[10px]">
          <div className="relative size-11 shrink-0 opacity-80">
            <Image
              src={isWin ? '/images/home/action/battle-symbol-win.svg' : '/images/home/action/battle-symbol-defeat.svg'}
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[5px]">
            <p className="truncate text-[15px] leading-[1.4] font-semibold tracking-[-0.375px]">
              <span className="text-base-1">VS</span>
              <span className="text-base-0"> {item.opponentName}</span>
            </p>
            <p className="text-base-1 text-[13px] leading-[1.4] tracking-[-0.325px]">{item.floorName}</p>
          </div>
        </div>

        <div className="flex flex-1 justify-center gap-[6px]">
          {item.deckPokemons.map((pokemon, i) => (
            <BattlePokemonSlot key={i} artworkUrl={pokemon.artworkUrl} koName={pokemon.koName} />
          ))}
        </div>

        <p className="w-10 shrink-0 text-right text-[11px] leading-[1.4] tracking-[-0.275px] text-[#aaa]">
          {item.timeAgo}
        </p>
      </div>
    </div>
  );
}

export default function BattleHistoryPanel() {
  return (
    <section className="bg-base-3 min-h-[280px] overflow-clip rounded-[20px] px-[25px] py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base-0 text-base leading-[1.4] font-bold tracking-[-0.4px]">배틀 히스토리</h2>
        <p className="text-base-1 text-xs leading-[1.4] font-semibold tracking-[-0.3px]">최신 3건이 표시됩니다.</p>
      </div>

      {homeBattleHistoryItem.length === 0 ? (
        <div className="mt-5 flex min-h-[200px] items-center justify-center">
          <p className="text-base-1 text-sm">아직 배틀 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-col gap-[10px]">
          {homeBattleHistoryItem.map((item) => (
            <BattleHistoryRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
