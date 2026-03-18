import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  User,
  LogOut,
  Trash2,
  Shield,
  ChevronRight,
  Mail,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import { signOut, deleteAccount } from '@/services/auth';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const result = await deleteAccount();
            if (result.success) {
              router.replace('/(auth)/login');
            } else {
              Alert.alert('Error', result.error ?? 'Failed to delete account');
            }
          },
        },
      ],
    );
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
          Settings
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-5 mt-4">
        {/* Account Section */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text
            className="text-[13px] text-text-muted uppercase tracking-wide mb-2"
            style={{ fontWeight: '600' }}
          >
            Account
          </Text>

          <View className="bg-white rounded-card border border-surface-border overflow-hidden">
            <SettingsRow
              icon={User}
              label="Account"
              value={user?.email ?? 'Not signed in'}
            />
            <View className="h-px bg-surface-divider mx-4" />
            <SettingsRow icon={Mail} label="Email" value={user?.email ?? '—'} />
          </View>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mt-6">
          <Text
            className="text-[13px] text-text-muted uppercase tracking-wide mb-2"
            style={{ fontWeight: '600' }}
          >
            Privacy
          </Text>

          <View className="bg-white rounded-card border border-surface-border overflow-hidden">
            <Pressable
              onPress={() => Linking.openURL('https://subtake.app/privacy')}
              className="flex-row items-center px-4 py-3.5"
            >
              <Shield size={18} color="#9CA3AF" />
              <Text className="text-[14px] text-text-primary ml-3 flex-1">
                Privacy Policy
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Actions Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mt-6">
          <Text
            className="text-[13px] text-text-muted uppercase tracking-wide mb-2"
            style={{ fontWeight: '600' }}
          >
            Actions
          </Text>

          <View className="bg-white rounded-card border border-surface-border overflow-hidden">
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center px-4 py-3.5"
            >
              <LogOut size={18} color="#6B7280" />
              <Text className="text-[14px] text-text-primary ml-3 flex-1">
                Sign Out
              </Text>
            </Pressable>
            <View className="h-px bg-surface-divider mx-4" />
            <Pressable
              onPress={handleDeleteAccount}
              className="flex-row items-center px-4 py-3.5"
            >
              <Trash2 size={18} color="#F87171" />
              <Text className="text-[14px] text-error ml-3 flex-1">
                Delete Account
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Version */}
        <Text className="text-center text-text-muted text-[12px] mt-8">
          SubTake v1.0.0
        </Text>
      </View>
    </View>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5">
      <Icon size={18} color="#9CA3AF" />
      <Text className="text-[14px] text-text-secondary ml-3">{label}</Text>
      <Text
        className="text-[14px] text-text-primary ml-auto"
        numberOfLines={1}
        style={{ fontWeight: '500', maxWidth: 200 }}
      >
        {value}
      </Text>
    </View>
  );
}
