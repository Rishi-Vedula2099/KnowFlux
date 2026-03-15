import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const KnowFluxAPI = {
  // Chat
  chat: async (message: string, conversationId?: string) => {
    const response = await api.post('/api/chat', { message, conversation_id: conversationId });
    return response.data;
  },

  // Documents
  uploadDocument: async (file: File | null, url: string | null, tags: string = '') => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (url) formData.append('url', url);
    if (tags) formData.append('tags', tags);

    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/api/documents');
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export default KnowFluxAPI;
