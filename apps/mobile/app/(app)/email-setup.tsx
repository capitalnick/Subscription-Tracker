import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Copy, Mail, Shield, CheckCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MintButton } from '@/components/ui/MintButton';

const FORWARDING_DOMAIN = 'bills.subtake.app';

const SETUP_STEPS = [
  {
    step: 1,
    title: 'Find a subscription email',
    description: 'Open a receipt, confirmation, or billing email from any subscription service.',
  },
  {
    step: 2,
    title: 'Forward it to your address',
    description: 'Use your email app\'s forward button to send it to your unique SubTake address below.',
  },
  {
    step: 3,
    title: 'We extract the details',
    description: 'Our AI reads the email, pulls out the subscription info, and adds it to your review queue.',
  },
  {
    step: 4,
    title: 'Review and confirm',
    description: 'Check the extracted details in your review queue. Confirm to add it to your dashboard.',
  },
];

export default function EmailSetupScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const forwardingAddress = user?.forwardingAddress
    ? `${user.forwardingAddress}@${FORWARDING_DOMAIN}`
    : null;

  const handleCopy = async () => {
    if (!forwardingAddress) return;
    await Clipboard.setStringAsync(forwardingAddress);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          Email Forwarding
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-5 mt-4 flex-1">
        {/* Intro */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View className="items-center mb-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: '#F0FBF6' }}
            >
              <Mail size={28} color="#3EB489" />
            </View>
            <Text
              className="text-[20px] text-text-primary text-center"
              style={{ fontWeight: '600' }}
            >
              Forward subscription emails
            </Text>
            <Text className="text-[14px] text-text-secondary text-center mt-1">
              We'll automatically extract the subscription details.
            </Text>
          </View>
        </Animated.View>

        {/* Forwarding Address */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text
            className="text-[13px] text-text-muted uppercase tracking-wide mb-2"
            style={{ fontWeight: '600' }}
          >
            Your forwarding address
          </Text>
          <Pressable
            onPress={handleCopy}
            className="bg-white rounded-card border border-surface-border p-4 flex-row items-center"
          >
            <Text
              className="text-[15px] text-text-primary flex-1"
              style={{ fontFamily: 'SpaceMono' }}
              selectable
            >
              {forwardingAddress ?? 'Loading...'}
            </Text>
            {copied ? (
              <CheckCircle size={20} color="#3EB489" />
            ) : (
              <Copy size={20} color="#9CA3AF" />
            )}
          </Pressable>
          <Text className="text-[12px] text-text-muted mt-1 ml-1">
            {copied ? 'Copied to clipboard!' : 'Tap to copy'}
          </Text>
        </Animated.View>

        {/* Setup Steps */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mt-6">
          <Text
            className="text-[13px] text-text-muted uppercase tracking-wide mb-2"
            style={{ fontWeight: '600' }}
          >
            How it works
          </Text>
          <View className="bg-white rounded-card border border-surface-border overflow-hidden">
            {SETUP_STEPS.map((step, i) => (
              <View key={step.step}>
                {i > 0 && <View className="h-px bg-surface-divider mx-4" />}
                <View className="flex-row px-4 py-3.5">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                    style={{ backgroundColor: '#F0FBF6' }}
                  >
                    <Text
                      className="text-[12px] text-mint"
                      style={{ fontWeight: '700' }}
                    >
                      {step.step}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[14px] text-text-primary"
                      style={{ fontWeight: '600' }}
                    >
                      {step.title}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-0.5">
                      {step.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Privacy Note */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mt-4">
          <View className="flex-row items-start bg-surface-muted rounded-card p-4">
            <Shield size={16} color="#6B7280" style={{ marginTop: 2 }} />
            <View className="flex-1 ml-3">
              <Text
                className="text-[13px] text-text-secondary"
                style={{ fontWeight: '600' }}
              >
                What we do with your emails
              </Text>
              <Text className="text-[12px] text-text-muted mt-1">
                We extract subscription details using AI, then immediately discard the
                email content. We never store the raw email, attachments, or any personal
                messages. All AI-extracted data is purged after you review it.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Done Button */}
      <View className="px-5 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <MintButton fullWidth onPress={() => router.push('/(app)/review')}>
          Done
        </MintButton>
      </View>
    </View>
  );
}
