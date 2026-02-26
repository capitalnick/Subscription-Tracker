import { api } from './api';
import type { UpdateSubscriptionRequest } from '@/types/api';
import type { Subscription } from '@/types/models';

interface PaginatedSubscriptions {
  subscriptions: Subscription[];
  total: number;
}

export async function fetchSubscriptions(
  limit = 50,
  offset = 0,
): Promise<PaginatedSubscriptions> {
  return api.get<PaginatedSubscriptions>(`/v1/subscriptions?limit=${limit}&offset=${offset}`);
}

export async function fetchSubscription(id: string): Promise<Subscription> {
  return api.get<Subscription>(`/v1/subscriptions/${id}`);
}

export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionRequest,
): Promise<Subscription> {
  return api.patch<Subscription>(`/v1/subscriptions/${id}`, data);
}

export async function deleteSubscription(id: string): Promise<void> {
  await api.delete(`/v1/subscriptions/${id}`);
}
