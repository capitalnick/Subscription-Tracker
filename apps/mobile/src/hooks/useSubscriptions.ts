import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSubscriptions,
  fetchSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/services/subscription';
import type { UpdateSubscriptionRequest } from '@/types/api';

export const SUBSCRIPTIONS_KEY = ['subscriptions'] as const;

export function useSubscriptions() {
  return useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: () => fetchSubscriptions(),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, id],
    queryFn: () => fetchSubscription(id),
    enabled: !!id,
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionRequest }) =>
      updateSubscription(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...SUBSCRIPTIONS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
