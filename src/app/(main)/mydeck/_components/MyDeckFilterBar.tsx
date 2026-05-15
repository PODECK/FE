'use client';

type MyDeckFilterBarProps = {
  pokemonCount: number;
  searchKeyword: string;
  onChangeSearchKeyword: (keyword: string) => void;
  onResetSearchKeyword: () => void;
};

export default function MyDeckFilterBar({
  pokemonCount,
  searchKeyword,
  onChangeSearchKeyword,
  onResetSearchKeyword,
}: MyDeckFilterBarProps) {
  return (
    <section className="mx-auto mt-4 max-w-[1150px] rounded-[20px] bg-[var(--color-base-2)]/40 p-5">
      <div className="flex items-center gap-3">
        <input
          type="search"
          value={searchKeyword}
          onChange={(event) => onChangeSearchKeyword(event.target.value)}
          onFocus={(event) => (event.currentTarget.style.borderColor = 'var(--color-primary)')}
          placeholder="포켓몬 이름을 입력하세요"
          className="h-10 flex-1 rounded-full border border-gray-200 px-4 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onResetSearchKeyword}
          className="h-10 rounded-full bg-gray-700 px-5 text-sm font-semibold text-[var(--color-base-3)]"
        >
          초기화
        </button>

        <p className="ml-auto text-sm text-gray-500">
          보유 <strong className="text-[var(--color-primary)]">{pokemonCount}</strong> 마리
        </p>
      </div>
    </section>
  );
}
