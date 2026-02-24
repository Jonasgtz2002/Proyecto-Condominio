import api from '@/lib/api';

export const usersService = {
  getAll: () =>
    api.get('/users'),

  getById: (id: string | number) =>
    api.get(`/users/${id}`),

  update: (id: string | number, data: any) =>
    api.put(`/users/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/users/${id}`),

  bloquear: (id: string | number) =>
    api.patch(`/users/${id}/bloquear`),

  desbloquear: (id: string | number) =>
    api.patch(`/users/${id}/desbloquear`),
};
