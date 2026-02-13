import api from '@/lib/api';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  correo: string;
  password: string;
  rol: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNuevo: string;
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post('/auth/register', data),

  me: () =>
    api.get('/auth/me'),

  cambiarPassword: (data: CambiarPasswordRequest) =>
    api.patch('/auth/cambiar-password', data),
};
