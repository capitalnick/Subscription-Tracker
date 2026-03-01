import { useAuthStore } from '@/stores/authStore';
import { API_TIMEOUT } from '@/utils/constants';
import type { ApiError } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const session = useAuthStore.getState().session;
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    return headers;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          statusCode: response.status,
          message: response.statusText,
        }));
        throw error;
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown) {
    const options: RequestInit = { method: 'POST' };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    } else {
      // Send empty JSON object to avoid Fastify's empty body error
      options.body = JSON.stringify({});
    }
    return this.request<T>(path, options);
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for uploads

    try {
      const headers: Record<string, string> = {};
      const session = useAuthStore.getState().session;
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      // Don't set Content-Type for FormData — let fetch set the boundary

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          statusCode: response.status,
          message: response.statusText,
        }));
        throw error;
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const api = new ApiClient(API_URL);
