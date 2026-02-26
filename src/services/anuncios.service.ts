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

  create: (data: FormData | Record<string, any>) =>
    api.post('/anuncios', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),

  update: (id: string | number, data: FormData | Record<string, any>) =>
    api.put(`/anuncios/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),

  delete: (id: string | number) =>
    api.delete(`/anuncios/${id}`),
};
