import NicknameStep from '@/components/start/NicknameStep';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFD45E] to-[#F6B400]">
      <div className="pointer-events-none absolute -right-100 -bottom-72 opacity-60 sm:-right-95 sm:-bottom-80">
        <Image
          src="/images/silhouette.svg"
          alt=""
          width={800}
          height={800}
          className="animate-slow-spin h-[700px] w-[700px] -rotate-45 sm:h-[1200px] sm:w-[1200px]"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <NicknameStep />
      </div>
    </main>
  );
}
