import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueue, confirmItem, dismissItem, mergeItem } from '@/services/queue';
import type { ConfirmItemRequest } from '@/types/api';
import type { DetectedItem } from '@/types/models';

export const QUEUE_KEY = ['queue'] as const;

export function useQueue() {
  return useQuery({
    queryKey: QUEUE_KEY,
    queryFn: () => fetchQueue(),
  });
}

export function useConfirmItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, overrides }: { itemId: string; overrides?: ConfirmItemRequest }) =>
      confirmItem(itemId, overrides),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: QUEUE_KEY });
      const previous = queryClient.getQueryData(QUEUE_KEY);

      queryClient.setQueryData(QUEUE_KEY, (old: Awaited<ReturnType<typeof fetchQueue>> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: DetectedItem) =>
            item.id === itemId ? { ...item, status: 'CONFIRMED' as const } : item,
          ),
          pending: old.pending - 1,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUEUE_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useDismissItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => dismissItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: QUEUE_KEY });
      const previous = queryClient.getQueryData(QUEUE_KEY);

      queryClient.setQueryData(QUEUE_KEY, (old: Awaited<ReturnType<typeof fetchQueue>> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: DetectedItem) =>
            item.id === itemId ? { ...item, status: 'DISMISSED' as const } : item,
          ),
          pending: old.pending - 1,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUEUE_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });
}

export function useMergeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, targetSubscriptionId }: { itemId: string; targetSubscriptionId: string }) =>
      mergeItem(itemId, targetSubscriptionId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
