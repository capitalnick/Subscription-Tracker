import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { TOAST_DURATION } from '@/utils/constants';

interface FeedbackToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

export function FeedbackToast({ message, type, visible, onClose }: FeedbackToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#3EB489' : '#F87171';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`${type === 'success' ? 'Success' : 'Error'}: ${message}`}
      className="absolute top-12 left-4 right-4 z-50 rounded-button px-4 py-3 flex-row items-center gap-3"
      style={{ backgroundColor: bgColor, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
    >
      <Icon color="#FFFFFF" size={20} />
      <Text className="flex-1 text-white text-[14px]">{message}</Text>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <X color="#FFFFFF" size={16} />
      </Pressable>
    </Animated.View>
  );
}
