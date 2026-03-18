export type SubscriptionFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'TRIAL' | 'EXPIRED';

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

export type IngestionSource = 'PDF' | 'SCREENSHOT' | 'EMAIL' | 'MANUAL';

export type IngestionStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ChargeSource = 'INGESTION' | 'MANUAL';

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
  forwardingAddress: string | null;
  currencyPreference: string;
  timezone: string;
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
  ingestionEventId: string | null;
  duplicateOf: string | null;
  duplicateConfidence: number | null;
  confirmedMerchantName: string | null;
  confirmedAmount: number | null;
  confirmedCurrency: string | null;
  confirmedFrequency: string | null;
  confirmedNextBilling: string | null;
  subscriptionId: string | null;
  reviewedAt: string | null;
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
  status: SubscriptionStatus;
  isActive: boolean;
  billingAnchor: number | null;
  lastChargedDate: string | null;
  lastChargedAmount: number | null;
  trialEndDate: string | null;
  cancelledAt: string | null;
  notes: string | null;
  isShared: boolean;
  sharedMyPortion: number | null;
  detectedPlanId: string | null;
  planConfirmed: boolean;
  logoUrl: string | null;
  logoColor: string;
  logoLetter: string;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IngestionEvent {
  id: string;
  userId: string;
  source: IngestionSource;
  status: IngestionStatus;
  aiModel: string | null;
  aiCostUsd: number | null;
  itemsDetected: number;
  processingMs: number | null;
  sourceHash: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface SubscriptionCharge {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  amountAud: number | null;
  chargedAt: string;
  source: ChargeSource;
  ingestionEventId: string | null;
  expectedAmount: number | null;
  isPriceChange: boolean;
  createdAt: string;
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
