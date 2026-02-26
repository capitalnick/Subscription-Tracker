import { create } from 'zustand';
import type { IngestionMethod } from '@/types';

interface IngestionState {
  selectedMethod: IngestionMethod | null;
  isUploading: boolean;
  uploadProgress: number;
  setSelectedMethod: (method: IngestionMethod | null) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

export const useIngestionStore = create<IngestionState>((set) => ({
  selectedMethod: null,
  isUploading: false,
  uploadProgress: 0,
  setSelectedMethod: (selectedMethod) => set({ selectedMethod }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  reset: () => set({ selectedMethod: null, isUploading: false, uploadProgress: 0 }),
}));
