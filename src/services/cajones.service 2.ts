import api from '@/lib/api';

export const cajonesService = {
  getAll: () =>
    api.get('/cajones'),

  getById: (id: string | number) =>
    api.get(`/cajones/${id}`),

  getByEdificio: (edificioId: string | number) =>
    api.get(`/cajones/edificio/${edificioId}`),

  getDisponibles: () =>
    api.get('/cajones/disponibles'),

  create: (data: any) =>
    api.post('/cajones', data),

  update: (id: string | number, data: any) =>
    api.put(`/cajones/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/cajones/${id}`),
};
