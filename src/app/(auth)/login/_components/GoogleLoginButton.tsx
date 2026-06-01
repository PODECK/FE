'use client';

import { toast } from 'sonner';
import { createClient } from '@/shared/lib/supabase/client';
import Image from 'next/image';

export default function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/oauth/callback`,
      },
    });

    if (error) {
      toast.error('Google 로그인에 실패했습니다');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#F2F2F2] font-bold text-[var(--color-base-0)] transition hover:opacity-90 active:scale-95"
    >
      <Image src="/images/login/goolge-round.svg" alt="Google 로고" width={30} height={30} />
      Google로 계속하기
    </button>
  );
}
