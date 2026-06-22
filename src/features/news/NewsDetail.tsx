import Image from 'next/image';
import Link from 'next/link';

import NewBadge from './NewBadge';
import NewsCategoryBadge from './NewsCategoryBadge';
import { newsItems, type NewsItem } from './newsData';

interface NewsDetailProps {
  item: NewsItem;
}

export default function NewsDetail({ item }: NewsDetailProps) {
  const relatedItems = newsItems.filter((newsItem) => newsItem.id !== item.id).slice(0, 5);

  return (
    <section className="mx-auto w-full max-w-[850px] py-10">
      <article className="border-y border-[#E8E8E8]">
        <header className="py-4">
          <div className="flex items-center gap-4">
            <NewsCategoryBadge category={item.category} />
            <h2 className="text-base font-extrabold text-[var(--color-base-0)]">{item.title}</h2>
          </div>

          <div className="mt-6 flex items-center justify-between border-y border-[#CCCCCC] pt-4 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#F5F5F5]">
                <Image src="/images/home/news/admin.webp" alt="" fill className="object-cover" />
              </span>

              <span className="text-sm leading-none font-medium text-[var(--color-base-0)]">Team ROCKET</span>
            </div>
            <time className="text-sm leading-none font-medium text-[var(--color-base-1)]">{item.date} 10:42</time>
          </div>
        </header>

        <div className="space-y-8 px-3 py-10 text-sm leading-relaxed text-[var(--color-base-0)]">
          <div className="space-y-3">
            {item.content.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="border-y border-[#E0E0E0] py-8">
            <h3 className="mb-5 font-extrabold">{item.content.summaryTitle}</h3>
            <ul className="space-y-2">
              {item.content.summaryItems.map((summaryItem) => (
                <li key={summaryItem}>{summaryItem}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            {item.content.closing.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>

      <div className="mt-6 flex justify-end">
        <Link
          href="/news"
          className="flex h-10 min-w-[78px] cursor-pointer items-center justify-center rounded-full bg-[var(--color-secondary-1)] px-5 text-sm font-extrabold text-white transition hover:opacity-90"
        >
          목록
        </Link>
      </div>

      <div className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[120px_minmax(0,1fr)_120px] bg-[#FAFAFA] px-6 py-4 text-[15px] font-extrabold text-[var(--color-base-0)]">
          <span className="inline-flex w-[58px] justify-center">구분</span>
          <span className="text-center">제목</span>
          <span className="inline-flex w-[72px] justify-center justify-self-end">작성일</span>
        </div>

        {relatedItems.map((newsItem) => (
          <Link
            key={newsItem.id}
            href={`/news/${newsItem.id}`}
            className="grid cursor-pointer grid-cols-[120px_minmax(0,1fr)_120px] items-center border-b border-[#EEEEEE] px-6 py-4 transition hover:bg-[#FAFAFA]"
          >
            <div className="flex w-[58px] justify-center">
              <NewsCategoryBadge category={newsItem.category} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <p className="min-w-0 truncate text-[16px] leading-none font-semibold text-[var(--color-base-0)]">
                {newsItem.title}
              </p>

              {newsItem.hasNewBadge && <NewBadge />}
            </div>

            <time className="inline-flex w-[72px] justify-center justify-self-end text-[12px] font-medium text-[var(--color-base-1)]">
              {newsItem.date}
            </time>
          </Link>
        ))}
      </div>
    </section>
  );
}
