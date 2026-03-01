import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Tv, Music, Gamepad2, Headphones, Briefcase, Cloud, Code2,
  MessageSquare, Dumbbell, UtensilsCrossed, Newspaper, Wifi,
  Zap, Shield, TrendingUp, Package, Star, GraduationCap, Receipt,
  CreditCard,
} from 'lucide-react-native';
import { resolveCategoryConfig, getClearbitLogoUrl } from '@/utils/constants';
import type { Merchant } from '@/types/models';

const ICON_MAP: Record<string, typeof Tv> = {
  Tv, Music, Gamepad2, Headphones, Briefcase, Cloud, Code2,
  MessageSquare, Dumbbell, UtensilsCrossed, Newspaper, Wifi,
  Zap, Shield, TrendingUp, Package, Star, GraduationCap, Receipt,
  CreditCard,
};

interface MerchantIconProps {
  merchant?: Merchant | null;
  /** Fallback: used when merchant is null or has no logo */
  logoUrl?: string | null;
  websiteUrl?: string | null;
  logoLetter?: string;
  logoColor?: string;
  fallbackCategory?: string;
  size?: number;
  merchantName?: string;
}

export function MerchantIcon({
  merchant,
  logoUrl,
  websiteUrl,
  logoLetter,
  logoColor,
  fallbackCategory,
  size = 48,
  merchantName,
}: MerchantIconProps) {
  const [imageError, setImageError] = useState(false);

  // Resolve values from merchant or props
  const resolvedLogoUrl = merchant?.logoUrl ?? logoUrl ?? null;
  const resolvedWebsiteUrl = merchant?.websiteUrl ?? websiteUrl ?? null;
  const resolvedLetter = merchant?.logoLetter ?? logoLetter ?? '?';
  const resolvedColor = merchant?.logoColor ?? logoColor ?? '#9CA3AF';
  const resolvedCategory = merchant?.category ?? fallbackCategory ?? 'OTHER';

  // Try logo_url first, then Clearbit, then category icon
  const domain = resolvedWebsiteUrl ? (() => {
    try { return new URL(resolvedWebsiteUrl).hostname.replace('www.', ''); }
    catch { return null; }
  })() : null;
  const clearbitUrl = domain ? getClearbitLogoUrl(domain) : null;
  const imageUrl = resolvedLogoUrl ?? clearbitUrl;

  const borderRadius = size * 0.22;
  const label = merchantName ?? merchant?.canonicalName ?? resolvedLetter;

  // Tier 1: Logo image (either logo_url or Clearbit)
  if (imageUrl && !imageError) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.08)',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
          cachePolicy="disk"
          accessibilityLabel={`${label} logo`}
        />
      </View>
    );
  }

  // Tier 2: Category icon on tinted background
  const config = resolveCategoryConfig(resolvedCategory);
  const IconComponent = ICON_MAP[config.icon] ?? Receipt;
  const iconSize = size * 0.45;

  return (
    <View
      accessible
      accessibilityLabel={`${label} logo`}
      accessibilityRole="image"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: config.colour + '15',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
      }}
    >
      <IconComponent size={iconSize} color={config.colour} />
    </View>
  );
}
