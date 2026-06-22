import { redirect } from 'next/navigation';

import { getTrainerSummary } from '@/entities/trainer/api/trainerApi';
import NewsBoard from '@/features/news/NewsBoard';
import NewsHero from '@/features/news/NewsHero';
import { isNewsTabValue } from '@/features/news/newsData';
import HomeHeader from '@/shared/components/HomeHeader';

interface NewsPageProps {
  searchParams?: Promise<{
    category?: string;
  }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const [trainer, params] = await Promise.all([getTrainerSummary(), searchParams]);

  if (!trainer) {
    redirect('/');
  }

  const activeTab = isNewsTabValue(params?.category) ? params.category : 'all';

  return (
    <main className="min-h-dvh bg-[var(--color-base-3)] text-[var(--color-base-0)]">
      <HomeHeader nickname={trainer.nickname} avatarUrl={trainer.avatarUrl} />
      <NewsHero />
      <NewsBoard activeTab={activeTab} />
    </main>
  );
}
