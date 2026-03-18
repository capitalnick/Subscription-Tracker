import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CheckCircle, Search, BarChart3 } from 'lucide-react-native';
import { MintButton } from '@/components/ui/MintButton';
import { useAuthStore } from '@/stores/authStore';

const STAGES = [
  { icon: Search, label: 'Scanning document...', delay: 0 },
  { icon: BarChart3, label: 'Identifying subscriptions...', delay: 800 },
  { icon: CheckCircle, label: 'Building your dashboard...', delay: 1600 },
];

export default function ProcessingScreen() {
  const insets = useSafeAreaInsets();
  const { count = '0' } = useLocalSearchParams<{ count: string }>();
  const setHasCompletedOnboarding = useAuthStore((s) => s.setHasCompletedOnboarding);
  const [currentStage, setCurrentStage] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timers = STAGES.map((_, i) =>
      setTimeout(() => setCurrentStage(i + 1), STAGES[i].delay + 600),
    );

    const doneTimer = setTimeout(() => {
      setComplete(true);
      setHasCompletedOnboarding(true);
    }, 2800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [setHasCompletedOnboarding]);

  const itemCount = parseInt(count, 10);

  return (
    <View
      className="flex-1 bg-surface-bg justify-center"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <View className="flex-1 justify-center px-6">
        <Animated.View entering={FadeInDown.duration(400)} className="items-center mb-10">
          <Text
            className="text-[24px] text-text-primary text-center"
            style={{ fontWeight: '600' }}
          >
            {complete ? 'All done!' : 'Processing...'}
          </Text>
          {complete && itemCount > 0 && (
            <Animated.Text
              entering={FadeInDown.duration(300)}
              className="text-[15px] text-text-secondary text-center mt-2"
            >
              We found {itemCount} subscription{itemCount !== 1 ? 's' : ''} to review.
            </Animated.Text>
          )}
        </Animated.View>

        <View className="gap-4">
          {STAGES.map((stage, i) => {
            const isActive = currentStage > i;
            const Icon = stage.icon;
            return (
              <Animated.View
                key={stage.label}
                entering={FadeInDown.duration(300).delay(stage.delay)}
                className="flex-row items-center"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{
                    backgroundColor: isActive ? '#F0FBF6' : '#F3F4F6',
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? '#3EB489' : '#9CA3AF'}
                  />
                </View>
                <Text
                  className="text-[15px]"
                  style={{
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#111827' : '#9CA3AF',
                  }}
                >
                  {stage.label}
                </Text>
                {isActive && (
                  <Animated.View entering={FadeInDown.duration(200)} className="ml-auto">
                    <CheckCircle size={18} color="#3EB489" />
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>

      {complete && (
        <Animated.View entering={FadeInUp.duration(400)} className="px-6">
          <MintButton
            fullWidth
            onPress={() => {
              if (itemCount > 0) {
                router.replace('/(app)/review');
              } else {
                router.replace('/(app)/dashboard');
              }
            }}
          >
            {itemCount > 0 ? 'Review Subscriptions' : 'Go to Dashboard'}
          </MintButton>
        </Animated.View>
      )}
    </View>
  );
}
