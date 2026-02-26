import { Pressable, View, Text } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

interface IngestionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string | null;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IngestionCard({
  icon: Icon,
  title,
  description,
  badge,
  isSelected,
  onPress,
  index,
}: IngestionCardProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(index * 80)}>
      <AnimatedPressable
        onPress={handlePress}
        style={animatedStyle}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${description}`}
        accessibilityState={{ selected: isSelected }}
        className={`relative p-4 rounded-button border ${
          isSelected
            ? 'border-mint border-2 bg-mint-light'
            : 'border-surface-border bg-white'
        }`}
      >
        {badge && (
          <View className="absolute -top-2.5 right-2 bg-mint rounded-full px-2 py-0.5 flex-row items-center gap-1 z-10">
            <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
            <Text className="text-white text-[10px] font-semibold">{badge}</Text>
          </View>
        )}

        <View
          className={`w-10 h-10 rounded-icon items-center justify-center mb-3 ${
            isSelected ? 'bg-mint' : 'bg-surface-divider'
          }`}
        >
          <Icon size={20} color={isSelected ? '#FFFFFF' : '#6B7280'} />
        </View>

        <Text
          className="text-[14px] text-text-primary mb-0.5"
          style={{ fontWeight: '600', lineHeight: 18 }}
        >
          {title}
        </Text>
        <Text className="text-[12px] text-text-muted" style={{ lineHeight: 17 }}>
          {description}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}
