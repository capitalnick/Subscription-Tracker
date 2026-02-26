import { View, Text } from 'react-native';

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <View
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'rgba(62, 180, 137, 0.1)' }}
      accessible
      accessibilityLabel={`Category: ${category}`}
    >
      <Text className="text-[12px] font-medium text-mint">{category}</Text>
    </View>
  );
}
