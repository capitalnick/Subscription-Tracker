import { prisma } from '../lib/prisma.js';
import { normalizeToMonthly } from '../utils/currency.js';

interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING_VIDEO: '#E63946',
  STREAMING_MUSIC: '#9B5DE5',
  GAMING: '#F77F00',
  PODCASTS_AUDIO: '#B5179E',
  PRODUCTIVITY: '#2196F3',
  CLOUD_STORAGE: '#00B4D8',
  SOFTWARE_TOOLS: '#3D405B',
  COMMUNICATION: '#7209B7',
  FITNESS: '#06D6A0',
  FOOD_DELIVERY: '#FB5607',
  NEWS_MAGAZINES: '#495057',
  INTERNET_PHONE: '#023E8A',
  UTILITIES_HOME: '#ADB5BD',
  VPN_SECURITY: '#4CAF50',
  FINANCE_INVEST: '#FFB703',
  SHOPPING_BOXES: '#F4A261',
  PRIME_MEMBERSHIPS: '#E9C46A',
  EDUCATION: '#8BC34A',
  OTHER: '#ADB5BD',
  // Legacy fallbacks
  Entertainment: '#E63946',
  Music: '#9B5DE5',
  Productivity: '#2196F3',
  Cloud: '#00B4D8',
  Finance: '#FFB703',
  Health: '#06D6A0',
  News: '#495057',
  Education: '#8BC34A',
  Gaming: '#F77F00',
  Shopping: '#E9C46A',
  Utilities: '#ADB5BD',
};

export async function getDashboardData(userId: string) {
  const subs = await prisma.subscription.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { merchant: true },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate monthly totals
  let totalMonthly = 0;
  const categoryTotals: Record<string, number> = {};

  for (const sub of subs) {
    const monthly = normalizeToMonthly(Number(sub.amount), sub.frequency);
    totalMonthly += monthly;
    categoryTotals[sub.category] = (categoryTotals[sub.category] ?? 0) + monthly;
  }

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] ?? '#ADB5BD',
    }))
    .sort((a, b) => b.value - a.value);

  // Upcoming renewals (next 7 days)
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = subs.filter(
    (sub) =>
      sub.nextBillingDate &&
      sub.nextBillingDate >= now &&
      sub.nextBillingDate <= weekFromNow,
  );

  const formatSub = (sub: (typeof subs)[number]) => {
    const merchant = sub.merchant;
    const knownPlans = (merchant?.knownPlans as unknown[]) ?? [];
    return {
      id: sub.id,
      userId: sub.userId,
      merchantId: sub.merchantId,
      customName: sub.customName,
      displayName: sub.customName ?? merchant?.canonicalName ?? 'Unknown',
      amount: Number(sub.amount),
      currency: sub.currency,
      frequency: sub.frequency,
      category: sub.category,
      nextBillingDate: sub.nextBillingDate ?? null,
      status: sub.status,
      isActive: sub.status === 'ACTIVE',
      detectedPlanId: sub.detectedPlanId ?? null,
      planConfirmed: sub.planConfirmed ?? false,
      logoUrl: merchant?.logoUrl ?? null,
      logoColor: merchant?.logoColor ?? '#9CA3AF',
      logoLetter: merchant?.logoLetter ?? '?',
      websiteUrl: merchant?.websiteUrl ?? null,
      merchant: merchant ? {
        id: merchant.id,
        canonicalName: merchant.canonicalName,
        slug: merchant.slug,
        category: merchant.category,
        commonDescriptors: merchant.commonDescriptors,
        websiteUrl: merchant.websiteUrl,
        logoUrl: merchant.logoUrl ?? null,
        logoLetter: merchant.logoLetter,
        logoColor: merchant.logoColor,
        knownPlans,
      } : null,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  };

  return {
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalAnnual: Math.round(totalMonthly * 12 * 100) / 100,
    activeCount: subs.length,
    categoryBreakdown,
    subscriptions: subs.map(formatSub),
    upcomingRenewals: upcomingRenewals.map(formatSub),
  };
}
