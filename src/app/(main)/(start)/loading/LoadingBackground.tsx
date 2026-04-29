import type { ReactNode } from 'react';

type LoadingBackgroundProps = {
  children: ReactNode;
};

export default function LoadingBackground({ children }: LoadingBackgroundProps) {
  return (
    <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-2.5"
        style={{
          backgroundImage: "url('/images/pokeball-frame.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
          backgroundPosition: 'top left',
        }}
      />
      <div className="relative z-10 flex w-full items-center justify-center">{children}</div>
    </main>
  );
}
