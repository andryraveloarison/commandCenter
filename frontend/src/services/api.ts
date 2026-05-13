import axios, { type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Authentication
  async register(data: { email: string; username: string; nom: string; password: string }) {
    return this.axiosInstance.post('/auth/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.axiosInstance.post('/auth/login', data);
  }

  async getProfile() {
    return this.axiosInstance.get('/auth/profile');
  }

  // Users
  async getUsers() {
    return this.axiosInstance.get('/users');
  }

  async getUser(id: string) {
    return this.axiosInstance.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.axiosInstance.patch(`/users/${id}`, data);
  }

  async getUserStatistics(id: string) {
    return this.axiosInstance.get(`/users/${id}/statistics`);
  }

  async getOnlineUsers() {
    return this.axiosInstance.get('/users/online');
  }

  async heartbeat() {
    return this.axiosInstance.post('/users/heartbeat');
  }

  // Projects
  async getProjects() {
    return this.axiosInstance.get('/projects');
  }

  async getProject(id: string) {
    return this.axiosInstance.get(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.axiosInstance.post('/projects', data);
  }

  async updateProject(id: string, data: any) {
    return this.axiosInstance.patch(`/projects/${id}`, data);
  }

  async getProjectHistory(id: string) {
    return this.axiosInstance.get(`/projects/${id}/history`);
  }

  async updateProjectProgress(id: string, data: any) {
    return this.axiosInstance.patch(`/projects/${id}/progress`, data);
  }

  async getProjectStatistics(id: string) {
    return this.axiosInstance.get(`/projects/${id}/statistics`);
  }

  async addProjectTeamMember(projectId: string, data: any) {
    return this.axiosInstance.post(`/projects/${projectId}/team`, data);
  }

  async removeProjectTeamMember(projectId: string, userId: string) {
    return this.axiosInstance.delete(`/projects/${projectId}/team/${userId}`);
  }

  // Tasks
  async getTasks(projectId?: string) {
    return this.axiosInstance.get('/tasks', {
      params: projectId ? { projectId } : {},
    });
  }

  async getTask(id: string) {
    return this.axiosInstance.get(`/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.axiosInstance.post('/tasks', data);
  }

  async createSubtask(parentId: string, data: any) {
    return this.axiosInstance.post('/tasks', { ...data, parentId });
  }

  async updateTask(id: string, data: any) {
    return this.axiosInstance.patch(`/tasks/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.axiosInstance.delete(`/tasks/${id}`);
  }

  async getTasksByUser(userId: string) {
    return this.axiosInstance.get(`/tasks/user/${userId}`);
  }

  async addTaskComment(taskId: string, data: any) {
    return this.axiosInstance.post(`/tasks/${taskId}/comments`, data);
  }

  async getTaskComments(taskId: string) {
    return this.axiosInstance.get(`/tasks/${taskId}/comments`);
  }

  // Modules
  async getModules(projectId: string) {
    return this.axiosInstance.get('/modules', { params: { projectId } });
  }

  async createModule(data: any) {
    return this.axiosInstance.post('/modules', data);
  }

  async updateModule(id: string, data: any) {
    return this.axiosInstance.patch(`/modules/${id}`, data);
  }

  async deleteModule(id: string) {
    return this.axiosInstance.delete(`/modules/${id}`);
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    return this.axiosInstance.get('/notifications', {
      params: { unreadOnly },
    });
  }

  async markNotificationAsRead(id: string) {
    return this.axiosInstance.patch(`/notifications/${id}/read`);
  }

  async deleteNotification(id: string) {
    return this.axiosInstance.delete(`/notifications/${id}`);
  }

  // Chat groupe
  async getMessages() {
    return this.axiosInstance.get('/chat');
  }

  async getMessageCount() {
    return this.axiosInstance.get('/chat/count');
  }

  async sendMessage(contenu: string) {
    return this.axiosInstance.post('/chat', { contenu });
  }

  async createPoll(question: string, options: string[]) {
    return this.axiosInstance.post('/chat/poll', { question, options });
  }

  async votePoll(pollId: string, optionIndex: number) {
    return this.axiosInstance.post(`/chat/poll/${pollId}/vote`, { optionIndex });
  }

  async markMessagesAsRead() {
    return this.axiosInstance.post('/chat/mark-read');
  }

  // Notifications count
  async getUnreadNotificationsCount() {
    return this.axiosInstance.get('/notifications/count');
  }

  async markAllNotificationsRead() {
    return this.axiosInstance.post('/notifications/mark-all-read');
  }

  // Direct messages
  async getDmConversations() {
    return this.axiosInstance.get('/direct-messages');
  }

  async getDmMessages(partnerId: string) {
    return this.axiosInstance.get(`/direct-messages/${partnerId}`);
  }

  async sendDmMessage(receiverId: string, contenu: string) {
    return this.axiosInstance.post(`/direct-messages/${receiverId}`, { contenu });
  }

  async markDmAsRead(partnerId: string) {
    return this.axiosInstance.post(`/direct-messages/${partnerId}/read`);
  }

  async getUnreadDmCount() {
    return this.axiosInstance.get('/direct-messages/unread-count');
  }

  // Sites
  async getSites() { return this.axiosInstance.get('/sites'); }
  async createSite(data: any) { return this.axiosInstance.post('/sites', data); }
  async updateSite(id: string, data: any) { return this.axiosInstance.patch(`/sites/${id}`, data); }
  async deleteSite(id: string) { return this.axiosInstance.delete(`/sites/${id}`); }

  // Demandeurs
  async getDemandeurs() { return this.axiosInstance.get('/demandeurs'); }
  async createDemandeur(data: any) { return this.axiosInstance.post('/demandeurs', data); }
  async updateDemandeur(id: string, data: any) { return this.axiosInstance.patch(`/demandeurs/${id}`, data); }
  async deleteDemandeur(id: string) { return this.axiosInstance.delete(`/demandeurs/${id}`); }

  // Interventions
  async getInterventions() { return this.axiosInstance.get('/interventions'); }
  async getInterventionStats() { return this.axiosInstance.get('/interventions/stats'); }
  async createIntervention(data: any) { return this.axiosInstance.post('/interventions', data); }
  async updateIntervention(id: string, data: any) { return this.axiosInstance.patch(`/interventions/${id}`, data); }
  async deleteIntervention(id: string) { return this.axiosInstance.delete(`/interventions/${id}`); }
}

export default new APIService();
