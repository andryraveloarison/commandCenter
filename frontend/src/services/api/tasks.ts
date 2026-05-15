import { axiosInstance } from './client';

export const tasksApi = {
  getTasks: (projectId?: string) =>
    axiosInstance.get('/tasks', { params: projectId ? { projectId } : {} }),

  getTask: (id: string) =>
    axiosInstance.get(`/tasks/${id}`),

  createTask: (data: any) =>
    axiosInstance.post('/tasks', data),

  createSubtask: (parentId: string, data: any) =>
    axiosInstance.post('/tasks', { ...data, parentId }),

  updateTask: (id: string, data: any) =>
    axiosInstance.patch(`/tasks/${id}`, data),

  deleteTask: (id: string) =>
    axiosInstance.delete(`/tasks/${id}`),

  getTasksByUser: (userId: string) =>
    axiosInstance.get(`/tasks/user/${userId}`),

  addTaskComment: (taskId: string, data: any) =>
    axiosInstance.post(`/tasks/${taskId}/comments`, data),

  getTaskComments: (taskId: string) =>
    axiosInstance.get(`/tasks/${taskId}/comments`),
};
