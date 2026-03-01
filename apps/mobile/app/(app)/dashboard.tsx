import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Bell, Plus, WifiOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { SubscriptionRow } from '@/components/dashboard/SubscriptionRow';
import { SignUpPrompt } from '@/components/dashboard/SignUpPrompt';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';
import { useState, useCallback, useMemo } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: '#F0FBF6' }}>
        <View style={{ height: insets.top, backgroundColor: '#F0FBF6' }} />
        <LinearGradient
          colors={['#F0FBF6', '#E8F8F0']}
          className="px-5 pb-8"
          style={{
            paddingTop: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Skeleton width={100} height={14} style={{ marginBottom: 6 }} />
              <Skeleton width={160} height={22} />
            </View>
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>
          <Skeleton height={160} borderRadius={16} />
        </LinearGradient>
        <View className="px-5 mt-6">
          <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
          <View className="flex-row items-center gap-4">
            <Skeleton width={110} height={110} borderRadius={55} />
            <View className="flex-1 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <Skeleton width={10} height={10} borderRadius={5} />
                  <Skeleton width="60%" height={12} />
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="px-5 mt-6">
          <Skeleton width={160} height={20} style={{ marginBottom: 16 }} />
          {[0, 1, 2].map((i) => (
            <View key={i} className="flex-row items-center gap-3 mb-3">
              <Skeleton width={48} height={48} borderRadius={24} />
              <View className="flex-1 gap-1">
                <Skeleton width="50%" height={14} />
                <Skeleton width="30%" height={12} />
              </View>
              <Skeleton width={60} height={16} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center px-5" style={{ paddingTop: insets.top }}>
        <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center mb-4">
          <WifiOff size={28} color="#F87171" />
        </View>
        <Text className="text-text-primary text-[17px] mb-2" style={{ fontWeight: '600' }}>
          Couldn't load dashboard
        </Text>
        <Text className="text-text-secondary text-[14px] text-center mb-6">
          Check your connection and try again.
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="bg-mint px-6 py-3 rounded-button"
        >
          <Text className="text-white text-[14px]" style={{ fontWeight: '600' }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  const { totalMonthly, totalAnnual, activeCount, categoryBreakdown, subscriptions } = data;

  return (
    <View className="flex-1" style={{ backgroundColor: '#F0FBF6' }}>
      <View style={{ height: insets.top, backgroundColor: '#F0FBF6' }} />
      <View className="flex-1 bg-surface-bg">
      <FeedbackToast
        {...toast}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#3EB489" />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#F0FBF6', '#E8F8F0']}
          className="px-5 pb-8"
          style={{
            paddingTop: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-[14px] text-text-secondary">Welcome back</Text>
                <Text
                  className="text-[20px] text-text-primary"
                  style={{ fontWeight: '600' }}
                >
                  Your Subscriptions
                </Text>
              </View>
              <Pressable className="w-10 h-10 rounded-full bg-white items-center justify-center border border-surface-border" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
                <Bell size={20} color="#6B7280" />
              </Pressable>
            </View>

            {/* Hero Card */}
            <HeroCard
              totalMonthly={totalMonthly}
              totalAnnual={totalAnnual}
              activeCount={activeCount}
            />
          </Animated.View>
        </LinearGradient>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <View className="px-5 mt-6">
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <Text
                className="text-[18px] text-text-primary mb-4"
                style={{ fontWeight: '600' }}
              >
                Spend by Category
              </Text>
              <CategoryChart data={categoryBreakdown} />
            </Animated.View>
          </View>
        )}

        {/* Active Subscriptions */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-[18px] text-text-primary"
              style={{ fontWeight: '600' }}
            >
              Active Subscriptions
            </Text>
            {subscriptions.length > 5 && (
              <Pressable>
                <Text className="text-[13px] text-mint" style={{ fontWeight: '600' }}>
                  See all
                </Text>
              </Pressable>
            )}
          </View>

          {subscriptions.length === 0 ? (
            <View className="bg-white rounded-card border border-surface-border p-6 items-center">
              <Text className="text-text-secondary text-[14px] text-center">
                No subscriptions yet. Import a statement to get started.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {subscriptions.map((sub, i) => (
                <SubscriptionRow key={sub.id} subscription={sub} index={i} />
              ))}
            </View>
          )}
        </View>

        {/* Sign Up Prompt — only if guest/unauthenticated */}
        {!user && (
          <View className="px-5 mt-8">
            <SignUpPrompt />
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB onPress={() => router.push('/(app)/ingest')} />
      </View>
    </View>
  );
}

function FAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
      ]}
      className="absolute bottom-6 right-6 w-14 h-14 bg-mint rounded-full items-center justify-center"
    >
      <Plus size={24} color="#FFFFFF" />
    </AnimatedPressable>
  );
}
