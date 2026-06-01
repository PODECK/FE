import { getOnboardingPath } from '@/entities/trainer/api/trainerApi';
import { redirect } from 'next/navigation';
import NicknameForm from '@/app/(main)/(start)/nickname/_components/NicknameForm';
import SilhouetteBackground from '@/shared/components/SilhouetteBackground';

export default async function NicknamePage() {
  const nextPath = await getOnboardingPath();

  if (nextPath !== '/nickname') {
    redirect(nextPath);
  }

  return (
    <main className="relative min-h-screen overflow-hidden [background:var(--gradient-bg)]">
      <SilhouetteBackground isAnimated imageClassName="opacity-40" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <NicknameForm />
      </div>
    </main>
  );
}
