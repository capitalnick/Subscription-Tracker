import { create } from 'zustand';
import type { DetectedItem, Subscription } from '@/types';

interface SubscriptionState {
  queue: DetectedItem[];
  subscriptions: Subscription[];
  setQueue: (queue: DetectedItem[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  updateQueueItem: (id: string, updates: Partial<DetectedItem>) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  queue: [],
  subscriptions: [],
  setQueue: (queue) => set({ queue }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  updateQueueItem: (id, updates) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  reset: () => set({ queue: [], subscriptions: [] }),
}));
