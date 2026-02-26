import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { signInWithEmail, signInWithGoogle, signInWithApple } from '@/services/auth';
import { MintButton } from '@/components/ui/MintButton';
import { FeedbackToast } from '@/components/ui/FeedbackToast';

export default function LoginScreen() {
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const result = await signInWithEmail(data.email, data.password);
    setLoading(false);

    if (!result.success) {
      setToast({ message: result.error ?? 'Sign in failed', type: 'error', visible: true });
      return;
    }

    // Auth state change listener in useAuth will update the store,
    // which triggers the (app)/_layout redirect to dashboard
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      setToast({ message: result.error ?? 'Google sign-in failed', type: 'error', visible: true });
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (!result.success) {
      setToast({ message: result.error ?? 'Apple sign-in failed', type: 'error', visible: true });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface-bg"
    >
      <FeedbackToast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      <View className="flex-1 justify-center px-5">
        <Text className="text-[28px] font-semibold text-text-primary tracking-tight mb-2">
          Welcome back
        </Text>
        <Text className="text-[15px] text-text-secondary mb-8">
          Sign in to manage your subscriptions.
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
                  placeholder="Your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoComplete="password"
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

          {/* Submit */}
          <View className="mt-2">
            <MintButton fullWidth loading={loading} onPress={handleSubmit(onSubmit)}>
              Sign In
            </MintButton>
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-4">
            <View className="flex-1 h-px bg-surface-border" />
            <Text className="text-text-muted text-[12px]">or</Text>
            <View className="flex-1 h-px bg-surface-border" />
          </View>

          {/* Social Auth */}
          <Pressable
            onPress={handleGoogleSignIn}
            className="bg-white border border-surface-border rounded-[10px] py-3 items-center flex-row justify-center gap-2"
          >
            <Text className="text-text-primary text-[14px] font-semibold">Continue with Google</Text>
          </Pressable>

          <Pressable
            onPress={handleAppleSignIn}
            className="bg-black rounded-[10px] py-3 items-center flex-row justify-center gap-2"
          >
            <Text className="text-white text-[14px] font-semibold">Continue with Apple</Text>
          </Pressable>
        </View>

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary text-[14px]">Don't have an account? </Text>
          <Link href="/(auth)/register" className="text-mint text-[14px] font-semibold">
            Sign Up
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
