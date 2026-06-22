'use client';

import { useCallback, useState } from 'react';
import type { AuthError } from '@supabase/supabase-js';
import { createClient } from '@/shared/lib/supabase/client';

export function createOAuthCallbackUrl(origin: string) {
  return `${origin}/auth/oauth/callback`;
}

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useCallback(async (): Promise<AuthError | null> => {
    if (isLoading) return null;

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: createOAuthCallbackUrl(window.location.origin),
      },
    });

    if (error) {
      setIsLoading(false);
      return error;
    }

    return null;
  }, [isLoading]);

  return {
    isLoading,
    loginWithGoogle,
  };
}
