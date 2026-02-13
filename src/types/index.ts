export type UserRole = 'admin' | 'vigilante' | 'residente';
export type TurnoVigilante = 'matutino' | 'vespertino' | 'nocturno';
export type EstadoPago = 'pagado' | 'vencido' | 'adeudo';
export type TipoRegistroEspecial = 'delivery' | 'transporte' | 'visitante' | 'otros';

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
  // Para residentes
  edificio?: string;
  departamento?: string;
  matricula?: string;
  // Para vigilantes
  turno?: TurnoVigilante;
}

export interface EstadoPagoResidente {
  residenteId: string;
  residenteNombre: string;
  edificio: string;
  departamento: string;
  estado: EstadoPago;
  deudaTotal: number;
  proximoVencimiento: Date;
  ultimoPago: Date | null;
}

export interface Anuncio {
  id: string;
  titulo: string;
  cuerpo: string;
  fecha: Date;
  archivoUrl?: string;
  createdBy: string;
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

export interface RegistroEspecial {
  id: string;
  tipo: TipoRegistroEspecial;
  conductor: string;
  placa: string;
  categoria?: string; // Para delivery: Rappi, UberEats, etc.
  empresa?: string;
  edificio: string;
  timestamp: Date;
  vigilanteId: string;
  vigilanteNombre: string;
  activo: boolean; // true si aún está dentro
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
