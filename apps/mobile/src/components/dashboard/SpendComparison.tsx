import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, Line, Polyline, Ellipse } from 'react-native-svg';

// ---------------------------------------------------------------------------
// SVG Icons (thin-line, strokeWidth 1.5, 20x20)
// ---------------------------------------------------------------------------

const SIZE = 20;
const STROKE = '#6B7280';
const SW = 1.5;

function CoffeeIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <Path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <Line x1="6" y1="2" x2="6" y2="4" />
      <Line x1="10" y1="2" x2="10" y2="4" />
      <Line x1="14" y1="2" x2="14" y2="4" />
    </Svg>
  );
}

function ToastIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
      <Path d="M2 11h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
      <Path d="M6 19v2" />
      <Path d="M18 19v2" />
      <Line x1="8" y1="7" x2="16" y2="7" />
    </Svg>
  );
}

function BeerIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 11h1a3 3 0 0 1 0 6h-1" />
      <Path d="M5 8h12v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z" />
      <Path d="M7 3c0 1.5.5 2 2 2.5S12 7 12 8" />
      <Path d="M11 3c0 1.5.5 2 2 2.5S16 7 16 8" />
    </Svg>
  );
}

function PizzaIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L2 19.5h20L12 2z" />
      <Circle cx="10" cy="13" r="1" />
      <Circle cx="14" cy="11" r="1" />
      <Circle cx="11" cy="8" r="1" />
    </Svg>
  );
}

function IceCreamIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22l-4-10h8l-4 10z" />
      <Circle cx="12" cy="8" r="4" />
      <Path d="M8.5 9.5A4 4 0 0 1 8 8a4 4 0 0 1 8 0 4 4 0 0 1-.5 1.5" />
    </Svg>
  );
}

function MovieIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="2" width="20" height="20" rx="2" />
      <Path d="M7 2v20" />
      <Path d="M17 2v20" />
      <Path d="M2 12h20" />
      <Path d="M2 7h5" />
      <Path d="M2 17h5" />
      <Path d="M17 7h5" />
      <Path d="M17 17h5" />
    </Svg>
  );
}

function FuelIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <Path d="M15 12h2a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0V8l-3-3" />
      <Rect x="6" y="7" width="6" height="5" />
    </Svg>
  );
}

function FlightIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.8 19.2L16 11l3.5-3.5C20.3 6.7 21 5.3 21 4.5c0-1-.5-1.5-1.5-1.5-.8 0-2.2.7-3 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5 7.4 4.8-3.3 3.3-2-.6c-.4-.1-.8 0-1.1.3L4 15.4l3.8 1.8 1.8 3.8.7-.4c.3-.3.4-.7.3-1.1l-.6-2 3.3-3.3 4.8 7.4.5-.3c.4-.2.6-.6.5-1.1z" />
    </Svg>
  );
}

function ShirtIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 1 .84H6v10h12V10h2.14a1 1 0 0 0 1-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </Svg>
  );
}

function CartIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="9" cy="21" r="1" />
      <Circle cx="20" cy="21" r="1" />
      <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

interface Comparison {
  icon: () => React.JSX.Element;
  label: string;
  unitCost: number;
}

const COMPARISONS: Comparison[] = [
  { icon: CoffeeIcon, label: 'long blacks', unitCost: 5.0 },
  { icon: CoffeeIcon, label: 'flat whites', unitCost: 5.5 },
  { icon: ToastIcon, label: 'smashed-avo toasts', unitCost: 22.0 },
  { icon: BeerIcon, label: 'schooners at the pub', unitCost: 12.0 },
  { icon: PizzaIcon, label: 'Domino\'s pizzas', unitCost: 15.0 },
  { icon: IceCreamIcon, label: 'Messina gelatos', unitCost: 8.5 },
  { icon: MovieIcon, label: 'movie tickets', unitCost: 24.0 },
  { icon: FuelIcon, label: 'tanks of petrol', unitCost: 110.0 },
  { icon: FlightIcon, label: 'Sydney–Melbourne flights', unitCost: 130.0 },
  { icon: BeerIcon, label: 'six-packs of craft beer', unitCost: 25.0 },
  { icon: CartIcon, label: 'Woolies shops', unitCost: 180.0 },
  { icon: ShirtIcon, label: 'Uniqlo t-shirts', unitCost: 20.0 },
  { icon: CoffeeIcon, label: 'oat-milk lattes', unitCost: 6.5 },
  { icon: ToastIcon, label: 'chicken parmis', unitCost: 28.0 },
  { icon: IceCreamIcon, label: 'Boost Juice smoothies', unitCost: 10.0 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpendComparisonProps {
  totalAnnual: number;
}

export function SpendComparison({ totalAnnual }: SpendComparisonProps) {
  const comparison = useMemo(() => {
    const idx = Math.floor(Math.random() * COMPARISONS.length);
    return COMPARISONS[idx];
  }, []);

  const count = Math.floor(totalAnnual / comparison.unitCost);

  if (count < 1) return null;

  const Icon = comparison.icon;

  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(700)}
      className="flex-row items-center gap-2 mt-2"
    >
      <Icon />
      <Text className="text-[13px] text-text-secondary flex-1 flex-shrink">
        That's{' '}
        <Text className="text-text-primary" style={{ fontWeight: '700' }}>
          {count.toLocaleString()} {comparison.label}
        </Text>
      </Text>
    </Animated.View>
  );
}
