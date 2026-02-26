import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function SignUpPrompt() {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(700)}>
      <LinearGradient
        colors={['#3EB489', '#2DA87A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-card p-5"
      >
        <Text className="text-[17px] text-white mb-1" style={{ fontWeight: '600' }}>
          Save your progress
        </Text>
        <Text className="text-[13px] text-white/80 mb-4">
          Create an account to track changes and get renewal reminders.
        </Text>
        <View className="gap-2">
          <Pressable className="w-full py-3 bg-white rounded-icon items-center flex-row justify-center gap-2">
            <Text
              className="text-text-primary text-[14px]"
              style={{ fontWeight: '600' }}
            >
              Continue with Google
            </Text>
          </Pressable>
          <Pressable className="w-full py-3 bg-black rounded-icon items-center flex-row justify-center gap-2">
            <Text className="text-white text-[14px]" style={{ fontWeight: '600' }}>
              Continue with Apple
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
