// middleware를 통한 페이지 접근 관리
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/shared/lib/supabase/middleware';
import { getOnboardingPathForUser } from '@/entities/trainer/api/onboarding';

const publicPaths = ['/'];
const publicPrefixes = ['/auth'];
const publicAssetPrefixes = ['/unity'];
const publicApiPrefixes = ['/api/health', '/api/data', '/api/type-weaknesses'];

function isPublicPath(pathname: string) {
  return (
    publicPaths.includes(pathname) ||
    publicPrefixes.some((path) => pathname.startsWith(path)) ||
    publicApiPrefixes.some((path) => pathname.startsWith(path))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicAssetPrefixes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const { response, user, supabase } = await updateSession(request);
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/') {
    const nextPath = await getOnboardingPathForUser(supabase, user.id);
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
