import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#3EB489',
          dark: '#2DA87A',
          hover: '#36A67D',
          active: '#359A75',
          light: '#F0FBF6',
          'light-2': '#E8F8F0',
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
          'border-hover': '#D1D5DB',
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
      },
      fontFamily: {
        inter: ['Inter'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        icon: '10px',
        hero: '24px',
        'sm-btn': '8px',
      },
      fontSize: {
        'hero': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'section-title': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'card-title': ['15px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'caption': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'badge': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'tiny': ['11px', { lineHeight: '1.5', fontWeight: '500' }],
        'micro': ['10px', { lineHeight: '1.5', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
