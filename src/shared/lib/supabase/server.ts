// 서버 환경에서 Supabase 세션 쿠키를 기반으로 인증된 Supabase client를 생성하는 유틸 함수
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/shared/config/env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서 호출될 때는 set cookie가 불가능할 수 있음
          // 세션 갱신은 middleware에서 처리
        }
      }, // 세션 갱신 혹은 인증 쿠키를 다시 설정해야할 때 쿠키를 저장하는 역할
    },
  });
}
