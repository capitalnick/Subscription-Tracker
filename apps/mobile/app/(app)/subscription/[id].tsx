import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Calendar, CreditCard, Tag, Clock, Pencil, Trash2, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MerchantIcon } from '@/components/ui/MerchantIcon';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { MintButton } from '@/components/ui/MintButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSubscription, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { frequencyLabel } from '@/utils/format';
import { format } from 'date-fns';
import type { MerchantPlan, PlanType } from '@/types/models';
import { useMemo } from 'react';

const PLAN_TYPE_STYLES: Record<PlanType, { label: string; bg: string; text: string }> = {
  INDIVIDUAL: { label: 'Individual', bg: '#E5E7EB', text: '#374151' },
  DUO: { label: 'Duo', bg: '#E5E7EB', text: '#374151' },
  FAMILY: { label: 'Family', bg: '#DBEAFE', text: '#1D4ED8' },
  STUDENT: { label: 'Student', bg: '#D1FAE5', text: '#065F46' },
  BUSINESS: { label: 'Business', bg: '#EDE9FE', text: '#5B21B6' },
  ENTERPRISE: { label: 'Enterprise', bg: '#1F2937', text: '#F9FAFB' },
};

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: subscription, isLoading, isError } = useSubscription(id);
  const deleteMutation = useDeleteSubscription();

  // Resolve detected plan from merchant's known_plans
  const detectedPlan = useMemo(() => {
    if (!subscription?.detectedPlanId || !subscription?.merchant?.knownPlans) return null;
    const plans = subscription.merchant.knownPlans as MerchantPlan[];
    return plans.find((p) => p.id === subscription.detectedPlanId) ?? null;
  }, [subscription?.detectedPlanId, subscription?.merchant?.knownPlans]);

  const handleDelete = () => {
    if (!subscription) return;
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to remove ${subscription.displayName}?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteMutation.mutate(subscription.id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-bg" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 py-3">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text
            className="flex-1 text-center text-[17px] text-text-primary"
            style={{ fontWeight: '600' }}
          >
            Subscription
          </Text>
          <View className="w-6" />
        </View>
        <View className="items-center pt-6 pb-8">
          <Skeleton width={80} height={80} borderRadius={40} />
          <Skeleton width="40%" height={24} style={{ marginTop: 16 }} />
          <Skeleton width="20%" height={20} style={{ marginTop: 8 }} />
        </View>
        <View className="mx-5">
          <Skeleton height={120} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      </View>
    );
  }

  if (isError || !subscription) {
    return (
      <View className="flex-1 bg-surface-bg items-center justify-center">
        <Text className="text-text-secondary text-[15px]">Subscription not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-mint text-[15px] font-semibold">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const nextBilling = subscription.nextBillingDate
    ? format(new Date(subscription.nextBillingDate), 'd MMM yyyy')
    : 'Not set';

  return (
    <View className="flex-1 bg-surface-bg" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text
          className="flex-1 text-center text-[17px] text-text-primary"
          style={{ fontWeight: '600' }}
        >
          Subscription
        </Text>
        <Pressable hitSlop={12}>
          <Pencil size={20} color="#3EB489" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Logo + Name */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="items-center pt-6 pb-8"
        >
          <MerchantIcon
            merchant={subscription.merchant}
            logoUrl={subscription.logoUrl}
            websiteUrl={subscription.websiteUrl}
            logoLetter={subscription.logoLetter}
            logoColor={subscription.logoColor}
            fallbackCategory={subscription.category}
            size={80}
            merchantName={subscription.displayName}
          />
          <Text
            className="text-[22px] text-text-primary mt-4"
            style={{ fontWeight: '600' }}
          >
            {subscription.displayName}
          </Text>
          <View className="mt-2">
            <CategoryBadge category={subscription.category} />
          </View>

          {/* Plan Badge */}
          {detectedPlan && (
            <Animated.View
              entering={FadeInDown.duration(300).delay(100)}
              className="mt-3"
            >
              <View className="flex-row items-center gap-2 flex-wrap justify-center">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#F0FBF6' }}
                >
                  <Text className="text-[13px] text-mint" style={{ fontWeight: '600' }}>
                    {detectedPlan.label}
                  </Text>
                </View>
                {detectedPlan.planType && (
                  <PlanTypeBadge planType={detectedPlan.planType as PlanType} />
                )}
                {detectedPlan.features.map((f) => (
                  <View key={f} className="px-2 py-0.5 rounded-full bg-surface-muted">
                    <Text className="text-[11px] text-text-secondary">{f}</Text>
                  </View>
                ))}
              </View>
              {!subscription.planConfirmed && (
                <View className="flex-row items-center justify-center gap-2 mt-2">
                  <Text className="text-[11px] text-text-muted">Auto-detected</Text>
                  <Pressable className="flex-row items-center gap-1">
                    <Check size={12} color="#3EB489" />
                    <Text className="text-[11px] text-mint" style={{ fontWeight: '600' }}>Confirm</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Amount Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          className="mx-5 bg-white rounded-card p-5 border border-surface-border"
        >
          <Text className="text-center text-text-muted text-[13px] mb-1">
            You pay
          </Text>
          <Text
            className="text-center text-mint"
            style={{ fontSize: 36, fontWeight: '700', lineHeight: 40 }}
          >
            ${subscription.amount.toFixed(2)}
          </Text>
          <Text className="text-center text-text-muted text-[14px] mt-0.5">
            {frequencyLabel(subscription.frequency)}
          </Text>
        </Animated.View>

        {/* Details */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          className="mx-5 mt-4 bg-white rounded-card border border-surface-border overflow-hidden"
        >
          <DetailRow
            icon={Calendar}
            label="Next billing"
            value={nextBilling}
          />
          <View className="h-px bg-surface-divider mx-4" />
          <DetailRow
            icon={Clock}
            label="Frequency"
            value={subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
          />
          <View className="h-px bg-surface-divider mx-4" />
          <DetailRow
            icon={CreditCard}
            label="Currency"
            value={subscription.currency}
          />
          <View className="h-px bg-surface-divider mx-4" />
          <DetailRow
            icon={Tag}
            label="Status"
            value={subscription.isActive ? 'Active' : 'Cancelled'}
            valueColor={subscription.isActive ? '#3EB489' : '#F87171'}
          />
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="mx-5 mt-6 gap-3"
        >
          <MintButton fullWidth variant="outline" onPress={() => {}}>
            Edit Details
          </MintButton>

          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-row items-center justify-center gap-2 py-3"
          >
            <Trash2 size={16} color="#F87171" />
            <Text className="text-error text-[14px]" style={{ fontWeight: '600' }}>
              {deleteMutation.isPending ? 'Removing...' : 'Remove Subscription'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function PlanTypeBadge({ planType }: { planType: PlanType }) {
  const style = PLAN_TYPE_STYLES[planType];
  if (!style) return null;
  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg }}>
      <Text className="text-[11px]" style={{ fontWeight: '600', color: style.text }}>
        {style.label}
      </Text>
    </View>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <Icon size={18} color="#9CA3AF" />
      <Text className="text-[14px] text-text-secondary ml-3 flex-1">{label}</Text>
      <Text
        className="text-[14px]"
        style={{ fontWeight: '600', color: valueColor ?? '#111827' }}
      >
        {value}
      </Text>
    </View>
  );
}
