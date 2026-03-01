import { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FileText, Camera, Mail, PenLine } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { IngestionCard } from '@/components/ingestion/IngestionCard';
import { MintButton } from '@/components/ui/MintButton';
import { FeedbackToast } from '@/components/ui/FeedbackToast';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useUploadPdf, useUploadScreenshot } from '@/hooks/useIngestion';
import type { IngestionMethod } from '@/types';

const ingestionOptions: {
  id: IngestionMethod;
  icon: typeof FileText;
  title: string;
  desc: string;
  badge: string | null;
}[] = [
  {
    id: 'pdf',
    icon: FileText,
    title: 'Upload PDF Statement',
    desc: 'Bank or credit card PDF',
    badge: 'Most Popular',
  },
  {
    id: 'screenshot',
    icon: Camera,
    title: 'Import Screenshot',
    desc: 'Photo of a charge or bill',
    badge: null,
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Forward Email',
    desc: 'Receipt or confirmation email',
    badge: null,
  },
  {
    id: 'manual',
    icon: PenLine,
    title: 'Add Manually',
    desc: 'Enter subscription details',
    badge: null,
  },
];

export default function IngestScreen() {
  const [selected, setSelected] = useState<IngestionMethod | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const uploadPdf = useUploadPdf();
  const uploadScreenshot = useUploadScreenshot();

  const isLoading = uploadPdf.isPending || uploadScreenshot.isPending;

  const handlePickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    uploadPdf.mutate(
      { fileUri: file.uri, fileName: file.name },
      {
        onSuccess: (data) => {
          setToast({
            message: `Import complete! We found ${data.count} subscription${data.count !== 1 ? 's' : ''}.`,
            type: 'success',
            visible: true,
          });
          setTimeout(() => router.push('/(app)/review'), 1200);
        },
        onError: (error) => {
          setToast({
            message: (error as { message?: string }).message ?? 'Failed to process PDF. Please try again.',
            type: 'error',
            visible: true,
          });
        },
      },
    );
  }, [uploadPdf]);

  const handlePickScreenshot = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos to import screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `screenshot-${Date.now()}.jpg`;
    uploadScreenshot.mutate(
      { fileUri: asset.uri, fileName },
      {
        onSuccess: (data) => {
          setToast({
            message: `Import complete! We found ${data.count} subscription${data.count !== 1 ? 's' : ''}.`,
            type: 'success',
            visible: true,
          });
          setTimeout(() => router.push('/(app)/review'), 1200);
        },
        onError: (error) => {
          setToast({
            message: (error as { message?: string }).message ?? 'Failed to process screenshot. Please try again.',
            type: 'error',
            visible: true,
          });
        },
      },
    );
  }, [uploadScreenshot]);

  const handleContinue = useCallback(() => {
    if (!selected) return;

    switch (selected) {
      case 'pdf':
        handlePickPdf();
        break;
      case 'screenshot':
        handlePickScreenshot();
        break;
      case 'email':
        Alert.alert(
          'Forward Your Email',
          'Forward any subscription receipt or confirmation email to:\n\nimport@subtracker.app\n\nWe\'ll process it and add it to your review queue.',
          [
            { text: 'OK', onPress: () => router.push('/(app)/review') },
          ],
        );
        break;
      case 'manual':
        // TODO: Navigate to manual entry form
        router.push('/(app)/review');
        break;
    }
  }, [selected, handlePickPdf, handlePickScreenshot]);

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      <FeedbackToast
        {...toast}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <Animated.View entering={FadeInDown.duration(400)}>
          <StepIndicator current={1} total={3} />
          <Text
            className="text-[28px] text-text-primary tracking-tight"
            style={{ fontWeight: '600', lineHeight: 34 }}
          >
            Let's find your{'\n'}subscriptions
          </Text>
          <Text className="text-[15px] text-text-secondary mt-2">
            Choose how you'd like to import your recurring charges.
          </Text>
        </Animated.View>
      </View>

      {/* Card Grid — 2 columns */}
      <View className="px-5 flex-row flex-wrap gap-3">
        {ingestionOptions.map((opt, i) => (
          <View key={opt.id} className="w-[48%]">
            <IngestionCard
              icon={opt.icon}
              title={opt.title}
              description={opt.desc}
              badge={opt.badge}
              isSelected={selected === opt.id}
              onPress={() => setSelected(opt.id)}
              index={i}
            />
          </View>
        ))}
      </View>

      {/* Continue Button */}
      <View className="px-5 mt-8">
        <MintButton
          fullWidth
          disabled={!selected}
          loading={isLoading}
          onPress={handleContinue}
        >
          Continue
        </MintButton>
        <Text className="text-center text-[12px] text-text-muted mt-3">
          Your data stays on this device. We never store your bank details.
        </Text>
      </View>
    </SafeAreaView>
  );
}
