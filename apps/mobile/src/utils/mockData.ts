import type {
  Subscription,
  DetectedItem,
  DashboardData,
  CategoryBreakdown,
  Merchant,
} from '@/types';

// ─── Merchants ───────────────────────────────────────────────

export const mockMerchants: Merchant[] = [
  { id: 'm1', canonicalName: 'Netflix', slug: 'netflix', category: 'STREAMING_VIDEO', commonDescriptors: ['NETFLIX'], websiteUrl: 'https://www.netflix.com', logoUrl: null, logoLetter: 'N', logoColor: '#E50914', knownPlans: [] },
  { id: 'm2', canonicalName: 'Spotify', slug: 'spotify', category: 'STREAMING_MUSIC', commonDescriptors: ['SPOTIFY'], websiteUrl: 'https://www.spotify.com', logoUrl: null, logoLetter: 'S', logoColor: '#1DB954', knownPlans: [] },
  { id: 'm3', canonicalName: 'Adobe Creative Cloud', slug: 'adobe-creative-cloud', category: 'SOFTWARE_TOOLS', commonDescriptors: ['ADOBE'], websiteUrl: 'https://www.adobe.com', logoUrl: null, logoLetter: 'A', logoColor: '#FF0000', knownPlans: [] },
  { id: 'm4', canonicalName: 'iCloud+', slug: 'icloud-plus', category: 'CLOUD_STORAGE', commonDescriptors: ['ICLOUD'], websiteUrl: 'https://www.icloud.com', logoUrl: null, logoLetter: 'i', logoColor: '#3693F5', knownPlans: [] },
  { id: 'm5', canonicalName: 'ChatGPT Plus', slug: 'chatgpt-plus', category: 'SOFTWARE_TOOLS', commonDescriptors: ['OPENAI'], websiteUrl: 'https://chat.openai.com', logoUrl: null, logoLetter: 'C', logoColor: '#10A37F', knownPlans: [] },
  { id: 'm6', canonicalName: 'YouTube Premium', slug: 'youtube-premium', category: 'STREAMING_VIDEO', commonDescriptors: ['YOUTUBE'], websiteUrl: 'https://www.youtube.com', logoUrl: null, logoLetter: 'Y', logoColor: '#FF0000', knownPlans: [] },
  { id: 'm7', canonicalName: 'Stan', slug: 'stan', category: 'STREAMING_VIDEO', commonDescriptors: ['STAN'], websiteUrl: 'https://www.stan.com.au', logoUrl: null, logoLetter: 'S', logoColor: '#0072CE', knownPlans: [] },
  { id: 'm8', canonicalName: 'Kayo Sports', slug: 'kayo-sports', category: 'STREAMING_VIDEO', commonDescriptors: ['KAYO'], websiteUrl: 'https://kayosports.com.au', logoUrl: null, logoLetter: 'K', logoColor: '#00C853', knownPlans: [] },
];

// ─── Subscriptions (confirmed) ───────────────────────────────

export const mockSubscriptions: Subscription[] = [
  { id: 's1', userId: 'u1', merchantId: 'm1', merchant: mockMerchants[0], customName: null, displayName: 'Netflix', amount: 22.99, currency: 'AUD', frequency: 'monthly', category: 'STREAMING_VIDEO', nextBillingDate: '2026-03-15T00:00:00Z', isActive: true, detectedPlanId: null, planConfirmed: false, logoUrl: null, logoColor: '#E50914', logoLetter: 'N', websiteUrl: 'https://www.netflix.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 's2', userId: 'u1', merchantId: 'm2', merchant: mockMerchants[1], customName: null, displayName: 'Spotify', amount: 12.99, currency: 'AUD', frequency: 'monthly', category: 'STREAMING_MUSIC', nextBillingDate: '2026-03-10T00:00:00Z', isActive: true, detectedPlanId: null, planConfirmed: false, logoUrl: null, logoColor: '#1DB954', logoLetter: 'S', websiteUrl: 'https://www.spotify.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 's3', userId: 'u1', merchantId: 'm3', merchant: mockMerchants[2], customName: null, displayName: 'Adobe Creative Cloud', amount: 79.99, currency: 'AUD', frequency: 'monthly', category: 'SOFTWARE_TOOLS', nextBillingDate: '2026-03-20T00:00:00Z', isActive: true, detectedPlanId: null, planConfirmed: false, logoUrl: null, logoColor: '#FF0000', logoLetter: 'A', websiteUrl: 'https://www.adobe.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 's4', userId: 'u1', merchantId: 'm4', merchant: mockMerchants[3], customName: null, displayName: 'iCloud+', amount: 4.49, currency: 'AUD', frequency: 'monthly', category: 'CLOUD_STORAGE', nextBillingDate: '2026-03-05T00:00:00Z', isActive: true, detectedPlanId: null, planConfirmed: false, logoUrl: null, logoColor: '#3693F5', logoLetter: 'i', websiteUrl: 'https://www.icloud.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

// ─── Detected Items (review queue) ──────────────────────────

export const mockDetectedItems: DetectedItem[] = [
  { id: 'd1', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'Netflix', aiAmount: 22.99, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-15', aiNextBilling: '2026-03-15', aiConfidence: 'high', aiNotes: null, aiFieldsPurgedAt: null, merchantId: 'm1', merchant: mockMerchants[0], duplicate: false, createdAt: '2026-02-20T00:00:00Z' },
  { id: 'd2', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'Spotify', aiAmount: 12.99, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-10', aiNextBilling: '2026-03-10', aiConfidence: 'high', aiNotes: null, aiFieldsPurgedAt: null, merchantId: 'm2', merchant: mockMerchants[1], duplicate: false, createdAt: '2026-02-20T00:00:00Z' },
  { id: 'd3', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'Adobe Creative Cloud', aiAmount: 79.99, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-20', aiNextBilling: '2026-03-20', aiConfidence: 'high', aiNotes: null, aiFieldsPurgedAt: null, merchantId: 'm3', merchant: mockMerchants[2], duplicate: false, createdAt: '2026-02-20T00:00:00Z' },
  { id: 'd4', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'iCloud+', aiAmount: 4.49, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-05', aiNextBilling: '2026-03-05', aiConfidence: 'high', aiNotes: null, aiFieldsPurgedAt: null, merchantId: 'm4', merchant: mockMerchants[3], duplicate: false, createdAt: '2026-02-20T00:00:00Z' },
  { id: 'd5', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'ChatGPT Plus', aiAmount: 30.00, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-01', aiNextBilling: '2026-03-01', aiConfidence: 'low', aiNotes: 'May be duplicate of existing OpenAI subscription', aiFieldsPurgedAt: null, merchantId: 'm5', merchant: mockMerchants[4], duplicate: true, createdAt: '2026-02-20T00:00:00Z' },
  { id: 'd6', userId: 'u1', ingestionMethod: 'pdf', status: 'PENDING', aiMerchantName: 'YouTube Premium', aiAmount: 22.99, aiCurrency: 'AUD', aiFrequency: 'monthly', aiDetectedDate: '2026-02-12', aiNextBilling: '2026-03-12', aiConfidence: 'low', aiNotes: null, aiFieldsPurgedAt: null, merchantId: 'm6', merchant: mockMerchants[5], duplicate: false, createdAt: '2026-02-20T00:00:00Z' },
];

// ─── Dashboard Data ─────────────────────────────────────────

export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { name: 'STREAMING_VIDEO', value: 35.98, color: '#E63946' },
  { name: 'SOFTWARE_TOOLS', value: 79.99, color: '#3D405B' },
  { name: 'CLOUD_STORAGE', value: 4.49, color: '#00B4D8' },
  { name: 'STREAMING_MUSIC', value: 12.99, color: '#9B5DE5' },
];

const totalMonthly = mockSubscriptions.reduce((sum, s) => sum + s.amount, 0);

export const mockDashboardData: DashboardData = {
  totalMonthly: Math.round(totalMonthly * 100) / 100,
  totalAnnual: Math.round(totalMonthly * 12 * 100) / 100,
  activeCount: mockSubscriptions.length,
  categoryBreakdown: mockCategoryBreakdown,
  subscriptions: mockSubscriptions,
  upcomingRenewals: mockSubscriptions.slice(0, 2),
};
