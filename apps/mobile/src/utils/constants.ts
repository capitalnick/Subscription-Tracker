import type { SubscriptionCategory } from '@/types/models';

export const API_TIMEOUT = 15000;

export const TOAST_DURATION = 3500;

export interface CategoryConfig {
  label: string;
  icon: string;
  colour: string;
  groupLabel: string;
}

export const CATEGORY_CONFIG: Record<SubscriptionCategory, CategoryConfig> = {
  STREAMING_VIDEO: { label: 'Streaming Video', icon: 'Tv', colour: '#E63946', groupLabel: 'Media' },
  STREAMING_MUSIC: { label: 'Music', icon: 'Music', colour: '#9B5DE5', groupLabel: 'Media' },
  GAMING: { label: 'Gaming', icon: 'Gamepad2', colour: '#F77F00', groupLabel: 'Media' },
  PODCASTS_AUDIO: { label: 'Podcasts & Audio', icon: 'Headphones', colour: '#B5179E', groupLabel: 'Media' },
  PRODUCTIVITY: { label: 'Productivity', icon: 'Briefcase', colour: '#2196F3', groupLabel: 'Work' },
  CLOUD_STORAGE: { label: 'Cloud Storage', icon: 'Cloud', colour: '#00B4D8', groupLabel: 'Work' },
  SOFTWARE_TOOLS: { label: 'Software', icon: 'Code2', colour: '#3D405B', groupLabel: 'Work' },
  COMMUNICATION: { label: 'Communication', icon: 'MessageSquare', colour: '#7209B7', groupLabel: 'Work' },
  FITNESS: { label: 'Fitness & Wellness', icon: 'Dumbbell', colour: '#06D6A0', groupLabel: 'Lifestyle' },
  FOOD_DELIVERY: { label: 'Food Delivery', icon: 'UtensilsCrossed', colour: '#FB5607', groupLabel: 'Lifestyle' },
  NEWS_MAGAZINES: { label: 'News & Magazines', icon: 'Newspaper', colour: '#495057', groupLabel: 'Lifestyle' },
  INTERNET_PHONE: { label: 'Internet & Phone', icon: 'Wifi', colour: '#023E8A', groupLabel: 'Utilities' },
  UTILITIES_HOME: { label: 'Home Utilities', icon: 'Zap', colour: '#ADB5BD', groupLabel: 'Utilities' },
  VPN_SECURITY: { label: 'VPN & Security', icon: 'Shield', colour: '#4CAF50', groupLabel: 'Utilities' },
  FINANCE_INVEST: { label: 'Finance & Investing', icon: 'TrendingUp', colour: '#FFB703', groupLabel: 'Finance' },
  SHOPPING_BOXES: { label: 'Subscriptions & Boxes', icon: 'Package', colour: '#F4A261', groupLabel: 'Shopping' },
  PRIME_MEMBERSHIPS: { label: 'Memberships', icon: 'Star', colour: '#E9C46A', groupLabel: 'Shopping' },
  EDUCATION: { label: 'Education', icon: 'GraduationCap', colour: '#8BC34A', groupLabel: 'Learning' },
  OTHER: { label: 'Other', icon: 'Receipt', colour: '#ADB5BD', groupLabel: 'Other' },
};

// Legacy category mapping for backwards compatibility
const LEGACY_CATEGORY_MAP: Record<string, SubscriptionCategory> = {
  Entertainment: 'STREAMING_VIDEO',
  Music: 'STREAMING_MUSIC',
  Gaming: 'GAMING',
  Productivity: 'PRODUCTIVITY',
  Cloud: 'CLOUD_STORAGE',
  Finance: 'FINANCE_INVEST',
  Health: 'FITNESS',
  News: 'NEWS_MAGAZINES',
  Education: 'EDUCATION',
  Shopping: 'PRIME_MEMBERSHIPS',
  Utilities: 'UTILITIES_HOME',
  Software: 'SOFTWARE_TOOLS',
  Other: 'OTHER',
};

export function resolveCategoryConfig(category: string): CategoryConfig {
  const mapped = LEGACY_CATEGORY_MAP[category];
  if (mapped) return CATEGORY_CONFIG[mapped];
  return CATEGORY_CONFIG[category as SubscriptionCategory] ?? CATEGORY_CONFIG.OTHER;
}

export function getCategoryColor(category: string): string {
  return resolveCategoryConfig(category).colour;
}

export function getCategoryLabel(category: string): string {
  return resolveCategoryConfig(category).label;
}

export function getClearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}
