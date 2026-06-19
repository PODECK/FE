import { describe, expect, it, vi } from 'vitest';

const { exchangeCodeForSession, getOnboardingPath } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getOnboardingPath: vi.fn(),
}));

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession,
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}));

vi.mock('@/entities/trainer/api/trainerApi', () => ({
  getOnboardingPath,
}));

import { GET } from '@/app/(auth)/auth/oauth/callback/route';

describe('OAuth callback route', () => {
  it('세션 교환 성공 후 홈 진입 대상이면 로딩 화면으로 리다이렉트한다', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    getOnboardingPath.mockResolvedValueOnce('/home');

    const response = await GET(new Request('http://localhost:3000/auth/oauth/callback?code=test-code') as never);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('test-code');
    expect(getOnboardingPath).toHaveBeenCalled();
    expect(response.headers.get('location')).toBe('http://localhost:3000/loading');
  });
});
