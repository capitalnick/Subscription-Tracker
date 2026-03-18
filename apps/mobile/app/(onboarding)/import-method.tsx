import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FileText, Camera, Mail, PenLine, ArrowLeft } from 'lucide-react-native';
import { MintButton } from '@/components/ui/MintButton';
import { StepIndicator } from '@/components/ui/StepIndicator';

const METHODS = [
  {
    id: 'pdf' as const,
    icon: FileText,
    title: 'Upload PDF Statement',
    desc: 'Bank or credit card PDF — we find every charge',
    badge: 'Recommended',
  },
  {
    id: 'screenshot' as const,
    icon: Camera,
    title: 'Take a Screenshot',
    desc: 'Photo of your bank app or a billing page',
    badge: null,
  },
  {
    id: 'email' as const,
    icon: Mail,
    title: 'Forward an Email',
    desc: 'Send us a subscription receipt or confirmation',
    badge: null,
  },
  {
    id: 'manual' as const,
    icon: PenLine,
    title: 'Enter Manually',
    desc: 'Type in the details yourself',
    badge: null,
  },
];

type MethodId = (typeof METHODS)[number]['id'];

export default function ImportMethodScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<MethodId | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({
      pathname: '/(onboarding)/privacy',
      params: { method: selected },
    });
  };

  return (
    <View
      className="flex-1 bg-surface-bg"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <View className="flex-1" />
      </View>

      <View className="px-5 flex-1">
        <Animated.View entering={FadeInDown.duration(400)}>
          <StepIndicator current={1} total={3} />
          <Text
            className="text-[24px] text-text-primary mt-3"
            style={{ fontWeight: '600', lineHeight: 30 }}
          >
            How would you like{'\n'}to import?
          </Text>
          <Text className="text-[14px] text-text-secondary mt-1">
            Pick any method — you can always add more later.
          </Text>
        </Animated.View>

        <View className="mt-6 gap-3">
          {METHODS.map((method, i) => (
            <Animated.View key={method.id} entering={FadeInDown.duration(300).delay(100 + i * 80)}>
              <Pressable
                onPress={() => setSelected(method.id)}
                className="flex-row items-center p-4 rounded-card border bg-white"
                style={{
                  borderColor: selected === method.id ? '#3EB489' : '#E5E7EB',
                  backgroundColor: selected === method.id ? '#FAFFFE' : '#FFF',
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: selected === method.id ? '#F0FBF6' : '#F3F4F6',
                  }}
                >
                  <method.icon
                    size={20}
                    color={selected === method.id ? '#3EB489' : '#6B7280'}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-[14px] text-text-primary"
                      style={{ fontWeight: '600' }}
                    >
                      {method.title}
                    </Text>
                    {method.badge && (
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0FBF6' }}>
                        <Text className="text-[10px] text-mint" style={{ fontWeight: '600' }}>
                          {method.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[12px] text-text-muted mt-0.5">
                    {method.desc}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      <View className="px-5 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <MintButton fullWidth disabled={!selected} onPress={handleContinue}>
          Continue
        </MintButton>
      </View>
    </View>
  );
}
