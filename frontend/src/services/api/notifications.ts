import { axiosInstance } from './client';

export const notificationsApi = {
  getNotifications: (unreadOnly = false) =>
    axiosInstance.get('/notifications', { params: { unreadOnly } }),

  markNotificationAsRead: (id: string) =>
    axiosInstance.patch(`/notifications/${id}/read`),

  deleteNotification: (id: string) =>
    axiosInstance.delete(`/notifications/${id}`),

  getUnreadNotificationsCount: () =>
    axiosInstance.get('/notifications/count'),

  markAllNotificationsRead: () =>
    axiosInstance.post('/notifications/mark-all-read'),
};
