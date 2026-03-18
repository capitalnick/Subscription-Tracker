import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Shield, FileX, Brain, Trash2, Lock } from 'lucide-react-native';
import { MintButton } from '@/components/ui/MintButton';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useAuthStore } from '@/stores/authStore';

const PRIVACY_POINTS = [
  {
    icon: FileX,
    title: 'No file storage',
    detail: 'Your PDFs, screenshots, and emails are processed in memory and never saved.',
  },
  {
    icon: Brain,
    title: 'AI data is temporary',
    detail: 'AI-extracted data is purged from our database after you review it (or after 30 days).',
  },
  {
    icon: Trash2,
    title: 'Delete everything anytime',
    detail: 'One tap deletes your entire account and all associated data permanently.',
  },
  {
    icon: Lock,
    title: 'Encrypted in transit',
    detail: 'All communication between your device and our servers uses TLS encryption.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { method } = useLocalSearchParams<{ method: string }>();
  const setHasSeenPrivacyDisclosure = useAuthStore((s) => s.setHasSeenPrivacyDisclosure);

  const handleContinue = () => {
    setHasSeenPrivacyDisclosure(true);
    router.push({
      pathname: '/(onboarding)/import-action',
      params: { method: method ?? 'pdf' },
    });
  };

  return (
    <View className="flex-1 bg-surface-bg" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <View className="flex-1" />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 20 }}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <StepIndicator current={2} total={3} />

          <View className="items-center mt-4 mb-6">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: '#F0FBF6' }}
            >
              <Shield size={26} color="#3EB489" />
            </View>
            <Text
              className="text-[22px] text-text-primary text-center"
              style={{ fontWeight: '600' }}
            >
              Your privacy matters
            </Text>
            <Text className="text-[14px] text-text-secondary text-center mt-1 px-4">
              Here's exactly what happens with your data — in plain English.
            </Text>
          </View>
        </Animated.View>

        <View className="gap-3">
          {PRIVACY_POINTS.map((point, i) => (
            <Animated.View
              key={point.title}
              entering={FadeInDown.duration(300).delay(100 + i * 80)}
            >
              <View className="bg-white rounded-card border border-surface-border p-4 flex-row items-start">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#F0FBF6' }}
                >
                  <point.icon size={18} color="#3EB489" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[14px] text-text-primary"
                    style={{ fontWeight: '600' }}
                  >
                    {point.title}
                  </Text>
                  <Text className="text-[13px] text-text-secondary mt-0.5">
                    {point.detail}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View className="px-5 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <MintButton fullWidth onPress={handleContinue}>
          I Understand — Continue
        </MintButton>
      </View>
    </View>
  );
}
