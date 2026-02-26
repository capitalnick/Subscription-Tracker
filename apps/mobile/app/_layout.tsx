import '../global.css';
import { useEffect } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  // Initialize auth — restores session from SecureStore, subscribes to changes
  useAuth();

  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Hide splash once auth state is resolved (whether logged in or not)
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Keep splash visible while loading
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthGate>
          <Slot />
        </AuthGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
