import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, RegistroAcceso, CodigoAcceso, SessionState } from '@/types';
import { initialUsers, initialRegistros, initialCodigos } from '@/lib/mockData';

interface AppState {
  // Session
  session: SessionState;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  
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
  
  // Códigos de Acceso
  codigos: CodigoAcceso[];
  generarCodigoAcceso: (residenteId: string, residenteNombre: string, visitante: string, horasValidez: number) => CodigoAcceso;
  validarCodigo: (codigo: string) => CodigoAcceso | null;
  marcarCodigoUsado: (codigo: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Session
      session: {
        user: null,
        isAuthenticated: false,
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
    }),
    {
      name: 'condominio-storage',
    }
  )
);
