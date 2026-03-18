import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, FileText, Camera, Mail, PenLine } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MintButton } from '@/components/ui/MintButton';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useUploadPdf, useUploadScreenshot } from '@/hooks/useIngestion';

const METHOD_CONFIG = {
  pdf: {
    icon: FileText,
    title: 'Upload your first statement',
    desc: 'Pick a PDF bank or credit card statement. We\'ll scan it for subscriptions.',
    buttonLabel: 'Choose PDF',
  },
  screenshot: {
    icon: Camera,
    title: 'Take a screenshot',
    desc: 'Take a photo of your bank app showing recurring charges, or pick from your gallery.',
    buttonLabel: 'Choose Photo',
  },
  email: {
    icon: Mail,
    title: 'Set up email forwarding',
    desc: 'We\'ll show you your unique forwarding address. Forward any subscription email to it.',
    buttonLabel: 'Set Up Email',
  },
  manual: {
    icon: PenLine,
    title: 'Add your first subscription',
    desc: 'Enter the details of a subscription you know about. You can always add more later.',
    buttonLabel: 'Add Subscription',
  },
} as const;

export default function ImportActionScreen() {
  const insets = useSafeAreaInsets();
  const { method = 'pdf' } = useLocalSearchParams<{ method: string }>();
  const config = METHOD_CONFIG[method as keyof typeof METHOD_CONFIG] ?? METHOD_CONFIG.pdf;
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadPdf = useUploadPdf();
  const uploadScreenshot = useUploadScreenshot();

  const handlePickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setIsProcessing(true);
    const file = result.assets[0];
    uploadPdf.mutate(
      { fileUri: file.uri, fileName: file.name },
      {
        onSuccess: (data) => {
          router.push({
            pathname: '/(onboarding)/processing',
            params: { count: data.count.toString() },
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          Alert.alert('Error', (error as { message?: string }).message ?? 'Failed to process PDF');
        },
      },
    );
  }, [uploadPdf]);

  const handlePickScreenshot = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setIsProcessing(true);
    const asset = result.assets[0];
    uploadScreenshot.mutate(
      { fileUri: asset.uri, fileName: asset.fileName ?? `screenshot-${Date.now()}.jpg` },
      {
        onSuccess: (data) => {
          router.push({
            pathname: '/(onboarding)/processing',
            params: { count: data.count.toString() },
          });
        },
        onError: (error) => {
          setIsProcessing(false);
          Alert.alert('Error', (error as { message?: string }).message ?? 'Failed to process screenshot');
        },
      },
    );
  }, [uploadScreenshot]);

  const handleAction = () => {
    switch (method) {
      case 'pdf':
        handlePickPdf();
        break;
      case 'screenshot':
        handlePickScreenshot();
        break;
      case 'email':
        router.push('/(app)/email-setup');
        break;
      case 'manual':
        router.push('/(app)/manual-entry');
        break;
    }
  };

  const Icon = config.icon;

  return (
    <View className="flex-1 bg-surface-bg" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <View className="flex-1" />
      </View>

      <View className="flex-1 px-5 justify-center">
        <Animated.View entering={FadeInDown.duration(400)} className="items-center">
          <StepIndicator current={3} total={3} />

          <View
            className="w-20 h-20 rounded-full items-center justify-center mt-6 mb-4"
            style={{ backgroundColor: '#F0FBF6' }}
          >
            <Icon size={36} color="#3EB489" />
          </View>

          <Text
            className="text-[22px] text-text-primary text-center"
            style={{ fontWeight: '600' }}
          >
            {config.title}
          </Text>
          <Text className="text-[14px] text-text-secondary text-center mt-2 px-4">
            {config.desc}
          </Text>
        </Animated.View>
      </View>

      <View className="px-5 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <MintButton fullWidth onPress={handleAction} loading={isProcessing}>
          {config.buttonLabel}
        </MintButton>
        <Pressable
          onPress={() => {
            // Skip to app — they can import later
            router.replace('/(app)/dashboard');
          }}
          className="mt-3 py-2"
        >
          <Text className="text-center text-[14px] text-text-muted">
            Skip for now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
