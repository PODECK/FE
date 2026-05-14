type Props = {
  page: number;
  setPage: (value: number) => void;
  totalPages: number;
};

export default function Pagination({ page, setPage, totalPages }: Props) {
  const getPages = () => {
    const result: (number | string)[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    result.push(1);

    if (page > 4) result.push('...');

    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
      result.push(i);
    }

    if (page < totalPages - 3) result.push('...');

    result.push(totalPages);

    return result;
  };

  const pages = getPages();

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {/* 이전 버튼 */}
      <button
        aria-label="이전 페이지"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border disabled:opacity-30"
        style={{
          backgroundColor: 'var(--color-secondary-1)',
          color: 'var(--color-base-3)',
          borderColor: 'var(--color-secondary-1)',
        }}
      >
        {'←'}
      </button>
      {/* 페이지 번호 */}
      {pages.map((p, index) =>
        p === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center"
            style={{ color: 'var(--color-base-1)' }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p as number)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold"
            style={{
              backgroundColor: page === p ? 'var(--color-primary)' : 'var(--color-base-3)',
              color: page === p ? 'var(--color-base-3)' : 'var(--color-base-0)',
              borderColor: page === p ? 'var(--color-primary)' : 'var(--color-base-3)',
            }}
          >
            {p}
          </button>
        ),
      )}
      {/* 다음 버튼 */}
      <button
        aria-label="다음 페이지"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border disabled:opacity-30"
        style={{
          backgroundColor: 'var(--color-secondary-1)',
          color: 'var(--color-base-3)',
          borderColor: 'var(--color-secondary-1)',
        }}
      >
        {'→'}
      </button>
    </div>
  );
}
