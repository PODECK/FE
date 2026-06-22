'use client';

import { toast } from 'sonner';
import { useGoogleLogin } from '@/features/auth/hooks/useGoogleLogin';
import Image from 'next/image';

export default function GoogleLoginButton() {
  const { isLoading, loginWithGoogle } = useGoogleLogin();

  const handleGoogleLogin = async () => {
    const error = await loginWithGoogle();

    if (error) {
      toast.error('Google 로그인에 실패했습니다');
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleGoogleLogin}
      className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#F2F2F2] font-bold text-[var(--color-base-0)] transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
    >
      <Image src="/images/login/google-round.svg" alt="Google 로고" width={30} height={30} />
      Google로 계속하기
    </button>
  );
}
