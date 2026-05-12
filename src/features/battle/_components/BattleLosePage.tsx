import HomeHeader from '@/shared/components/HomeHeader';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';
import Link from 'next/link';

export default function BattleLosePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F9F9F9] to-[#E1E1E1]">
      <HomeHeader />
      <SilhouetteBackground
        className="right-[-420px] bottom-[-450px] rotate-45 opacity-10 sm:right-[-300px] sm:bottom-[-400px]"
        imageClassName="h-[900px] w-[900px] sm:h-[1150px] sm:w-[1150px]"
      />
      <section className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        <div className="relative w-full max-w-[520px] rounded-[20px] bg-[var(--color-base-3)] px-10 py-12 text-center shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          <h1 className="mt-4 font-['NeoDunggeunmo'] text-5xl font-extrabold text-[var(--color-base-1)]">패배...</h1>
          {/* 해당 층수는 더미 데이터라 수정이 필요합니다! */}
          <p className="mt-4 text-sm font-medium text-[var(--color-base-1)]">10층에서 쓰러졌습니다</p>

          <div className="mt-8 rounded-[10px] border border-[#E2DDD7] bg-[var(--color-base-3)] px-5 py-4 text-left">
            <p className="text-center text-sm font-bold text-[var(--color-base-1)]">다시 도전하시겠습니까?</p>
          </div>

          {/* 밑에 들어가는 턴, 포켓못, 라이프도 더미 데이터기 때문에 수정 필요*/}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs font-medium text-[var(--color-base-1)]">
            <span>사용 턴: 5 </span>
            <span className="h-3 w-px bg-black/20" />
            <span>남은 포켓몬: 5/6</span>
            <span className="h-3 w-px bg-black/20" />
            <span>남은 라이프: 3/4</span>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/battle"
              className="flex h-11 min-w-[120px] items-center justify-center rounded-[10px] bg-[var(--color-base-0)] px-5 font-['NeoDunggeunmo'] text-sm font-bold text-[var(--color-base-3)]"
            >
              재도전
            </Link>
            {/* 다음 층 href 주소 수정 필요! */}
            <Link
              href="/home"
              className="flex h-11 min-w-[96px] items-center justify-center rounded-[10px] border border-black/10 bg-[var(--color-base-3)] px-5 font-['NeoDunggeunmo'] text-sm font-bold text-[var(--color-base-0)]"
            >
              홈으로
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
