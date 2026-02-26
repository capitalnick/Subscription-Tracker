import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadPdf,
  uploadScreenshot,
  submitEmail,
  createManualSubscription,
} from '@/services/ingestion';
import type { ManualEntryRequest } from '@/types/api';
import { QUEUE_KEY } from './useQueue';

export function useUploadPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileUri, fileName }: { fileUri: string; fileName: string }) =>
      uploadPdf(fileUri, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });
}

export function useUploadScreenshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileUri, fileName }: { fileUri: string; fileName: string }) =>
      uploadScreenshot(fileUri, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });
}

export function useSubmitEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, subject }: { body: string; subject?: string }) =>
      submitEmail(body, subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });
}

export function useCreateManualSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManualEntryRequest) => createManualSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
