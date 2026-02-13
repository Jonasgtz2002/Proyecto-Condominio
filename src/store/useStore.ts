import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, RegistroAcceso, CodigoAcceso, SessionState, Anuncio, RegistroEspecial, EstadoPagoResidente } from '@/types';
import { initialUsers, initialRegistros, initialCodigos, initialAnuncios, initialRegistrosEspeciales, initialEstadosPago } from '@/lib/mockData';

interface AppState {
  // Session
  session: SessionState;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  // Users
  usuarios: User[];
  agregarUsuario: (usuario: Omit<User, 'id' | 'createdAt'>) => void;
  actualizarUsuario: (id: string, datos: Partial<User>) => void;
  eliminarUsuario: (id: string) => void;
  
  // Registros de Acceso
  registros: RegistroAcceso[];
  registrarEntrada: (registro: Omit<RegistroAcceso, 'id' | 'timestamp' | 'tipo' | 'activo'>) => void;
  registrarSalida: (placa: string, vigilanteId: string, vigilanteNombre: string) => void;
  obtenerVisitantesActivos: () => RegistroAcceso[];
  obtenerHistorialResidente: (residenteId: string) => RegistroAcceso[];
  buscarPorMatricula: (matricula: string) => User | null;
  
  // Códigos de Acceso
  codigos: CodigoAcceso[];
  generarCodigoAcceso: (residenteId: string, residenteNombre: string, visitante: string, horasValidez: number) => CodigoAcceso;
  validarCodigo: (codigo: string) => CodigoAcceso | null;
  marcarCodigoUsado: (codigo: string) => void;
  
  // Anuncios
  anuncios: Anuncio[];
  agregarAnuncio: (anuncio: Omit<Anuncio, 'id' | 'createdAt'>) => void;
  actualizarAnuncio: (id: string, datos: Partial<Anuncio>) => void;
  eliminarAnuncio: (id: string) => void;
  
  // Registros Especiales
  registrosEspeciales: RegistroEspecial[];
  registrarIngresoEspecial: (registro: Omit<RegistroEspecial, 'id' | 'timestamp' | 'activo'>) => void;
  registrarSalidaEspecial: (id: string) => void;
  eliminarRegistroEspecial: (id: string) => void;
  obtenerRegistrosEspecialesActivos: () => RegistroEspecial[];
  
  // Estados de Pago
  estadosPago: EstadoPagoResidente[];
  actualizarEstadoPago: (residenteId: string, datos: Partial<EstadoPagoResidente>) => void;
}

// Función para deserializar fechas del localStorage
const deserializeDates = (state: any) => {
  // Convertir fechas en usuarios
  if (state.usuarios) {
    state.usuarios = state.usuarios.map((u: any) => ({
      ...u,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    }));
  }
  
  // Convertir fechas en registros
  if (state.registros) {
    state.registros = state.registros.map((r: any) => ({
      ...r,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }));
  }
  
  // Convertir fechas en códigos
  if (state.codigos) {
    state.codigos = state.codigos.map((c: any) => ({
      ...c,
      validoHasta: c.validoHasta ? new Date(c.validoHasta) : new Date(),
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
    }));
  }
  
  // Convertir fechas en anuncios
  if (state.anuncios) {
    state.anuncios = state.anuncios.map((a: any) => ({
      ...a,
      fecha: a.fecha ? new Date(a.fecha) : new Date(),
      createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
    }));
  }
  
  // Convertir fechas en registros especiales
  if (state.registrosEspeciales) {
    state.registrosEspeciales = state.registrosEspeciales.map((r: any) => ({
      ...r,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }));
  }
  
  // Convertir fechas en estados de pago
  if (state.estadosPago) {
    state.estadosPago = state.estadosPago.map((e: any) => ({
      ...e,
      proximoVencimiento: e.proximoVencimiento ? new Date(e.proximoVencimiento) : new Date(),
      ultimoPago: e.ultimoPago ? new Date(e.ultimoPago) : null,
    }));
  }
  
  return state;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Session
      session: {
        user: null,
        isAuthenticated: false,
      },
      
      // Sidebar
      isSidebarOpen: false,
      
      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },
      
      setSidebarOpen: (isOpen: boolean) => {
        set({ isSidebarOpen: isOpen });
      },
      
      login: (email: string, password: string) => {
        const usuario = get().usuarios.find(
          (u) => u.email === email && u.password === password && u.activo
        );
        
        if (usuario) {
          set({
            session: {
              user: usuario,
              isAuthenticated: true,
            },
          });
          return usuario;
        }
        return null;
      },
      
      logout: () => {
        set({
          session: {
            user: null,
            isAuthenticated: false,
          },
        });
      },
      
      // Users
      usuarios: initialUsers,
      
      agregarUsuario: (usuario) => {
        const nuevoUsuario: User = {
          ...usuario,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          usuarios: [...state.usuarios, nuevoUsuario],
        }));
      },
      
      actualizarUsuario: (id, datos) => {
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id ? { ...u, ...datos } : u
          ),
        }));
      },
      
      eliminarUsuario: (id) => {
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id ? { ...u, activo: false } : u
          ),
        }));
      },
      
      // Registros de Acceso
      registros: initialRegistros,
      
      registrarEntrada: (registro) => {
        const nuevoRegistro: RegistroAcceso = {
          ...registro,
          id: Date.now().toString(),
          tipo: 'entrada',
          timestamp: new Date(),
          activo: true,
        };
        set((state) => ({
          registros: [...state.registros, nuevoRegistro],
        }));
      },
      
      registrarSalida: (placa, vigilanteId, vigilanteNombre) => {
        // Buscar el registro de entrada activo
        const registroEntrada = get().registros.find(
          (r) => r.placa.toUpperCase() === placa.toUpperCase() && r.activo
        );
        
        if (registroEntrada) {
          // Marcar entrada como inactiva
          set((state) => ({
            registros: state.registros.map((r) =>
              r.id === registroEntrada.id ? { ...r, activo: false } : r
            ),
          }));
          
          // Crear registro de salida
          const nuevoRegistro: RegistroAcceso = {
            id: Date.now().toString(),
            tipo: 'salida',
            placa: placa.toUpperCase(),
            visitante: registroEntrada.visitante,
            residenteId: registroEntrada.residenteId,
            residenteNombre: registroEntrada.residenteNombre,
            vigilanteId,
            vigilanteNombre,
            timestamp: new Date(),
            activo: false,
          };
          
          set((state) => ({
            registros: [...state.registros, nuevoRegistro],
          }));
        }
      },
      
      obtenerVisitantesActivos: () => {
        return get().registros.filter((r) => r.activo);
      },
      
      obtenerHistorialResidente: (residenteId) => {
        return get().registros
          .filter((r) => r.residenteId === residenteId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },
      
      buscarPorMatricula: (matricula) => {
        return get().usuarios.find(
          (u) => u.rol === 'residente' && 
                 u.matricula?.toUpperCase() === matricula.toUpperCase() &&
                 u.activo
        ) || null;
      },
      
      // Códigos de Acceso
      codigos: initialCodigos,
      
      generarCodigoAcceso: (residenteId, residenteNombre, visitante, horasValidez) => {
        const nuevoCodigo: CodigoAcceso = {
          id: Date.now().toString(),
          codigo: `ACC-${Date.now().toString().slice(-8)}`,
          residenteId,
          residenteNombre,
          visitante,
          validoHasta: new Date(Date.now() + horasValidez * 60 * 60 * 1000),
          usado: false,
          createdAt: new Date(),
        };
        
        set((state) => ({
          codigos: [...state.codigos, nuevoCodigo],
        }));
        
        return nuevoCodigo;
      },
      
      validarCodigo: (codigo) => {
        const codigoEncontrado = get().codigos.find((c) => c.codigo === codigo);
        
        if (!codigoEncontrado) return null;
        if (codigoEncontrado.usado) return null;
        if (new Date() > codigoEncontrado.validoHasta) return null;
        
        return codigoEncontrado;
      },
      
      marcarCodigoUsado: (codigo) => {
        set((state) => ({
          codigos: state.codigos.map((c) =>
            c.codigo === codigo ? { ...c, usado: true } : c
          ),
        }));
      },
      
      // Anuncios
      anuncios: initialAnuncios,
      
      agregarAnuncio: (anuncio) => {
        const nuevoAnuncio: Anuncio = {
          ...anuncio,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          anuncios: [...state.anuncios, nuevoAnuncio],
        }));
      },
      
      actualizarAnuncio: (id, datos) => {
        set((state) => ({
          anuncios: state.anuncios.map((a) =>
            a.id === id ? { ...a, ...datos } : a
          ),
        }));
      },
      
      eliminarAnuncio: (id) => {
        set((state) => ({
          anuncios: state.anuncios.filter((a) => a.id !== id),
        }));
      },
      
      // Registros Especiales
      registrosEspeciales: initialRegistrosEspeciales,
      
      registrarIngresoEspecial: (registro) => {
        const nuevoRegistro: RegistroEspecial = {
          ...registro,
          id: Date.now().toString(),
          timestamp: new Date(),
          activo: true,
        };
        set((state) => ({
          registrosEspeciales: [...state.registrosEspeciales, nuevoRegistro],
        }));
      },
      
      registrarSalidaEspecial: (id) => {
        set((state) => ({
          registrosEspeciales: state.registrosEspeciales.map((r) =>
            r.id === id ? { ...r, activo: false } : r
          ),
        }));
      },
      
      eliminarRegistroEspecial: (id) => {
        set((state) => ({
          registrosEspeciales: state.registrosEspeciales.filter((r) => r.id !== id),
        }));
      },
      
      obtenerRegistrosEspecialesActivos: () => {
        return get().registrosEspeciales.filter((r) => r.activo);
      },
      
      // Estados de Pago
      estadosPago: initialEstadosPago,
      
      actualizarEstadoPago: (residenteId, datos) => {
        set((state) => ({
          estadosPago: state.estadosPago.map((e) =>
            e.residenteId === residenteId ? { ...e, ...datos } : e
          ),
        }));
      },
    }),
    {
      name: 'condominio-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          deserializeDates(state);
        }
      },
    }
  )
);
