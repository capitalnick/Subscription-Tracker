import { Text } from 'react-native';

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <Text className="text-mint text-[14px] font-medium tracking-wide mb-1">
      STEP {current} OF {total}
    </Text>
  );
}
