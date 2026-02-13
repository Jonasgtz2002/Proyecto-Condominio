import api from '@/lib/api';

export const pagosService = {
  getAll: () =>
    api.get('/pagos'),

  getById: (id: string | number) =>
    api.get(`/pagos/${id}`),

  getByResidente: (residenteId: string | number) =>
    api.get(`/pagos/residente/${residenteId}`),

  getPendientes: () =>
    api.get('/pagos/pendientes'),

  getVencidos: () =>
    api.get('/pagos/vencidos'),

  getByDepartamento: (deptoId: string | number) =>
    api.get(`/pagos/departamento/${deptoId}`),

  create: (data: any) =>
    api.post('/pagos', data),

  update: (id: string | number, data: any) =>
    api.put(`/pagos/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/pagos/${id}`),
};
