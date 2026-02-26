import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { getClearbitLogoUrl } from '@/utils/constants';

interface MerchantLogoProps {
  websiteUrl?: string | null;
  logoLetter: string;
  logoColor: string;
  size?: number;
  merchantName?: string;
}

export function MerchantLogo({
  websiteUrl,
  logoLetter,
  logoColor,
  size = 48,
  merchantName,
}: MerchantLogoProps) {
  const [imageError, setImageError] = useState(false);

  const domain = websiteUrl ? new URL(websiteUrl).hostname.replace('www.', '') : null;
  const clearbitUrl = domain ? getClearbitLogoUrl(domain) : null;

  const showImage = clearbitUrl && !imageError;
  const borderRadius = size * 0.25;
  const label = merchantName ? `${merchantName} logo` : `${logoLetter} logo`;

  if (showImage) {
    return (
      <Image
        source={{ uri: clearbitUrl }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setImageError(true)}
        cachePolicy="disk"
        accessibilityLabel={label}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: logoColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: size * 0.375,
          fontWeight: '700',
          fontFamily: 'Inter_700Bold',
        }}
      >
        {logoLetter}
      </Text>
    </View>
  );
}
