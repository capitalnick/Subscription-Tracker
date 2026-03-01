import { View, Text } from 'react-native';
import { resolveCategoryConfig } from '@/utils/constants';

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = resolveCategoryConfig(category);

  return (
    <View
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: config.colour + '18' }}
      accessible
      accessibilityLabel={`Category: ${config.label}`}
    >
      <Text className="text-[12px] font-medium" style={{ color: config.colour }}>
        {config.label}
      </Text>
    </View>
  );
}
