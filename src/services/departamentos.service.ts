import api from '@/lib/api';

export const departamentosService = {
  getAll: () =>
    api.get('/departamentos'),

  getById: (id: string | number) =>
    api.get(`/departamentos/${id}`),

  getByEdificio: (edificioId: string | number) =>
    api.get(`/departamentos/edificio/${edificioId}`),

  create: (data: any) =>
    api.post('/departamentos', data),

  update: (id: string | number, data: any) =>
    api.put(`/departamentos/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/departamentos/${id}`),
};
