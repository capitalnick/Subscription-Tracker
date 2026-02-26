import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  session: { accessToken: string; refreshToken: string } | null;
  isLoading: boolean;
  hasSeenPrivacyDisclosure: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { accessToken: string; refreshToken: string } | null) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenPrivacyDisclosure: (seen: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  hasSeenPrivacyDisclosure: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasSeenPrivacyDisclosure: (hasSeenPrivacyDisclosure) => set({ hasSeenPrivacyDisclosure }),
  signOut: () => set({ user: null, session: null }),
}));
