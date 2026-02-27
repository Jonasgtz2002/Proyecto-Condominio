export type UserRole = 'admin' | 'vigilante' | 'residente';
export type TurnoVigilante = 'matutino' | 'vespertino' | 'nocturno';
export type EstadoPago = 'pagado' | 'vencido' | 'adeudo' | 'pendiente';
export type TipoRegistroEspecial = 'delivery' | 'transporte' | 'visitante' | 'otros';

// ───────── Legacy frontend types (kept for compatibility) ─────────

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  activo: boolean;
  direccion?: string;
  telefono?: string;
  createdAt: Date;
  edificio?: string;
  departamento?: string;
  matricula?: string;
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
  activo: boolean;
}

export interface RegistroEspecial {
  id: string;
  tipo: TipoRegistroEspecial;
  conductor: string;
  placa: string;
  categoria?: string;
  empresa?: string;
  edificio: string;
  timestamp: Date;
  vigilanteId: string;
  vigilanteNombre: string;
  activo: boolean;
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
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ───────── API response types (match Prisma backend models) ─────────

export interface ApiUser {
  id_usuario: number;
  correo: string;
  rol: string;
  intentos_fallidos?: number;
  cuenta_bloq?: boolean;
  fecha_registro?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiEdificio {
  id_edificio: number;
  num_edificio: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiDepartamento {
  id_departamento: number;
  num_departamento?: string;
  id_edificio_fk: number;
  edificio?: ApiEdificio;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResidente {
  id_residente: number;
  nombre: string;
  telefono?: string;
  id_departamento_fk?: number;
  id_edificio_fk?: number;
  id_usuario_fk?: number;
  usuario?: ApiUser;
  departamento?: ApiDepartamento;
  edificio?: ApiEdificio;
  matriculas?: ApiMatricula[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiVigilante {
  id_vigilante: number;
  nombre: string;
  telefono?: string;
  turno?: string;
  fecha_alta?: string;
  id_usuario_fk?: number;
  usuario?: ApiUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAdministrador {
  id_admin: number;
  nombre: string;
  id_usuario_fk?: number;
  usuario?: ApiUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiVisitante {
  id_visitante: number;
  nombre: string;
  empresa?: string;
  categoria?: string;
  id_departamento_fk?: number;
  id_edificio_fk?: number;
  activo?: string; // "S" or "N"
  departamento?: ApiDepartamento;
  edificio?: ApiEdificio;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCajon {
  id_cajon: number;
  estado?: string;
  id_departamento_fk?: number;
  departamento?: ApiDepartamento;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMatricula {
  matricula: string;
  id_residente_fk?: number;
  id_visitante_fk?: number;
  residente?: ApiResidente;
  visitante?: ApiVisitante;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAcceso {
  id_accesos: number;
  hora_entrada?: string;
  hora_salida?: string;
  matricula_fk?: string;
  id_cajon_fk?: number;
  id_vigilante_fk?: number;
  id_visitante_fk?: number;
  matricula?: ApiMatricula;
  matriculaRel?: ApiMatricula;
  vigilante?: ApiVigilante;
  visitante?: ApiVisitante;
  cajon?: ApiCajon;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPago {
  id_pago: number;
  monto: number;
  estado?: string;
  estatus?: string;
  fecha_ultimopago?: string;
  fecha_vencimiento?: string;
  id_residente_fk?: number;
  residente?: ApiResidente;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAnuncio {
  id_anuncio: number;
  titulo: string;
  mensaje: string;
  ruta_archivo?: string;
  id_admin_fk?: number;
  fecha_publicacion?: string;
  administrador?: ApiAdministrador;
  createdAt?: string;
  updatedAt?: string;
}
