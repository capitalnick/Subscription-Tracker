import { api } from './api';
import type { DashboardResponse } from '@/types/api';

export async function fetchDashboard(): Promise<DashboardResponse> {
  return api.get<DashboardResponse>('/v1/dashboard');
}
