import api from '@/lib/api';

export const vigilantesService = {
  getAll: () =>
    api.get('/vigilantes'),

  getById: (id: string | number) =>
    api.get(`/vigilantes/${id}`),

  getByUsuario: (usuarioId: string | number) =>
    api.get(`/vigilantes/usuario/${usuarioId}`),

  create: (data: any) =>
    api.post('/vigilantes', data),

  update: (id: string | number, data: any) =>
    api.put(`/vigilantes/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/vigilantes/${id}`),
};
