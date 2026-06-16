import { newsCategoryLabels, newsCategoryStyles, type NewsCategory } from './newsData';

interface NewsCategoryBadgeProps {
  category: NewsCategory;
}

export default function NewsCategoryBadge({ category }: NewsCategoryBadgeProps) {
  const style = newsCategoryStyles[category];

  return (
    <span
      className="inline-flex h-5 w-[58px] items-center justify-center rounded-full text-[14px] font-extrabold"
      style={{ backgroundColor: style.background, color: style.text }}
    >
      {newsCategoryLabels[category]}
    </span>
  );
}
