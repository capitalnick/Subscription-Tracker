import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  session: { accessToken: string; refreshToken: string } | null;
  isLoading: boolean;
  hasSeenPrivacyDisclosure: boolean;
  hasCompletedOnboarding: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { accessToken: string; refreshToken: string } | null) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenPrivacyDisclosure: (seen: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  hasSeenPrivacyDisclosure: false,
  hasCompletedOnboarding: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasSeenPrivacyDisclosure: (hasSeenPrivacyDisclosure) => set({ hasSeenPrivacyDisclosure }),
  setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
  signOut: () => set({ user: null, session: null }),
}));
