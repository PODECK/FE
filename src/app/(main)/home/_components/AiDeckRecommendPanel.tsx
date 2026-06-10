import HomeSidebarPanel from '@/app/(main)/home/_components/HomeSidebarPanel';

export default function AiDeckRecommendPanel() {
  return (
    <HomeSidebarPanel title="AI 추천 덱" badge="DECK ASSIST" className="min-h-138.75">
      <p className="mt-4 text-sm font-semibold text-[var(--color-base-1)]">AI 덱 구성 영역</p>
    </HomeSidebarPanel>
  );
}
