import api from '@/lib/api';

export const accesosService = {
  getAll: () =>
    api.get('/accesos'),

  getById: (id: string | number) =>
    api.get(`/accesos/${id}`),

  getHoy: () =>
    api.get('/accesos/hoy'),

  getByResidente: (residenteId: string | number) =>
    api.get(`/accesos/residente/${residenteId}`),

  getByVisitante: (visitanteId: string | number) =>
    api.get(`/accesos/visitante/${visitanteId}`),

  getByEdificio: (edificioId: string | number) =>
    api.get(`/accesos/edificio/${edificioId}`),

  getByTipo: (tipo: 'entrada' | 'salida') =>
    api.get(`/accesos/tipo/${tipo}`),

  create: (data: any) =>
    api.post('/accesos', data),

  update: (id: string | number, data: any) =>
    api.put(`/accesos/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/accesos/${id}`),
};
