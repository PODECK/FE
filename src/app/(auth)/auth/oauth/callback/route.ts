import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { getOnboardingPath } from '@/entities/trainer/api/trainerApi';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_callback', request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=session_exchange_failed', request.url));
  }

  const nextPath = await getOnboardingPath();

  return NextResponse.redirect(new URL(nextPath, request.url));
}
