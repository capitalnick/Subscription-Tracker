/**
 * Normalize a subscription amount to its monthly equivalent.
 */
export function normalizeToMonthly(amount: number, frequency: string): number {
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
