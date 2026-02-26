import { useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { WifiOff, Inbox, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ReviewCard } from '@/components/review/ReviewCard';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MintButton } from '@/components/ui/MintButton';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQueue, useConfirmItem, useDismissItem } from '@/hooks/useQueue';
import { useState } from 'react';

export default function ReviewScreen() {
  const { data, isLoading, isError, refetch } = useQueue();
  const confirmMutation = useConfirmItem();
  const dismissMutation = useDismissItem();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const items = data?.items ?? [];
  const total = items.length;
  const confirmed = items.filter((i) => i.status === 'CONFIRMED').length;
  const dismissed = items.filter((i) => i.status === 'DISMISSED').length;
  const allReviewed = total > 0 && items.every((i) => i.status !== 'PENDING');
  const progress = total > 0 ? confirmed / total : 0;

  const handleConfirm = useCallback(
    (id: string) => {
      confirmMutation.mutate(
        { itemId: id },
        {
          onSuccess: () => {
            setToast({ message: 'Subscription confirmed!', type: 'success', visible: true });
          },
          onError: () => {
            setToast({ message: 'Failed to confirm. Please try again.', type: 'error', visible: true });
          },
        },
      );
    },
    [confirmMutation],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      dismissMutation.mutate(id, {
        onError: () => {
          setToast({ message: 'Failed to dismiss. Please try again.', type: 'error', visible: true });
        },
      });
    },
    [dismissMutation],
  );

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(app)/dashboard');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg">
        <View className="px-5 pt-4 pb-4">
          <StepIndicator current={2} total={3} />
          <Skeleton width="70%" height={32} style={{ marginTop: 8 }} />
          <Skeleton width="90%" height={16} style={{ marginTop: 12 }} />
          <Skeleton height={8} borderRadius={4} style={{ marginTop: 16 }} />
        </View>
        <View className="px-5 gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} borderRadius={16} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg items-center justify-center px-5">
        <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center mb-4">
          <WifiOff size={28} color="#F87171" />
        </View>
        <Text className="text-text-primary text-[17px] mb-2" style={{ fontWeight: '600' }}>
          Something went wrong
        </Text>
        <Text className="text-text-secondary text-[14px] text-center mb-6">
          We couldn't load your review queue.{'\n'}Check your connection and try again.
        </Text>
        <MintButton onPress={() => refetch()}>Retry</MintButton>
      </SafeAreaView>
    );
  }

  if (total === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg items-center justify-center px-5">
        <View className="w-16 h-16 rounded-full bg-mint/10 items-center justify-center mb-4">
          <Inbox size={28} color="#3EB489" />
        </View>
        <Text className="text-text-primary text-[17px] mb-2" style={{ fontWeight: '600' }}>
          Nothing to review
        </Text>
        <Text className="text-text-secondary text-[14px] text-center mb-4">
          Import a statement or screenshot to get started.
        </Text>
        <MintButton onPress={() => router.push('/(app)/ingest')}>Import</MintButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      <FeedbackToast
        {...toast}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <Animated.View entering={FadeInDown.duration(400)}>
          <StepIndicator current={2} total={3} />
          <Text
            className="text-[28px] text-text-primary tracking-tight"
            style={{ fontWeight: '600', lineHeight: 34 }}
          >
            Review your subs
          </Text>
          <Text className="text-[15px] text-text-secondary mt-2">
            We found{' '}
            <Text className="text-text-primary" style={{ fontWeight: '600' }}>
              {total} subscriptions
            </Text>
            . Confirm or dismiss each one.
          </Text>
        </Animated.View>

        {/* Progress */}
        <View className="flex-row items-center gap-3 mt-4">
          <ProgressBar progress={progress} />
          <Text className="text-[13px] text-text-secondary" style={{ fontWeight: '500' }}>
            {confirmed}/{total}
          </Text>
        </View>
      </View>

      {/* Subscription List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        windowSize={7}
        maxToRenderPerBatch={8}
        initialNumToRender={6}
        removeClippedSubviews
        renderItem={({ item, index }) => (
          <ReviewCard
            item={item}
            status={item.status as 'PENDING' | 'CONFIRMED' | 'DISMISSED'}
            onConfirm={() => handleConfirm(item.id)}
            onDismiss={() => handleDismiss(item.id)}
            index={index}
          />
        )}
      />

      {/* Sticky Bottom CTA */}
      <BlurView
        intensity={90}
        tint="light"
        className="absolute bottom-0 left-0 right-0 border-t border-surface-border px-5 py-4 pb-8"
      >
        <MintButton fullWidth disabled={!allReviewed} onPress={handleContinue}>
          See my dashboard
        </MintButton>
      </BlurView>
    </SafeAreaView>
  );
}
