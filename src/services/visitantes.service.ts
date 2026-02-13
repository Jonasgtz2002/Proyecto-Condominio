import api from '@/lib/api';

export const visitantesService = {
  getAll: () =>
    api.get('/visitantes'),

  getById: (id: string | number) =>
    api.get(`/visitantes/${id}`),

  getByResidente: (residenteId: string | number) =>
    api.get(`/visitantes/residente/${residenteId}`),

  getFrecuentes: () =>
    api.get('/visitantes/frecuentes'),

  getActivos: () =>
    api.get('/visitantes/activos'),

  create: (data: any) =>
    api.post('/visitantes', data),

  update: (id: string | number, data: any) =>
    api.put(`/visitantes/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/visitantes/${id}`),

  registrarEntrada: (id: string | number) =>
    api.patch(`/visitantes/${id}/entrada`),

  registrarSalida: (id: string | number) =>
    api.patch(`/visitantes/${id}/salida`),
};
