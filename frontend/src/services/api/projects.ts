import { axiosInstance } from './client';

export const projectsApi = {
  getProjects: () =>
    axiosInstance.get('/projects'),

  getProject: (id: string) =>
    axiosInstance.get(`/projects/${id}`),

  createProject: (data: any) =>
    axiosInstance.post('/projects', data),

  updateProject: (id: string, data: any) =>
    axiosInstance.patch(`/projects/${id}`, data),

  getProjectHistory: (id: string) =>
    axiosInstance.get(`/projects/${id}/history`),

  updateProjectProgress: (id: string, data: any) =>
    axiosInstance.patch(`/projects/${id}/progress`, data),

  getProjectStatistics: (id: string) =>
    axiosInstance.get(`/projects/${id}/statistics`),

  addProjectTeamMember: (projectId: string, data: any) =>
    axiosInstance.post(`/projects/${projectId}/team`, data),

  removeProjectTeamMember: (projectId: string, userId: string) =>
    axiosInstance.delete(`/projects/${projectId}/team/${userId}`),
};
