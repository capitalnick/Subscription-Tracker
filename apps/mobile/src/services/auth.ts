import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
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
 * Sign in with Google using expo-auth-session + Supabase signInWithIdToken.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const clientId = Platform.select({
      ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    if (!clientId) {
      return { success: false, error: 'Google client ID not configured for this platform' };
    }

    // Generate PKCE nonce for Supabase verification
    const rawNonce = Crypto.randomUUID();
    const hashedBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'subtake' });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: { nonce: hashedBytes },
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success' || !result.params?.id_token) {
      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, error: 'Sign-in cancelled' };
      }
      return { success: false, error: 'Google sign-in failed' };
    }

    // Exchange the Google ID token with Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.params.id_token,
      nonce: rawNonce,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Register profile in backend (same as email signup)
    if (data.user) {
      try {
        await api.post('/v1/auth/register-profile', {
          supabaseId: data.user.id,
          email: data.user.email,
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
