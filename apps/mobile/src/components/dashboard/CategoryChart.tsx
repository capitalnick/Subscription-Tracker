import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { CategoryBreakdown } from '@/types';

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const pieData = data.map((cat) => ({
    value: cat.value,
    color: cat.color,
    text: cat.name,
  }));

  return (
    <View
      className="bg-white rounded-card p-5"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-4">
        {/* Donut Chart */}
        <View className="w-[120px] h-[120px] items-center justify-center">
          <PieChart
            data={pieData}
            donut
            innerRadius={35}
            radius={55}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <Text className="text-[13px] text-text-muted" style={{ fontWeight: '600' }}>
                {data.length}
              </Text>
            )}
          />
        </View>

        {/* Legend */}
        <View className="flex-1 gap-3">
          {data.map((cat) => (
            <View key={cat.name} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <Text
                  className="text-[13px] text-text-body"
                  style={{ fontWeight: '500' }}
                >
                  {cat.name}
                </Text>
              </View>
              <Text
                className="text-[13px] text-text-primary"
                style={{ fontWeight: '600' }}
              >
                ${cat.value.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
