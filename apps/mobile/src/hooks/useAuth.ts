import { useEffect } from 'react';
import { supabase } from './useSupabase';
import { useAuthStore } from '@/stores/authStore';

/**
 * Initializes auth state from persisted session and subscribes to
 * Supabase auth state changes. Call this once in the root layout.
 *
 * Keeps the Zustand authStore in sync with Supabase's session.
 */
export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // 1. Restore persisted session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          createdAt: session.user.created_at,
        });
        setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
      }
      setLoading(false);
    });

    // 2. Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          createdAt: session.user.created_at,
        });
        setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);
}
