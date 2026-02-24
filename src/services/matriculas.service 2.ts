import api from '@/lib/api';

export const matriculasService = {
  getAll: () =>
    api.get('/matriculas'),

  getById: (id: string | number) =>
    api.get(`/matriculas/${id}`),

  getByResidente: (residenteId: string | number) =>
    api.get(`/matriculas/residente/${residenteId}`),

  getByCajon: (cajonId: string | number) =>
    api.get(`/matriculas/cajon/${cajonId}`),

  create: (data: any) =>
    api.post('/matriculas', data),

  update: (id: string | number, data: any) =>
    api.put(`/matriculas/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/matriculas/${id}`),
};
