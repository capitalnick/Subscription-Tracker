import { supabase } from '@/hooks/useSupabase';
import { api } from './api';
import type { AuthResponse as AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign up with email and password.
 * After Supabase creates the auth user, registers a profile row
 * in our backend database.
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Signup failed — no user returned' };
  }

  // Register profile in our backend
  try {
    await api.post('/v1/auth/register-profile', {
      supabaseId: data.user.id,
      email: data.user.email,
    });
  } catch (err: any) {
    // Non-fatal: the profile can be created on next login if this fails
    console.warn('Failed to register profile:', err?.message);
  }

  return { success: true };
}

/**
 * Sign out and clear session from SecureStore.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Sign in with Apple (native).
 * Requires expo-apple-authentication and Supabase Apple provider configured.
 */
export async function signInWithApple(): Promise<AuthResult> {
  // TODO: Phase 1 extension — requires EAS Build for native Apple auth
  return { success: false, error: 'Apple sign-in is not yet configured' };
}

/**
 * Sign in with Google.
 * Requires expo-auth-session and Supabase Google provider configured.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  // TODO: Phase 1 extension — requires Google OAuth client IDs
  return { success: false, error: 'Google sign-in is not yet configured' };
}
