import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/services/dashboard';

export const DASHBOARD_KEY = ['dashboard'] as const;

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: fetchDashboard,
  });
}
