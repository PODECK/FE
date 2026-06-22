interface DeckCopyButtonProps {
  onUseDeck: () => void;
  disabled: boolean;
}

export function DeckCopyButton({ onUseDeck, disabled }: DeckCopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onUseDeck}
      disabled={disabled}
      className="bg-primary text-base-3 flex h-8.5 w-full cursor-pointer items-center justify-center rounded-md px-5 text-sm leading-[1.4] font-bold tracking-tight transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    >
      덱 사용하기
    </button>
  );
}
