import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
    >
      <View className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex-row items-center justify-center gap-2">
        <WifiOff size={14} color="#D97706" />
        <Text className="text-[13px] text-amber-700" style={{ fontWeight: '500' }}>
          You're offline. Data may be outdated.
        </Text>
      </View>
    </Animated.View>
  );
}
