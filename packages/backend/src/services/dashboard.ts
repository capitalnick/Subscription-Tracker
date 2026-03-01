import { getAdminClient } from '../lib/supabase.js';
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
  const db = getAdminClient();

  const { data: subscriptions } = await db
    .from('subscriptions')
    .select('*, merchants(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const subs = subscriptions ?? [];

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
      sub.next_billing_date &&
      new Date(sub.next_billing_date) >= now &&
      new Date(sub.next_billing_date) <= weekFromNow,
  );

  const formatSub = (sub: (typeof subs)[number]) => {
    const merchant = sub.merchants as Record<string, unknown> | null;
    const knownPlans = (merchant?.known_plans as unknown[]) ?? [];
    return {
      id: sub.id,
      userId: sub.user_id,
      merchantId: sub.merchant_id,
      customName: sub.custom_name,
      displayName: sub.custom_name ?? (merchant?.canonical_name as string) ?? 'Unknown',
      amount: Number(sub.amount),
      currency: sub.currency,
      frequency: sub.frequency,
      category: sub.category,
      nextBillingDate: sub.next_billing_date ?? null,
      isActive: sub.is_active,
      detectedPlanId: sub.detected_plan_id ?? null,
      planConfirmed: sub.plan_confirmed ?? false,
      logoUrl: (merchant?.logo_url as string) ?? null,
      logoColor: (merchant?.logo_color as string) ?? '#9CA3AF',
      logoLetter: (merchant?.logo_letter as string) ?? '?',
      websiteUrl: (merchant?.website_url as string) ?? null,
      merchant: merchant ? {
        id: merchant.id,
        canonicalName: merchant.canonical_name,
        slug: merchant.slug,
        category: merchant.category,
        commonDescriptors: merchant.common_descriptors,
        websiteUrl: merchant.website_url,
        logoUrl: merchant.logo_url ?? null,
        logoLetter: merchant.logo_letter,
        logoColor: merchant.logo_color,
        knownPlans,
      } : null,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
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
