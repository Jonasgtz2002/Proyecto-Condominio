import api from '@/lib/api';

export const edificiosService = {
  getAll: () =>
    api.get('/edificios'),

  getById: (id: string | number) =>
    api.get(`/edificios/${id}`),

  create: (data: any) =>
    api.post('/edificios', data),

  update: (id: string | number, data: any) =>
    api.put(`/edificios/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/edificios/${id}`),
};
