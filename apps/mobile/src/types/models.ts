export type SubscriptionFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual';

export type DetectedItemStatus = 'PENDING' | 'CONFIRMED' | 'DISMISSED' | 'MERGED';

export type SubscriptionCategory =
  | 'STREAMING_VIDEO'
  | 'STREAMING_MUSIC'
  | 'GAMING'
  | 'PODCASTS_AUDIO'
  | 'PRODUCTIVITY'
  | 'CLOUD_STORAGE'
  | 'SOFTWARE_TOOLS'
  | 'COMMUNICATION'
  | 'FITNESS'
  | 'FOOD_DELIVERY'
  | 'NEWS_MAGAZINES'
  | 'INTERNET_PHONE'
  | 'UTILITIES_HOME'
  | 'VPN_SECURITY'
  | 'FINANCE_INVEST'
  | 'SHOPPING_BOXES'
  | 'PRIME_MEMBERSHIPS'
  | 'EDUCATION'
  | 'OTHER';

export type PlanType = 'INDIVIDUAL' | 'DUO' | 'FAMILY' | 'STUDENT' | 'BUSINESS' | 'ENTERPRISE';

export type IngestionMethod = 'pdf' | 'screenshot' | 'email' | 'manual';

export type Confidence = 'high' | 'low';

export interface MerchantPlan {
  id: string;
  label: string;
  tierRank: number;
  amountsAud: number[];
  maxUsers: number | null;
  planType: PlanType;
  features: string[];
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Merchant {
  id: string;
  canonicalName: string;
  slug: string;
  category: SubscriptionCategory;
  commonDescriptors: string[];
  websiteUrl: string | null;
  logoUrl: string | null;
  logoLetter: string;
  logoColor: string;
  knownPlans: MerchantPlan[];
}

export interface DetectedItem {
  id: string;
  userId: string;
  ingestionMethod: IngestionMethod;
  status: DetectedItemStatus;
  aiMerchantName: string | null;
  aiAmount: number | null;
  aiCurrency: string | null;
  aiFrequency: SubscriptionFrequency | null;
  aiDetectedDate: string | null;
  aiNextBilling: string | null;
  aiConfidence: Confidence | null;
  aiNotes: string | null;
  aiFieldsPurgedAt: string | null;
  merchantId: string | null;
  merchant: Merchant | null;
  rawDescriptor: string | null;
  duplicate: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  merchantId: string | null;
  merchant: Merchant | null;
  customName: string | null;
  displayName: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  nextBillingDate: string | null;
  isActive: boolean;
  detectedPlanId: string | null;
  planConfirmed: boolean;
  logoUrl: string | null;
  logoColor: string;
  logoLetter: string;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalMonthly: number;
  totalAnnual: number;
  activeCount: number;
  categoryBreakdown: CategoryBreakdown[];
  subscriptions: Subscription[];
  upcomingRenewals: Subscription[];
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}
