'use client';

import Image from 'next/image';
import Link from 'next/link';

import { homeNavItems } from '@/app/(main)/home/_constants/home';
import TrainerProfileMenu from '@/features/trainer/_components/TrainerProfileMenu';
import { SoundSettingsDropdown } from '@/shared/components/SoundSettingsDropdown';
import { cn } from '@/shared/lib/cn';
import { usePathname } from 'next/navigation';

type HomeHeaderProps = {
  nickname?: string;
  avatarUrl?: string | null;
};

export default function HomeHeader({ nickname, avatarUrl }: HomeHeaderProps) {
  const pathName = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-base-0)]/5 bg-[var(--color-base-3)]/95 shadow-sm backdrop-blur">
      <div className="relative mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-4">
        <Link href="/home" className="flex items-center">
          <Image
            src="/images/podeck-logo.svg"
            alt="PODECK"
            width={220}
            height={54}
            className="h-auto w-[180px]"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 md:flex">
            {homeNavItems.map((item) => {
              const isActive = pathName === item.href || pathName.startsWith(`${item.href}/`);
              const isBattle = item.id === 'battle';
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex h-12 min-w-[112px] items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition',
                    isBattle
                      ? 'bg-[var(--color-primary)] font-bold text-[var(--color-secondary-2)] shadow-[0_8px_18px_rgba(255,178,26,0.28)] hover:opacity-90 hover:shadow-[0_10px_22px_rgba(255,178,26,0.36)]'
                      : isActive
                        ? 'bg-[var(--color-base-3)] text-[var(--color-base-1)]'
                        : 'text-[var(--color-base-1)] hover:bg-[var(--color-base-2)] hover:text-[var(--color-base-1)]',
                  )}
                >
                  <Icon aria-hidden="true" className="text-xl" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <SoundSettingsDropdown theme="light" className="shrink-0" />
          {nickname && (
            <>
              <div className="h-8 w-px bg-[#E5E5E5]" />
              <TrainerProfileMenu nickname={nickname} avatarUrl={avatarUrl} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
