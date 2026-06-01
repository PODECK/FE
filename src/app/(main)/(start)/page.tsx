import LoginStep from '@/app/(main)/(start)/_components/LoginStep';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';

export default function StartPage() {
  return (
    <main className="relative min-h-screen overflow-hidden [background:var(--gradient-bg)]">
      <SilhouetteBackground isAnimated imageClassName="opacity-40" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <LoginStep />
      </div>
    </main>
  );
}
