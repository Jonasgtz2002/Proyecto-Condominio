import api from '@/lib/api';

export const administradoresService = {
  getAll: () =>
    api.get('/administradores'),

  getById: (id: string | number) =>
    api.get(`/administradores/${id}`),

  getByUsuario: (usuarioId: string | number) =>
    api.get(`/administradores/usuario/${usuarioId}`),

  create: (data: any) =>
    api.post('/administradores', data),

  update: (id: string | number, data: any) =>
    api.put(`/administradores/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/administradores/${id}`),
};
