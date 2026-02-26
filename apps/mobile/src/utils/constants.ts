export const API_TIMEOUT = 15000;

export const TOAST_DURATION = 3500;

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#3EB489',
  Productivity: '#6366F1',
  Cloud: '#3693F5',
  Finance: '#F59E0B',
  Health: '#EF4444',
  News: '#8B5CF6',
  Education: '#06B6D4',
  Gaming: '#EC4899',
  Music: '#1DB954',
  Shopping: '#F97316',
  Utilities: '#6B7280',
  Other: '#9CA3AF',
};

export function getClearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}
