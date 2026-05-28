import GoogleLoginButton from '@/app/(auth)/login/_components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-(--color-base-3) px-4">
      <section className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">포켓몬 트레이너 로그인</h1>
        <GoogleLoginButton />
      </section>
    </main>
  );
}
