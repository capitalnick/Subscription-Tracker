import type { SubscriptionFrequency } from '@/types';

export function formatCurrency(amount: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function normalizeToMonthly(amount: number, frequency: SubscriptionFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.33;
    case 'fortnightly':
      return amount * 2.167;
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'annual':
      return amount / 12;
    default:
      return amount;
  }
}

export function frequencyLabel(frequency: SubscriptionFrequency): string {
  const labels: Record<SubscriptionFrequency, string> = {
    weekly: '/week',
    fortnightly: '/fortnight',
    monthly: '/month',
    quarterly: '/quarter',
    annual: '/year',
  };
  return labels[frequency];
}
