'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { SoundController } from '@/shared/components/SoundController';
import { cn } from '@/shared/lib/cn';
import { Music4 } from 'lucide-react';

export type SoundSettingsTheme = 'dark' | 'light';

export type SoundSettingsMenuFooter = ReactNode | ((ctx: { closeMenu: () => void }) => ReactNode);

export interface SoundSettingsDropdownProps {
  theme?: SoundSettingsTheme;
  className?: string;
  align?: 'right' | 'left';
  menuFooter?: SoundSettingsMenuFooter;
}

export function SoundSettingsDropdown({
  theme = 'dark',
  className,
  align = 'right',
  menuFooter,
}: SoundSettingsDropdownProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isDark = theme === 'dark';

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-0',
          isDark
            ? menuOpen
              ? 'bg-base-3/18'
              : 'bg-base-3/10'
            : menuOpen
              ? 'bg-[var(--color-base-2)] transition'
              : 'border-base-2 bg-[var(--color-base-3)] transition hover:bg-[var(--color-base-2)]',
        )}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label="설정"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <Music4 className="text-[var(--color-base-0)]" />
      </button>

      {menuOpen && (
        <div
          className={cn(
            'pointer-events-auto absolute top-[50px] z-50 w-[min(100vw-2rem,280px)] overflow-hidden rounded-xl shadow-[0_8px_24px_var(--color-dimmed)] sm:w-[260px]',
            align === 'right' ? 'right-0' : 'left-0',
            isDark ? 'bg-battle-panel' : 'bg-[var(--color-base-3)]',
          )}
        >
          <SoundController tone={isDark ? 'dark' : 'light'} />
          {typeof menuFooter === 'function' ? menuFooter({ closeMenu: () => setMenuOpen(false) }) : menuFooter}
        </div>
      )}
    </div>
  );
}
