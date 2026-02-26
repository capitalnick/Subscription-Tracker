import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface MintButtonProps {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'outline';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MintButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  style,
}: MintButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const baseClass = 'flex-row items-center justify-center gap-2 rounded-button px-6 py-3';
  const widthClass = fullWidth ? 'w-full' : '';

  const variantClasses = {
    primary: disabled
      ? 'bg-surface-border'
      : 'bg-mint active:bg-mint-active',
    ghost: 'bg-transparent active:bg-surface-divider',
    outline: 'bg-white border border-surface-border active:bg-mint-light',
  };

  const textClasses = {
    primary: 'text-white',
    ghost: 'text-text-secondary',
    outline: 'text-text-body',
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${baseClass} ${variantClasses[variant]} ${widthClass}`}
      style={[animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#3EB489'} />
      ) : (
        <Text className={`text-[15px] font-semibold ${textClasses[variant]}`}>{children}</Text>
      )}
    </AnimatedPressable>
  );
}
