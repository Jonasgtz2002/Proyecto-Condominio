import api from '@/lib/api';

export const anunciosService = {
  getAll: () =>
    api.get('/anuncios'),

  getById: (id: string | number) =>
    api.get(`/anuncios/${id}`),

  getActivos: () =>
    api.get('/anuncios/activos'),

  getByEdificio: (edificioId: string | number) =>
    api.get(`/anuncios/edificio/${edificioId}`),
 
  getByTipo: (tipo: string) =>
    api.get(`/anuncios/tipo/${tipo}`),

  create: (data: any) =>
    api.post('/anuncios', data),

  update: (id: string | number, data: any) =>
    api.put(`/anuncios/${id}`, data),

  delete: (id: string | number) =>
    api.delete(`/anuncios/${id}`),
};
