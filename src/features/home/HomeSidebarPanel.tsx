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
    <section className={cn('bg-base-3 relative rounded-2xl p-5 shadow-lg', className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base-0 shrink-0 text-base font-extrabold">{title}</h2>
        <span className="text-xs font-extrabold whitespace-nowrap text-[#D6D6D6]">{badge}</span>
      </div>
      {children}
    </section>
  );
}
