import { View } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // While loading auth state, show nothing (splash screen covers)
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFBFC' },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}
