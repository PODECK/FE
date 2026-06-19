import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

import { createOAuthCallbackUrl } from '@/features/auth/hooks/useGoogleLogin';

describe('createOAuthCallbackUrl', () => {
  it('현재 origin 기준으로 OAuth callback URL을 만든다', () => {
    expect(createOAuthCallbackUrl('https://podeck.vercel.app')).toBe('https://podeck.vercel.app/auth/oauth/callback');
  });
});
