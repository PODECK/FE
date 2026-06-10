import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

interface HomeSidebarPanelProps {
  title: string;
  badge: string;
  className?: string;
  children: ReactNode;
}

export default function HomeSidebarPanel({ title, badge, className, children }: HomeSidebarPanelProps) {
  return (
    <section className={cn('rounded-5 relative bg-[var(--color-base-3)] p-5 shadow-lg', className)}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="shrink-0 text-base font-extrabold text-[var(--color-base-0)]">{title}</h2>
        <span className="text-xs font-extrabold whitespace-nowrap text-[#D6D6D6]">{badge}</span>
      </div>
      {children}
    </section>
  );
}
