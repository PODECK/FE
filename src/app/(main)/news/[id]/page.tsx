import { notFound, redirect } from 'next/navigation';

import { getTrainerSummary } from '@/entities/trainer/api/trainerApi';
import NewsDetail from '@/features/news/NewsDetail';
import NewsHero from '@/features/news/NewsHero';
import { getNewsItemById, newsItems } from '@/features/news/newsData';
import HomeHeader from '@/shared/components/HomeHeader';

interface NewsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return newsItems.map((item) => ({
    id: item.id,
  }));
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [{ id }, trainer] = await Promise.all([params, getTrainerSummary()]);

  if (!trainer) {
    redirect('/');
  }

  const item = getNewsItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-[var(--color-base-3)] text-[var(--color-base-0)]">
      <HomeHeader nickname={trainer.nickname} avatarUrl={trainer.avatarUrl} />
      <NewsHero />
      <NewsDetail item={item} />
    </main>
  );
}
