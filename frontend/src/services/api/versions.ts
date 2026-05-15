import { axiosInstance } from './client';

export const versionsApi = {
  getVersions: (projectId: string) =>
    axiosInstance.get('/versions', { params: { projectId } }),

  createVersion: (data: any) =>
    axiosInstance.post('/versions', data),

  getVersion: (id: string) =>
    axiosInstance.get(`/versions/${id}`),

  deleteVersion: (id: string) =>
    axiosInstance.delete(`/versions/${id}`),
};
