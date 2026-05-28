// middleware에서 Supabase 세션을 갱신하고, 현재 로그인한 user를 확인하는 함수
import { env } from '@/shared/config/env';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request }); //응답 객체

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  }); // middleware에서 사용할 client 생성

  //getUser 호출이 세션 refresh를 트리거
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user }; // 갱신된 response와 user 반환
}
