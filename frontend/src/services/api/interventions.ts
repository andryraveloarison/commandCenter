import { axiosInstance } from './client';

export const interventionsApi = {
  // Interventions
  getInterventions: () =>
    axiosInstance.get('/interventions'),

  getInterventionStats: () =>
    axiosInstance.get('/interventions/stats'),

  createIntervention: (data: any) =>
    axiosInstance.post('/interventions', data),

  updateIntervention: (id: string, data: any) =>
    axiosInstance.patch(`/interventions/${id}`, data),

  deleteIntervention: (id: string) =>
    axiosInstance.delete(`/interventions/${id}`),

  // Sites
  getSites: () =>
    axiosInstance.get('/sites'),

  createSite: (data: any) =>
    axiosInstance.post('/sites', data),

  updateSite: (id: string, data: any) =>
    axiosInstance.patch(`/sites/${id}`, data),

  deleteSite: (id: string) =>
    axiosInstance.delete(`/sites/${id}`),

  // Demandeurs
  getDemandeurs: () =>
    axiosInstance.get('/demandeurs'),

  createDemandeur: (data: any) =>
    axiosInstance.post('/demandeurs', data),

  updateDemandeur: (id: string, data: any) =>
    axiosInstance.patch(`/demandeurs/${id}`, data),

  deleteDemandeur: (id: string) =>
    axiosInstance.delete(`/demandeurs/${id}`),
};
