//  검증된 환경변수 값을 사용해 Supabase Auth 및 DB 요청에 사용할 client 인스턴스를 생성
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/shared/config/env';

export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
