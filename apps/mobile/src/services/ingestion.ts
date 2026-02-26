import { api } from './api';
import type { IngestResponse, ManualEntryRequest } from '@/types/api';
import type { Subscription } from '@/types/models';

export async function uploadPdf(fileUri: string, fileName: string): Promise<IngestResponse> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, fileName);

  return api.upload<IngestResponse>('/v1/ingest/pdf', formData);
}

export async function uploadScreenshot(fileUri: string, fileName: string): Promise<IngestResponse> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, fileName);

  return api.upload<IngestResponse>('/v1/ingest/screenshot', formData);
}

export async function submitEmail(body: string, subject?: string): Promise<IngestResponse> {
  return api.post<IngestResponse>('/v1/ingest/email', { body, subject });
}

export async function createManualSubscription(data: ManualEntryRequest): Promise<Subscription> {
  return api.post<Subscription>('/v1/ingest/manual', data);
}
