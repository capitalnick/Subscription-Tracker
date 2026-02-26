import { prisma } from '../lib/prisma.js';
import { normalizeToMonthly } from '../utils/currency.js';

interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
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

export async function getDashboardData(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId, isActive: true },
    include: { merchant: true },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate monthly totals
  let totalMonthly = 0;
  const categoryTotals: Record<string, number> = {};

  for (const sub of subscriptions) {
    const monthly = normalizeToMonthly(Number(sub.amount), sub.frequency);
    totalMonthly += monthly;
    categoryTotals[sub.category] = (categoryTotals[sub.category] ?? 0) + monthly;
  }

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] ?? '#9CA3AF',
    }))
    .sort((a, b) => b.value - a.value);

  // Upcoming renewals (next 7 days)
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = subscriptions.filter(
    (sub) =>
      sub.nextBillingDate && sub.nextBillingDate >= now && sub.nextBillingDate <= weekFromNow,
  );

  const formatSub = (sub: (typeof subscriptions)[number]) => ({
    id: sub.id,
    userId: sub.userId,
    merchantId: sub.merchantId,
    customName: sub.customName,
    displayName: sub.customName ?? sub.merchant?.canonicalName ?? 'Unknown',
    amount: Number(sub.amount),
    currency: sub.currency,
    frequency: sub.frequency,
    category: sub.category,
    nextBillingDate: sub.nextBillingDate?.toISOString() ?? null,
    isActive: sub.isActive,
    logoColor: sub.merchant?.logoColor ?? '#9CA3AF',
    logoLetter: sub.merchant?.logoLetter ?? '?',
    websiteUrl: sub.merchant?.websiteUrl ?? null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  });

  return {
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalAnnual: Math.round(totalMonthly * 12 * 100) / 100,
    activeCount: subscriptions.length,
    categoryBreakdown,
    subscriptions: subscriptions.map(formatSub),
    upcomingRenewals: upcomingRenewals.map(formatSub),
  };
}
