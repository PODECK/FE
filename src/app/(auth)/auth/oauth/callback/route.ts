import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { getOnboardingPath } from '@/entities/trainer/api/trainerApi';

async function redirectToNextPath(request: NextRequest) {
  const nextPath = await getOnboardingPath();

  if (nextPath === '/home') {
    return NextResponse.redirect(new URL('/loading', request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth session exchange failed:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return redirectToNextPath(request);
    }

    return NextResponse.redirect(new URL('/?error=session_exchange_failed', request.url));
  }

  return redirectToNextPath(request);
}
