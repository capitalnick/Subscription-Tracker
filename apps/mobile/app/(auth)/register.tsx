import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { signUpWithEmail } from '@/services/auth';
import { MintButton } from '@/components/ui/MintButton';
import { FeedbackToast } from '@/components/ui/FeedbackToast';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'error',
    visible: false,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    const result = await signUpWithEmail(data.email, data.password);
    setLoading(false);

    if (!result.success) {
      setToast({ message: result.error ?? 'Sign up failed', type: 'error', visible: true });
      return;
    }

    setToast({
      message: 'Account created! Check your email to confirm.',
      type: 'success',
      visible: true,
    });

    // Supabase may auto-sign-in the user depending on project settings.
    // The onAuthStateChange listener in useAuth handles this.
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-bg"
    >
      <FeedbackToast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-5"
      >
        <Text className="text-[28px] font-semibold text-text-primary tracking-tight mb-2">
          Create account
        </Text>
        <Text className="text-[15px] text-text-secondary mb-8">
          Start tracking your subscriptions today.
        </Text>

        <View className="gap-4">
          {/* Email */}
          <View>
            <Text className="text-[13px] font-medium text-text-secondary mb-1.5">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-input rounded-button px-4 py-3 text-[15px] text-text-primary ${
                    errors.email ? 'border border-error' : ''
                  }`}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!loading}
                />
              )}
            />
            {errors.email && (
              <Text className="text-error text-[12px] mt-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View>
            <Text className="text-[13px] font-medium text-text-secondary mb-1.5">Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-input rounded-button px-4 py-3 text-[15px] text-text-primary ${
                    errors.password ? 'border border-error' : ''
                  }`}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!loading}
                />
              )}
            />
            {errors.password && (
              <Text className="text-error text-[12px] mt-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View>
            <Text className="text-[13px] font-medium text-text-secondary mb-1.5">
              Confirm Password
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-input rounded-button px-4 py-3 text-[15px] text-text-primary ${
                    errors.confirmPassword ? 'border border-error' : ''
                  }`}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!loading}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-error text-[12px] mt-1">{errors.confirmPassword.message}</Text>
            )}
          </View>

          {/* Submit */}
          <View className="mt-2">
            <MintButton fullWidth loading={loading} onPress={handleSubmit(onSubmit)}>
              Create Account
            </MintButton>
          </View>
        </View>

        {/* Login link */}
        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-text-secondary text-[14px]">Already have an account? </Text>
          <Link href="/(auth)/login" className="text-mint text-[14px] font-semibold">
            Sign In
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
