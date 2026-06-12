import Link from 'next/link';

import NewBadge from './NewBadge';
import NewsCategoryBadge from './NewsCategoryBadge';
import { newsItems, newsTabs, type NewsItem, type NewsTabValue } from './newsData';

interface NewsBoardProps {
  activeTab: NewsTabValue;
}

const filterNewsItems = (activeTab: NewsTabValue): NewsItem[] => {
  if (activeTab === 'all') {
    return newsItems;
  }

  return newsItems.filter((item) => item.category === activeTab);
};

export default function NewsBoard({ activeTab }: NewsBoardProps) {
  const filteredItems = filterNewsItems(activeTab);

  return (
    <section className="mx-auto w-full max-w-[1280px] py-12">
      <div className="mx-auto flex w-fit rounded-full bg-[#F7F7F7] p-1">
        {newsTabs.map((tab) => {
          const isActive = tab.value === activeTab;
          const href = tab.value === 'all' ? '/news' : `/news?category=${tab.value}`;

          return (
            <Link
              key={tab.value}
              href={href}
              className={`flex h-9 min-w-[86px] cursor-pointer items-center justify-center rounded-full text-sm font-bold transition ${
                isActive
                  ? 'bg-[var(--color-secondary-1)] text-[var(--color-base-3)]'
                  : 'text-[var(--color-base-1)] hover:text-[var(--color-base-0)]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden border-t border-[#E8E8E8]">
        <div className="grid grid-cols-[72px_minmax(0,1fr)_120px] bg-[#FAFAFA] px-7 py-4 text-sm font-extrabold text-[var(--color-base-0)]">
          <span className="text-center">구분</span>
          <span className="text-center">제목</span>
          <span className="text-center">작성일</span>
        </div>

        {filteredItems.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="grid cursor-pointer grid-cols-[72px_minmax(0,1fr)_120px] items-center border-b border-[#EEEEEE] px-7 py-4 transition hover:bg-[#FAFAFA]"
          >
            <div className="flex justify-center">
              <NewsCategoryBadge category={item.category} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <p className="ml-[100px] min-w-0 truncate text-base leading-none font-semibold text-[var(--color-base-0)]">
                {item.title}
              </p>

              {item.hasNewBadge && <NewBadge />}
            </div>

            <time className="text-center text-sm font-medium text-[var(--color-base-1)]">{item.date}</time>
          </Link>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled
          aria-label="이전 페이지"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CFCFCF] bg-[#CFCFCF] text-sm font-semibold text-[var(--color-base-3)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {'←'}
        </button>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-base-3)]">
          1
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-base-3)] text-sm font-semibold text-[var(--color-base-0)]">
          2
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-base-3)] text-sm font-semibold text-[var(--color-base-0)]">
          3
        </span>
        <button
          type="button"
          aria-label="다음 페이지"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-sm font-semibold text-[var(--color-base-3)]"
        >
          {'→'}
        </button>
      </div>
    </section>
  );
}
