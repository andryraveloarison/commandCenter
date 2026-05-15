import { axiosInstance } from './client';

export const authApi = {
  register: (data: { email: string; username: string; nom: string; password: string }) =>
    axiosInstance.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', data),

  getProfile: () =>
    axiosInstance.get('/auth/profile'),
};
