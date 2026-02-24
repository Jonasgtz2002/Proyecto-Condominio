import api from '@/lib/api';

export const residentesService = {
  getAll: () =>
    api.get('/residentes'),

  getById: (id: string | number) =>
    api.get(`/residentes/${id}`),

  getByUsuario: (usuarioId: string | number) =>
    api.get(`/residentes/usuario/${usuarioId}`),

  getByDepartamento: (deptoId: string | number) =>
    api.get(`/residentes/departamento/${deptoId}`),

  create: (data: any) =>
    api.post('/residentes', data),

  update: (id: string | number, data: any) =>
    api.put(`/residentes/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/residentes/${id}`),
};
