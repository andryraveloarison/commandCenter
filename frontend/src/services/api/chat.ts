import { axiosInstance } from './client';

export const chatApi = {
  getMessages: (params?: { limit?: number; before?: string }) =>
    axiosInstance.get('/chat', { params }),

  getMessageCount: () =>
    axiosInstance.get('/chat/count'),

  sendMessage: (contenu: string) =>
    axiosInstance.post('/chat', { contenu }),

  sendMediaMessage: (type: 'IMAGE' | 'FILE', contenu: string, fileName?: string) =>
    axiosInstance.post('/chat/media', { type, contenu, fileName }),

  createPoll: (question: string, options: string[]) =>
    axiosInstance.post('/chat/poll', { question, options }),

  votePoll: (pollId: string, optionIndex: number) =>
    axiosInstance.post(`/chat/poll/${pollId}/vote`, { optionIndex }),

  markMessagesAsRead: () =>
    axiosInstance.post('/chat/mark-read'),

  getDmConversations: () =>
    axiosInstance.get('/direct-messages'),

  getDmMessages: (partnerId: string, params?: { limit?: number; before?: string }) =>
    axiosInstance.get(`/direct-messages/${partnerId}`, { params }),

  sendDmMessage: (receiverId: string, contenu: string, type?: 'TEXT' | 'IMAGE' | 'FILE', fileName?: string) =>
    axiosInstance.post(`/direct-messages/${receiverId}`, { contenu, type, fileName }),

  markDmAsRead: (partnerId: string) =>
    axiosInstance.post(`/direct-messages/${partnerId}/read`),

  getUnreadDmCount: () =>
    axiosInstance.get('/direct-messages/unread-count'),
};
