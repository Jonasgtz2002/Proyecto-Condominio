export type UserRole = 'admin' | 'vigilante' | 'residente';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  activo: boolean;
  direccion?: string; // Para residentes
  telefono?: string;
  createdAt: Date;
}

export interface RegistroAcceso {
  id: string;
  tipo: 'entrada' | 'salida';
  placa: string;
  visitante: string;
  motivoVisita?: string;
  residenteId?: string;
  residenteNombre?: string;
  vigilanteId: string;
  vigilanteNombre: string;
  codigoAcceso?: string;
  timestamp: Date;
  activo: boolean; // true si está dentro del condominio
}

export interface CodigoAcceso {
  id: string;
  codigo: string;
  residenteId: string;
  residenteNombre: string;
  visitante: string;
  validoHasta: Date;
  usado: boolean;
  createdAt: Date;
}

export interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
}
