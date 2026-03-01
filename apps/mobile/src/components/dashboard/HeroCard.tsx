import { View, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CreditCard, TrendingUp, ChevronRight } from 'lucide-react-native';
import { SpendComparison } from './SpendComparison';

interface HeroCardProps {
  totalMonthly: number;
  totalAnnual: number;
  activeCount: number;
}

export function HeroCard({ totalMonthly, totalAnnual, activeCount }: HeroCardProps) {
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Total monthly spend: $${totalMonthly.toFixed(2)}. Annual projection: $${totalAnnual.toFixed(2)}. ${activeCount} active subscriptions.`}
      className="bg-white rounded-card p-6"
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
    >
      {/* Label */}
      <View className="flex-row items-center gap-2 mb-1">
        <CreditCard size={16} color="#9CA3AF" />
        <Text className="text-[13px] text-text-muted" style={{ fontWeight: '500' }}>
          Total Monthly Spend
        </Text>
      </View>

      {/* Hero Amount */}
      <Animated.Text
        entering={ZoomIn.duration(500).delay(200)}
        className="text-mint tracking-tight"
        style={{ fontSize: 40, fontWeight: '700', lineHeight: 44 }}
      >
        ${totalMonthly.toFixed(2)}
      </Animated.Text>

      {/* Annual Projection */}
      <View className="flex-row items-center gap-1.5 mt-2">
        <TrendingUp size={16} color="#6B7280" />
        <Text className="text-[14px] text-text-secondary">
          That's{' '}
          <Text className="text-text-primary" style={{ fontWeight: '600' }}>
            ${totalAnnual.toFixed(2)}/year
          </Text>
        </Text>
      </View>

      {/* Spend Comparison */}
      <SpendComparison totalAnnual={totalAnnual} />

      {/* Divider + Count */}
      <View className="mt-4 pt-4 border-t border-surface-divider flex-row items-center justify-between">
        <Text className="text-[13px] text-text-muted">
          {activeCount} active subscriptions
        </Text>
        <View className="flex-row items-center gap-0.5">
          <Text className="text-[13px] text-mint" style={{ fontWeight: '600' }}>
            View all
          </Text>
          <ChevronRight size={14} color="#3EB489" />
        </View>
      </View>
    </View>
  );
}
