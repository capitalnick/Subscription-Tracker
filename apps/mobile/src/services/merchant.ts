import { api } from './api';
import type { MerchantSearchResponse } from '@/types/api';

export async function searchMerchants(query: string): Promise<MerchantSearchResponse> {
  return api.get<MerchantSearchResponse>(
    `/v1/merchants/search?q=${encodeURIComponent(query)}`,
  );
}
