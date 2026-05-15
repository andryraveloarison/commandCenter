import { axiosInstance } from './client';

export const chatApi = {
  getMessages: () =>
    axiosInstance.get('/chat'),

  getMessageCount: () =>
    axiosInstance.get('/chat/count'),

  sendMessage: (contenu: string) =>
    axiosInstance.post('/chat', { contenu }),

  createPoll: (question: string, options: string[]) =>
    axiosInstance.post('/chat/poll', { question, options }),

  votePoll: (pollId: string, optionIndex: number) =>
    axiosInstance.post(`/chat/poll/${pollId}/vote`, { optionIndex }),

  markMessagesAsRead: () =>
    axiosInstance.post('/chat/mark-read'),

  getDmConversations: () =>
    axiosInstance.get('/direct-messages'),

  getDmMessages: (partnerId: string) =>
    axiosInstance.get(`/direct-messages/${partnerId}`),

  sendDmMessage: (receiverId: string, contenu: string) =>
    axiosInstance.post(`/direct-messages/${receiverId}`, { contenu }),

  markDmAsRead: (partnerId: string) =>
    axiosInstance.post(`/direct-messages/${partnerId}/read`),

  getUnreadDmCount: () =>
    axiosInstance.get('/direct-messages/unread-count'),
};
