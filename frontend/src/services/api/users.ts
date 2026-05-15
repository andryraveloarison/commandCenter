import { axiosInstance } from './client';

export const usersApi = {
  getUsers: () =>
    axiosInstance.get('/users'),

  getUser: (id: string) =>
    axiosInstance.get(`/users/${id}`),

  updateUser: (id: string, data: any) =>
    axiosInstance.patch(`/users/${id}`, data),

  getUserStatistics: (id: string, period?: string) =>
    axiosInstance.get(`/users/${id}/statistics`, { params: period ? { period } : {} }),

  getOnlineUsers: () =>
    axiosInstance.get('/users/online'),

  heartbeat: () =>
    axiosInstance.post('/users/heartbeat'),
};
