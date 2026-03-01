import type {
  DashboardData,
  DetectedItem,
  IngestionMethod,
  Merchant,
  Subscription,
  SubscriptionCategory,
  SubscriptionFrequency,
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
  isActive?: boolean;
  detectedPlanId?: string | null;
  planConfirmed?: boolean;
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

// Generic
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
