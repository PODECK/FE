// middleware를 통한 페이지 접근 관리
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/shared/lib/supabase/middleware';
import { getOnboardingPathForUser } from '@/entities/trainer/api/onboarding';

const protectedPaths = ['/home', '/pokedex', '/mydeck', '/battle', '/build-deck', '/loading', '/nickname'];

function isPathMatched(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedPath = isPathMatched(pathname, protectedPaths);

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/') {
    const nextPath = await getOnboardingPathForUser(supabase, user.id);
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
