import { axiosInstance } from './client';

export const modulesApi = {
  getModules: (projectId: string) =>
    axiosInstance.get('/modules', { params: { projectId } }),

  createModule: (data: any) =>
    axiosInstance.post('/modules', data),

  updateModule: (id: string, data: any) =>
    axiosInstance.patch(`/modules/${id}`, data),

  deleteModule: (id: string) =>
    axiosInstance.delete(`/modules/${id}`),
};
