import { create } from 'zustand';
import { KnowFluxAPI } from '@/services/api';

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  upload_date: string;
  file_size: number;
  tags: string[];
  status: string;
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File | null, url: string | null, tags?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await KnowFluxAPI.getDocuments();
      set({ documents: data.documents || [] });
    } catch (error: unknown) {
      if (error instanceof Error) set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file, url, tags = "") => {
    set({ isLoading: true, error: null });
    try {
      await KnowFluxAPI.uploadDocument(file, url, tags);
      // Wait a moment for indexing before fetching again
      setTimeout(async () => {
        const data = await KnowFluxAPI.getDocuments();
        set({ documents: data.documents || [] });
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await KnowFluxAPI.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
    } catch (error: unknown) {
      if (error instanceof Error) set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
