import NicknameStep from '@/components/start/NicknameStep';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(to_bottom,#ef4444_0%,#dc2626_44%,#f8fafc_44%,#f8fafc_48%)] text-white">
      <div className="border-10px pointer-events-none absolute top-[44%] left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_6px_rgba(248,250,252,0.45)]">
        <div className="absolute inset-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] bg-white" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <NicknameStep />
      </div>
    </main>
  );
}
