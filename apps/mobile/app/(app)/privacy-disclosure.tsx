import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function PrivacyDisclosureScreen() {
  const setHasSeenPrivacyDisclosure = useAuthStore((s) => s.setHasSeenPrivacyDisclosure);

  const handleAccept = () => {
    setHasSeenPrivacyDisclosure(true);
    router.replace('/(app)/ingest');
  };

  return (
    <View className="flex-1 bg-surface-bg px-5 justify-center">
      <Text className="text-[28px] font-semibold text-text-primary tracking-tight mb-4">
        How we handle your data
      </Text>

      <View className="bg-white rounded-card p-5 border border-surface-border gap-4">
        <Text className="text-[15px] text-text-body leading-relaxed">
          Your document is sent to Google's AI service for analysis. The document is processed in
          memory and never stored.
        </Text>
        <Text className="text-[15px] text-text-body leading-relaxed">
          Only the subscription names, amounts, and billing dates are saved to your account.
        </Text>
        <Text className="text-[15px] text-text-body leading-relaxed">
          AI-extracted fields are automatically purged after you review them, or after 30 days if
          left unreviewed.
        </Text>
      </View>

      <Pressable
        onPress={handleAccept}
        className="bg-mint rounded-button py-3.5 items-center mt-6 active:bg-mint-active"
      >
        <Text className="text-white text-[15px] font-semibold">I understand</Text>
      </Pressable>
    </View>
  );
}
