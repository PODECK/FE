'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { SoundController } from '@/shared/components/SoundController';
import { cn } from '@/shared/lib/cn';

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
          isDark ? '' : 'border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-50',
        )}
        style={isDark ? { background: menuOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)' } : undefined}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label="설정"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span
          className={cn('text-[20px] leading-none', isDark ? 'text-white/75' : 'text-gray-600')}
          style={{ lineHeight: 1 }}
        >
          ⚙
        </span>
      </button>

      {menuOpen && (
        <div
          className={cn(
            'pointer-events-auto absolute top-[50px] z-50 overflow-hidden rounded-xl',
            align === 'right' ? 'right-0' : 'left-0',
            isDark
              ? 'w-[min(100vw-2rem,280px)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:w-[260px]'
              : 'w-[min(100vw-2rem,280px)] border border-gray-200 bg-white shadow-lg sm:w-[260px]',
          )}
          style={isDark ? { background: 'rgb(13,16,36)' } : undefined}
        >
          <SoundController tone={isDark ? 'dark' : 'light'} />
          {typeof menuFooter === 'function' ? menuFooter({ closeMenu: () => setMenuOpen(false) }) : menuFooter}
        </div>
      )}
    </div>
  );
}
