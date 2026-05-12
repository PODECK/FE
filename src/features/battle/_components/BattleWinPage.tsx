import HomeHeader from '@/shared/components/HomeHeader';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';
import Link from 'next/link';

export default function BattleWinPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F9F9F9] to-[#E1E1E1]">
      <HomeHeader />
      <SilhouetteBackground
        className="right-[-420px] bottom-[-450px] rotate-45 opacity-20 sm:right-[-370px] sm:bottom-[-500px]"
        imageClassName="h-[1200px] w-[1200px] sm:h-[1300px] sm:w-[1300px]"
      />

      <section className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        <div className="relative w-full max-w-[520px] rounded-[20px] bg-[var(--color-base-3)] px-10 py-12 text-center shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          <h1 className="mt-4 font-['NeoDunggeunmo'] text-5xl font-extrabold text-[var(--color-base-0)]">승리!</h1>
          {/* 해당 층수는 더미 데이터라 수정이 필요합니다! */}
          <p className="mt-4 text-sm font-medium text-[var(--color-base-1)]">10층을 클리어했습니다!</p>

          <div className="mt-8 rounded-[10px] border border-[#E2DDD7] bg-[#F4F1EC] px-5 py-4 text-left">
            <p className="text-sm font-bold text-[var(--color-base-1)]">획득 보상</p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-[var(--color-base-0)]">
              <li>💳 카드팩 +1개</li>
            </ul>
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
              다음 층으로
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
