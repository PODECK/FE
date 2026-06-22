import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import NewBadge from './NewBadge';
import NewsCategoryBadge from './NewsCategoryBadge';
import { latestHomeNewsItems } from './newsData';

export default function HomeNewsSection() {
  return (
    <section className="mt-6 rounded-[20px] bg-[var(--color-base-3)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold text-[var(--color-base-0)]">새소식</h2>
        <Link
          href="/news"
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-extrabold text-[var(--color-primary)] transition hover:opacity-80"
        >
          전체 보기
          <ArrowRight aria-hidden="true" size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-8">
        {latestHomeNewsItems.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.id}`}
            className="grid cursor-pointer grid-cols-[150px_minmax(0,1fr)] items-center gap-5 rounded-[14px] transition hover:opacity-85"
          >
            <Image
              src={item.thumbnailSrc}
              alt={`${item.title} 대표 이미지`}
              width={150}
              height={80}
              className="h-20 w-[150px] rounded-[10px] object-cover"
            />

            <div className="min-w-0">
              <NewsCategoryBadge category={item.category} />

              <div className="mt-1 flex min-w-0 items-center gap-2">
                <p className="min-w-0 truncate text-base font-extrabold text-[var(--color-base-0)]">{item.title}</p>
                {item.hasNewBadge && <NewBadge />}
              </div>

              <time className="mt-2 block text-sm font-medium text-[var(--color-base-1)]">{item.date}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
