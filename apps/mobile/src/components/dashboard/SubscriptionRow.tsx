import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { MerchantLogo } from '@/components/ui/MerchantLogo';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import type { Subscription } from '@/types';
import { frequencyLabel } from '@/utils/format';

interface SubscriptionRowProps {
  subscription: Subscription;
  index: number;
}

export const SubscriptionRow = memo(function SubscriptionRow({ subscription, index }: SubscriptionRowProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(500 + index * 60)}>
      <Pressable
        onPress={() => router.push(`/(app)/subscription/${subscription.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${subscription.displayName}, $${subscription.amount.toFixed(2)} ${frequencyLabel(subscription.frequency)}`}
        accessibilityHint="Opens subscription details"
        className="bg-white rounded-button border border-surface-border p-4 flex-row items-center gap-3"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.02,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        <MerchantLogo
          websiteUrl={subscription.websiteUrl}
          logoLetter={subscription.logoLetter}
          logoColor={subscription.logoColor}
          size={48}
        />

        <View className="flex-1 min-w-0">
          <Text
            className="text-[15px] text-text-primary"
            numberOfLines={1}
            style={{ fontWeight: '600' }}
          >
            {subscription.displayName}
          </Text>
          <View className="mt-0.5">
            <CategoryBadge category={subscription.category} />
          </View>
        </View>

        <View className="items-end shrink-0">
          <Text className="text-[16px] text-text-primary" style={{ fontWeight: '600' }}>
            ${subscription.amount.toFixed(2)}
          </Text>
          <Text className="text-[11px] text-text-muted">
            {frequencyLabel(subscription.frequency)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});
