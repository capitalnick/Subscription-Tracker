import { api } from './api';
import type { QueueResponse, ConfirmItemRequest } from '@/types/api';
import type { Subscription } from '@/types/models';

export async function fetchQueue(limit = 50, offset = 0): Promise<QueueResponse> {
  return api.get<QueueResponse>(`/v1/queue?limit=${limit}&offset=${offset}`);
}

export async function confirmItem(
  itemId: string,
  overrides?: ConfirmItemRequest,
): Promise<Subscription> {
  return api.post<Subscription>(`/v1/queue/${itemId}/confirm`, overrides);
}

export async function dismissItem(itemId: string): Promise<void> {
  await api.post(`/v1/queue/${itemId}/dismiss`);
}

export async function mergeItem(
  itemId: string,
  targetSubscriptionId: string,
): Promise<Subscription> {
  return api.post<Subscription>(`/v1/queue/${itemId}/merge`, { targetSubscriptionId });
}
