import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/hooks/useSupabase';
import { api } from './api';

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
 * Delete the user's account and all associated data.
 */
export async function deleteAccount(): Promise<AuthResult> {
  try {
    await api.delete('/v1/auth/account');
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Failed to delete account' };
  }
}

/**
 * Sign in with Apple (native).
 * Requires expo-apple-authentication and Supabase Apple provider configured.
 */
export async function signInWithApple(): Promise<AuthResult> {
  // TODO: Requires EAS Build for native Apple auth + Supabase Apple provider
  return { success: false, error: 'Apple sign-in is not yet configured' };
}

/**
 * Sign in with Google via Supabase OAuth + expo-web-browser.
 * Opens an in-app browser to Google's consent screen, Supabase handles
 * the callback, and returns the session via deep link.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'subtake' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { success: false, error: error?.message ?? 'Failed to start Google sign-in' };
    }

    // Open the Supabase OAuth URL in an in-app browser
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type !== 'success' || !result.url) {
      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, error: 'Sign-in cancelled' };
      }
      return { success: false, error: 'Google sign-in failed' };
    }

    // Extract the session tokens from the redirect URL
    const url = new URL(result.url);
    // Supabase returns tokens as hash fragments: #access_token=...&refresh_token=...
    const params = new URLSearchParams(url.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return { success: false, error: 'No tokens returned from Google sign-in' };
    }

    // Set the session in Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    // Register profile in backend
    if (sessionData.user) {
      try {
        await api.post('/v1/auth/register-profile', {
          supabaseId: sessionData.user.id,
          email: sessionData.user.email,
        });
      } catch {
        // Non-fatal
        console.warn('Failed to register profile after Google sign-in');
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Google sign-in failed' };
  }
}
