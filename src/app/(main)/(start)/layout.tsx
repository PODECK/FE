import SilhouetteBackground from '@/shared/components/SilhouetteBackground';

export default function StartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFD45E] to-[#F6B400]">
      <SilhouetteBackground />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        {children}
      </div>
    </main>
  );
}
