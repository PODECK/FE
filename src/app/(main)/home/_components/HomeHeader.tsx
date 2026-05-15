// 홈 화면 상단 헤더 — 로고 + 네비게이션

import Image from 'next/image';
import Link from 'next/link';

import { homeNavItems } from '../_constants/home';

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4">
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

        <nav className="hidden items-center gap-4 md:flex">
          {homeNavItems.map((item) => {
            const isActive = item.id === 'home';
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex h-12 min-w-[112px] items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition ${
                  isActive ? 'bg-[#FFFFFF] text-[#999999]' : 'text-[#9999999] hover:bg-[#F1F1F1] hover:text-[#999999]'
                }`}
              >
                <Icon aria-hidden="true" className="text-xl" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
