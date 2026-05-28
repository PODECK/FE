'use client';

import { toast } from 'sonner';
import { createClient } from '@/shared/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        //OAuth 완료 후 supabase session으로 교환할 route
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error('Google 로그인에 실패했습니다');
    }
  };

  return (
    <Button type="button" className="w-full" onClick={handleGoogleLogin}>
      Google로 시작하기
    </Button>
  );
}
