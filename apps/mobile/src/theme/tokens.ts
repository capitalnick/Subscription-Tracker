export const colors = {
  mint: {
    DEFAULT: '#3EB489',
    dark: '#2DA87A',
    hover: '#36A67D',
    active: '#359A75',
    light: '#F0FBF6',
    light2: '#E8F8F0',
    '10': 'rgba(62, 180, 137, 0.1)',
  },
  error: {
    DEFAULT: '#F87171',
    light: '#FEF2F2',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    body: '#374151',
  },
  surface: {
    bg: '#FAFBFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    borderHover: '#D1D5DB',
    divider: '#F3F4F6',
    muted: '#F9FAFB',
    input: '#F3F4F6',
  },
  chart: {
    entertainment: '#3EB489',
    productivity: '#6366F1',
    cloud: '#3693F5',
    finance: '#F59E0B',
    health: '#EF4444',
  },
} as const;

export const radii = {
  card: 16,
  button: 12,
  icon: 10,
  hero: 24,
  smBtn: 8,
  full: 9999,
} as const;

export const spacing = {
  pagePx: 20,
  pageTop: 56,
  cardPadding: 16,
  heroCardPadding: 24,
  sectionGap: 24,
  listGap: 12,
} as const;
