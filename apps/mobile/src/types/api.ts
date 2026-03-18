import type {
  DashboardData,
  DetectedItem,
  Merchant,
  Subscription,
  SubscriptionCategory,
  SubscriptionFrequency,
  SubscriptionStatus,
} from './models';

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

// Ingestion
export interface IngestResponse {
  items: DetectedItem[];
  count: number;
  ingestionEventId: string | null;
}

// Queue
export interface QueueResponse {
  items: DetectedItem[];
  total: number;
  pending: number;
}

export interface ConfirmItemRequest {
  customName?: string;
  amount?: number;
  frequency?: SubscriptionFrequency;
  category?: SubscriptionCategory;
}

// Dashboard
export interface DashboardResponse extends DashboardData {}

// Subscriptions
export interface UpdateSubscriptionRequest {
  customName?: string;
  amount?: number;
  frequency?: SubscriptionFrequency;
  category?: SubscriptionCategory;
  status?: SubscriptionStatus;
  isActive?: boolean;
  nextBillingDate?: string | null;
  detectedPlanId?: string | null;
  planConfirmed?: boolean;
  notes?: string | null;
}

// Merchants
export interface MerchantSearchResponse {
  merchants: Merchant[];
}

// Manual entry
export interface ManualEntryRequest {
  name: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  category: SubscriptionCategory;
  nextBillingDate?: string;
}

// Account
export interface DeleteAccountResponse {
  deleted: boolean;
}

// Generic
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
