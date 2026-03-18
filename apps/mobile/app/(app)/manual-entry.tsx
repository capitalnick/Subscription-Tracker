import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { MintButton } from '@/components/ui/MintButton';
import { useCreateManualSubscription } from '@/hooks/useIngestion';
import { searchMerchants } from '@/services/merchant';
import type { SubscriptionFrequency, SubscriptionCategory, Merchant } from '@/types';

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

const CATEGORIES: { value: SubscriptionCategory; label: string }[] = [
  { value: 'STREAMING_VIDEO', label: 'Video' },
  { value: 'STREAMING_MUSIC', label: 'Music' },
  { value: 'GAMING', label: 'Gaming' },
  { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'CLOUD_STORAGE', label: 'Cloud' },
  { value: 'FITNESS', label: 'Fitness' },
  { value: 'FOOD_DELIVERY', label: 'Food' },
  { value: 'NEWS_MAGAZINES', label: 'News' },
  { value: 'INTERNET_PHONE', label: 'Internet' },
  { value: 'VPN_SECURITY', label: 'VPN' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SHOPPING_BOXES', label: 'Shopping' },
  { value: 'FINANCE_INVEST', label: 'Finance' },
  { value: 'OTHER', label: 'Other' },
];

export default function ManualEntryScreen() {
  const insets = useSafeAreaInsets();
  const createManualSubscription = useCreateManualSubscription();

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AUD');
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('monthly');
  const [category, setCategory] = useState<SubscriptionCategory>('OTHER');
  const [nextBillingDate, setNextBillingDate] = useState('');

  // Merchant autocomplete state
  const [merchantResults, setMerchantResults] = useState<Merchant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced merchant search
  useEffect(() => {
    if (name.length < 2) {
      setMerchantResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchMerchants(name);
        setMerchantResults(response.merchants);
        setShowDropdown(response.merchants.length > 0);
      } catch {
        setMerchantResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [name]);

  const handleSelectMerchant = useCallback((merchant: Merchant) => {
    setName(merchant.canonicalName);
    setCategory(merchant.category);
    setShowDropdown(false);
    setMerchantResults([]);
    Keyboard.dismiss();
  }, []);

  const isFormValid =
    name.trim().length > 0 &&
    amount.trim().length > 0 &&
    parseFloat(amount) > 0 &&
    currency.trim().length > 0;

  const handleSubmit = useCallback(() => {
    if (!isFormValid) return;

    createManualSubscription.mutate(
      {
        name: name.trim(),
        amount: parseFloat(amount),
        currency: currency.trim().toUpperCase(),
        frequency,
        category,
        nextBillingDate: nextBillingDate.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Subscription added successfully.', [
            {
              text: 'OK',
              onPress: () => router.push('/(app)/review'),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            'Error',
            (error as { message?: string }).message ?? 'Failed to add subscription. Please try again.',
          );
        },
      },
    );
  }, [isFormValid, name, amount, currency, frequency, category, nextBillingDate, createManualSubscription]);

  return (
    <View className="flex-1 bg-surface-bg" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3 mb-4">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#1A1D21" />
          </Pressable>
          <Text
            className="text-[20px] text-text-primary tracking-tight"
            style={{ fontWeight: '600' }}
          >
            Add Subscription
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name field with autocomplete */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <View className="bg-white rounded-card border border-surface-border p-4 mb-3">
            <Text className="text-[13px] text-text-secondary mb-2" style={{ fontWeight: '500' }}>
              Name
            </Text>
            <TextInput
              className="bg-white border border-surface-border rounded-lg px-4 py-3 text-[15px] text-text-primary"
              placeholder="e.g. Netflix, Spotify"
              placeholderTextColor="#A0A5AB"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Merchant autocomplete dropdown */}
            {showDropdown && merchantResults.length > 0 && (
              <View className="border border-surface-border rounded-lg mt-1 overflow-hidden">
                {merchantResults.map((merchant) => (
                  <Pressable
                    key={merchant.id}
                    className="px-4 py-3 border-b border-surface-border active:bg-surface-bg"
                    onPress={() => handleSelectMerchant(merchant)}
                  >
                    <Text className="text-[15px] text-text-primary" style={{ fontWeight: '500' }}>
                      {merchant.canonicalName}
                    </Text>
                    <Text className="text-[12px] text-text-muted mt-0.5">
                      {merchant.category.replace(/_/g, ' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        {/* Amount and Currency row */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View className="bg-white rounded-card border border-surface-border p-4 mb-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[13px] text-text-secondary mb-2" style={{ fontWeight: '500' }}>
                  Amount
                </Text>
                <View className="flex-row items-center border border-surface-border rounded-lg overflow-hidden">
                  <Text className="pl-4 text-[15px] text-text-muted" style={{ fontWeight: '500' }}>
                    $
                  </Text>
                  <TextInput
                    className="flex-1 px-2 py-3 text-[15px] text-text-primary"
                    placeholder="0.00"
                    placeholderTextColor="#A0A5AB"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View className="w-24">
                <Text className="text-[13px] text-text-secondary mb-2" style={{ fontWeight: '500' }}>
                  Currency
                </Text>
                <TextInput
                  className="bg-white border border-surface-border rounded-lg px-4 py-3 text-[15px] text-text-primary"
                  value={currency}
                  onChangeText={setCurrency}
                  autoCapitalize="characters"
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Frequency picker */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <View className="bg-white rounded-card border border-surface-border p-4 mb-3">
            <Text className="text-[13px] text-text-secondary mb-3" style={{ fontWeight: '500' }}>
              Frequency
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <Pressable
                  key={f.value}
                  onPress={() => setFrequency(f.value)}
                  className={`px-4 py-2 rounded-full border ${
                    frequency === f.value
                      ? 'bg-mint/10 border-mint'
                      : 'bg-white border-surface-border'
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      frequency === f.value ? 'text-mint' : 'text-text-secondary'
                    }`}
                    style={{ fontWeight: frequency === f.value ? '600' : '400' }}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Category picker */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View className="bg-white rounded-card border border-surface-border p-4 mb-3">
            <Text className="text-[13px] text-text-secondary mb-3" style={{ fontWeight: '500' }}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.value}
                    onPress={() => setCategory(c.value)}
                    className={`px-4 py-2 rounded-full border ${
                      category === c.value
                        ? 'bg-mint/10 border-mint'
                        : 'bg-white border-surface-border'
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        category === c.value ? 'text-mint' : 'text-text-secondary'
                      }`}
                      style={{ fontWeight: category === c.value ? '600' : '400' }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Next billing date */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <View className="bg-white rounded-card border border-surface-border p-4 mb-6">
            <Text className="text-[13px] text-text-secondary mb-2" style={{ fontWeight: '500' }}>
              Next Billing Date
            </Text>
            <TextInput
              className="bg-white border border-surface-border rounded-lg px-4 py-3 text-[15px] text-text-primary"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A0A5AB"
              value={nextBillingDate}
              onChangeText={setNextBillingDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            <Text className="text-[12px] text-text-muted mt-1.5">
              Optional. Format: YYYY-MM-DD
            </Text>
          </View>
        </Animated.View>

        {/* Submit button */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <MintButton
            fullWidth
            disabled={!isFormValid}
            loading={createManualSubscription.isPending}
            onPress={handleSubmit}
          >
            Add Subscription
          </MintButton>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
