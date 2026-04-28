import Image from 'next/image';

export default function StartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFD45E] to-[#F6B400]">
      <div className="pointer-events-none absolute -right-80 -bottom-72 opacity-20 sm:-right-48 sm:-bottom-80">
        <Image
          src="/images/silhouette.png"
          alt=""
          width={800}
          height={800}
          className="animate-slow-spin h-[700px] w-[700px] -rotate-45 sm:h-[800px] sm:w-[800px]"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        {children}
      </div>
    </main>
  );
}
