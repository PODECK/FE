// 기술 선택과 확정 버튼 담당 하단 패널
import type { MoveInfo } from './skill-modal-types';
import { cn } from '@/shared/lib/cn';

interface Props {
  moves: MoveInfo[];
  selectedIndex: number | null;
  isVisible: boolean;
  isClosing: boolean;
  onSelectMove: (moveIndex: number | null) => void;
  onConfirmMove: () => void;
}

export default function SkillMovePanel({
  moves,
  selectedIndex,
  isVisible,
  isClosing,
  onSelectMove,
  onConfirmMove,
}: Props) {
  const selectedMove = selectedIndex !== null ? moves[selectedIndex] : null;
  const canConfirm = Boolean(selectedMove && selectedMove.pp > 0);

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className={cn(
        'absolute bottom-0 left-0 flex h-[166px] w-full items-start gap-4 rounded-t-[20px] bg-[rgba(13,16,26,1)] px-6 py-[14px]',
        'transition-transform duration-[380ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        !isClosing && isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]',
      )}
    >
      <div className="min-w-0 flex-1">
        <PanelTitle>기술 선택</PanelTitle>

        <div className="grid grid-cols-2 gap-2">
          {moves.map((move, index) => (
            <MoveButton
              key={index}
              move={move}
              index={index}
              isSelected={selectedIndex === index}
              onSelectMove={onSelectMove}
            />
          ))}
        </div>
      </div>

      <div className="flex w-[220px] shrink-0 flex-col pt-5">
        <PanelTitle>선택 확정</PanelTitle>

        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirmMove}
          className={cn(
            'h-12 w-full rounded-lg border-0 text-[15px] font-bold',
            canConfirm
              ? 'cursor-pointer bg-[var(--color-base-3)] text-[#0c0c16]'
              : 'cursor-not-allowed bg-[var(--color-base-3)]/15 text-[var(--color-base-3)]/35',
          )}
        >
          {selectedMove ? `${selectedMove.koName} 사용` : '기술을 선택하세요'}
        </button>

        <button
          type="button"
          onClick={() => onSelectMove(null)}
          className="mt-2 cursor-pointer border-0 bg-transparent text-[13px] text-[var(--color-base-3)]/55"
        >
          다시 선택
        </button>
      </div>
    </div>
  );
}

function MoveButton({
  move,
  index,
  isSelected,
  onSelectMove,
}: {
  move: MoveInfo;
  index: number;
  isSelected: boolean;
  onSelectMove: (moveIndex: number) => void;
}) {
  const isUsable = move.pp > 0;

  return (
    <button
      type="button"
      disabled={!isUsable}
      onClick={() => onSelectMove(index)}
      className={cn(
        'flex h-11 items-center gap-2.5 rounded px-2.5',
        isSelected ? 'border border-[var(--color-base-3)]/20 bg-[rgba(13,16,26,1)]' : 'border-0 bg-gray-200',
        isUsable ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-45',
      )}
    >
      <div
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
          isSelected ? 'bg-[var(--color-base-3)]' : 'bg-[rgba(13,16,26,1)]',
        )}
      >
        <span className={cn('text-[9px] font-medium', isSelected ? 'text-[#0d101a]' : 'text-[var(--color-base-3)]')}>
          {index + 1}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className={cn(
            'overflow-hidden text-[13px] font-bold text-ellipsis whitespace-nowrap',
            isSelected ? 'text-[var(--color-base-3)]' : 'text-[#0d101a]',
          )}
        >
          {move.koName}
        </span>

        <span className={moveMetaClassName(isSelected)}>
          {move.pp}/{move.maxPp}
        </span>
      </div>

      <div className="shrink-0 text-right">
        {move.power > 0 && (
          <div className={cn('text-xs font-medium', isSelected ? 'text-[var(--color-base-3)]' : 'text-[#0d101a]')}>
            위력 {move.power}
          </div>
        )}

        <div className={moveMetaClassName(isSelected)}>명중 {move.accuracy}%</div>
      </div>
    </button>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-xs font-bold text-[var(--color-base-3)]">{children}</div>;
}

function moveMetaClassName(isSelected: boolean) {
  return cn('shrink-0 text-[11px]', isSelected ? 'text-gray-300' : 'text-gray-500');
}
