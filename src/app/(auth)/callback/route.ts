import { createClient } from '@/shared/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { getOnboardingPath } from '@/entities/trainer/api/trainerApi';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인 직후 유저 상태에 맞는 다음 페이지 결정
  const nextPath = await getOnboardingPath();

  return NextResponse.redirect(new URL(nextPath, request.url));
}
