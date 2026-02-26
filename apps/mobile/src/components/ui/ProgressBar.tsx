import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${withTiming(progress * 100, { duration: 300 })}%`,
  }));

  const percent = Math.round(progress * 100);

  return (
    <View
      className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Review progress: ${percent}% complete`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <Animated.View className="h-full bg-mint rounded-full" style={animatedStyle} />
    </View>
  );
}
