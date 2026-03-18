import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CreditCard, Eye, TrendingUp } from 'lucide-react-native';
import { MintButton } from '@/components/ui/MintButton';

const VALUE_PROPS = [
  {
    icon: CreditCard,
    title: 'Find hidden subscriptions',
    desc: 'Upload a bank statement or screenshot — AI spots every recurring charge.',
  },
  {
    icon: Eye,
    title: 'See your true spend',
    desc: 'Dashboard shows your monthly and annual totals at a glance.',
  },
  {
    icon: TrendingUp,
    title: 'Take back control',
    desc: 'Cancel what you don\'t use. Know what\'s coming before it charges.',
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-surface-bg justify-between"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }}
    >
      <View className="px-6">
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text
            className="text-[32px] text-text-primary tracking-tight"
            style={{ fontWeight: '700', lineHeight: 38 }}
          >
            Know exactly{'\n'}where your{'\n'}money goes
          </Text>
          <Text className="text-[16px] text-text-secondary mt-3">
            SubTake finds and tracks every subscription so you don't have to.
          </Text>
        </Animated.View>

        <View className="mt-10 gap-5">
          {VALUE_PROPS.map((prop, i) => (
            <Animated.View
              key={prop.title}
              entering={FadeInDown.duration(400).delay(200 + i * 100)}
              className="flex-row items-start"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: '#F0FBF6' }}
              >
                <prop.icon size={20} color="#3EB489" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[15px] text-text-primary"
                  style={{ fontWeight: '600' }}
                >
                  {prop.title}
                </Text>
                <Text className="text-[13px] text-text-secondary mt-0.5">
                  {prop.desc}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View entering={FadeInUp.duration(400).delay(600)} className="px-6">
        <MintButton fullWidth onPress={() => router.push('/(onboarding)/import-method')}>
          Get Started
        </MintButton>
        <Text className="text-center text-[12px] text-text-muted mt-3">
          Takes less than 5 minutes
        </Text>
      </Animated.View>
    </View>
  );
}
