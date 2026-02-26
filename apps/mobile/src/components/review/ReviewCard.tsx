import { View, Text, Pressable } from 'react-native';
import Animated, {
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Check, X, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MerchantLogo } from '@/components/ui/MerchantLogo';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import type { DetectedItem } from '@/types';

type ReviewStatus = 'PENDING' | 'CONFIRMED' | 'DISMISSED';

const SWIPE_THRESHOLD = 120;

interface ReviewCardProps {
  item: DetectedItem;
  status: ReviewStatus;
  onConfirm: () => void;
  onDismiss: () => void;
  index: number;
}

export function ReviewCard({ item, status, onConfirm, onDismiss, index }: ReviewCardProps) {
  const translateX = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const fireConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const fireDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handleConfirmPress = () => {
    cardScale.value = withSpring(0.96, { damping: 15, stiffness: 400 }, () => {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    runOnJS(fireConfirm)();
  };

  const handleDismissPress = () => {
    cardScale.value = withSpring(0.96, { damping: 15, stiffness: 400 }, () => {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    runOnJS(fireDismiss)();
  };

  const swipeGesture = Gesture.Pan()
    .enabled(status === 'PENDING')
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(400, { duration: 200 });
        runOnJS(fireConfirm)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-400, { duration: 200 });
        runOnJS(fireDismiss)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: cardScale.value },
    ],
  }));

  const confirmHintStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));

  const dismissHintStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(-translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));

  const borderColor =
    item.duplicate
      ? 'border-error'
      : status === 'CONFIRMED'
      ? 'border-mint'
      : 'border-surface-border';

  const bgColor =
    item.duplicate
      ? 'bg-error-light'
      : status === 'CONFIRMED'
      ? 'bg-mint-light'
      : status === 'DISMISSED'
      ? 'bg-surface-muted'
      : 'bg-white';

  const opacity = status === 'DISMISSED' ? 'opacity-50' : 'opacity-100';

  const category = item.merchant?.category ?? 'Other';
  const logoColor = item.merchant?.logoColor ?? '#9CA3AF';
  const logoLetter = item.merchant?.logoLetter ?? '?';
  const websiteUrl = item.merchant?.websiteUrl ?? null;

  return (
    <Animated.View
      entering={FadeInLeft.duration(300).delay(index * 50)}
      className="mb-3"
    >
      {/* Swipe hint backgrounds */}
      <View className="absolute inset-0 rounded-button overflow-hidden flex-row">
        <Animated.View
          style={confirmHintStyle}
          className="flex-1 bg-mint items-start justify-center px-5 rounded-button"
        >
          <Check size={24} color="#FFFFFF" />
        </Animated.View>
        <Animated.View
          style={dismissHintStyle}
          className="flex-1 bg-error items-end justify-center px-5 rounded-button"
        >
          <X size={24} color="#FFFFFF" />
        </Animated.View>
      </View>

      {/* Card */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={cardAnimatedStyle}
          className={`rounded-button border p-4 ${borderColor} ${bgColor} ${opacity}`}
        >
          {/* Duplicate Warning */}
          {item.duplicate && (
            <View className="flex-row items-center gap-1.5 mb-2">
              <AlertTriangle size={14} color="#F87171" />
              <Text className="text-[11px] text-error" style={{ fontWeight: '600' }}>
                Possible duplicate detected
              </Text>
            </View>
          )}

          {/* Main Row */}
          <View className="flex-row items-center gap-3">
            <MerchantLogo
              websiteUrl={websiteUrl}
              logoLetter={logoLetter}
              logoColor={logoColor}
              size={48}
            />

            <View className="flex-1 min-w-0">
              <Text
                className="text-[15px] text-text-primary"
                numberOfLines={1}
                style={{ fontWeight: '600' }}
              >
                {item.aiMerchantName ?? 'Unknown'}
              </Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <CategoryBadge category={category} />
                {item.aiConfidence === 'low' && (
                  <Text className="text-[11px] text-error" style={{ fontWeight: '500' }}>
                    Low confidence
                  </Text>
                )}
              </View>
            </View>

            <View className="items-end shrink-0">
              <Text className="text-[16px] text-text-primary" style={{ fontWeight: '600' }}>
                ${item.aiAmount?.toFixed(2) ?? '0.00'}
              </Text>
              <Text className="text-[11px] text-text-muted">/month</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {status === 'PENDING' && (
            <View className="flex-row gap-2 mt-3">
              <Pressable
                onPress={handleConfirmPress}
                accessibilityRole="button"
                accessibilityLabel={`Confirm ${item.aiMerchantName ?? 'subscription'}`}
                className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-sm-btn bg-mint active:bg-mint-active"
              >
                <Check size={16} color="#FFFFFF" />
                <Text className="text-white text-[13px]" style={{ fontWeight: '600' }}>
                  Confirm
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDismissPress}
                accessibilityRole="button"
                accessibilityLabel={`Dismiss ${item.aiMerchantName ?? 'subscription'}`}
                className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-sm-btn bg-surface-divider active:bg-surface-border"
              >
                <X size={16} color="#6B7280" />
                <Text className="text-text-secondary text-[13px]" style={{ fontWeight: '500' }}>
                  Dismiss
                </Text>
              </Pressable>
            </View>
          )}

          {/* Confirmed State */}
          {status === 'CONFIRMED' && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <Check size={16} color="#3EB489" />
              <Text className="text-[12px] text-mint" style={{ fontWeight: '600' }}>
                Confirmed
              </Text>
            </View>
          )}

          {/* Dismissed State */}
          {status === 'DISMISSED' && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <X size={16} color="#9CA3AF" />
              <Text className="text-[12px] text-text-muted" style={{ fontWeight: '500' }}>
                Dismissed
              </Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
