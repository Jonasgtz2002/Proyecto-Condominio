import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SessionState,
  ApiResidente,
  ApiVigilante,
  ApiAcceso,
  ApiAnuncio,
  ApiPago,
  ApiCajon,
  ApiMatricula,
  ApiEdificio,
  ApiDepartamento,
  ApiVisitante,
  ApiAdministrador,
} from '@/types';
import { authService } from '@/services/auth.service';
import { residentesService } from '@/services/residentes.service';
import { vigilantesService } from '@/services/vigilantes.service';
import { administradoresService } from '@/services/administradores.service';
import { accesosService } from '@/services/accesos.service';
import { anunciosService } from '@/services/anuncios.service';
import { pagosService } from '@/services/pagos.service';
import { cajonesService } from '@/services/cajones.service';
import { matriculasService } from '@/services/matriculas.service';
import { edificiosService } from '@/services/edificios.service';
import { departamentosService } from '@/services/departamentos.service';
import { visitantesService } from '@/services/visitantes.service';
import { usersService } from '@/services/users.service';

interface AppState {
  // Session
  session: SessionState;
  login: (correo: string, password: string) => Promise<any>;
  logout: () => void;
  fetchMe: () => Promise<void>;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Loading
  loading: boolean;

  // ── Data arrays (populated from API) ──
  residentes: ApiResidente[];
  vigilantes: ApiVigilante[];
  administradores: ApiAdministrador[];
  edificios: ApiEdificio[];
  departamentos: ApiDepartamento[];
  visitantes: ApiVisitante[];
  visitantesActivos: ApiVisitante[];
  cajones: ApiCajon[];
  matriculas: ApiMatricula[];
  accesos: ApiAcceso[];
  accesosHoy: ApiAcceso[];
  pagos: ApiPago[];
  pagosPendientes: ApiPago[];
  pagosVencidos: ApiPago[];
  anuncios: ApiAnuncio[];
  usuarios: any[];

  // ── Fetch functions ──
  fetchResidentes: () => Promise<void>;
  fetchVigilantes: () => Promise<void>;
  fetchAdministradores: () => Promise<void>;
  fetchEdificios: () => Promise<void>;
  fetchDepartamentos: () => Promise<void>;
  fetchVisitantes: () => Promise<void>;
  fetchVisitantesActivos: () => Promise<void>;
  fetchCajones: () => Promise<void>;
  fetchMatriculas: () => Promise<void>;
  fetchAccesos: () => Promise<void>;
  fetchAccesosActivos: () => Promise<void>;
  fetchAccesosPorResidente: (residenteId: number) => Promise<ApiAcceso[]>;
  fetchPagos: () => Promise<void>;
  fetchPagosPendientes: () => Promise<void>;
  fetchPagosVencidos: () => Promise<void>;
  fetchPagosPorResidente: (residenteId: number) => Promise<ApiPago[]>;
  fetchAnuncios: () => Promise<void>;
  fetchUsuarios: () => Promise<void>;

  // ── CRUD Residentes ──
  agregarResidente: (data: any) => Promise<any>;
  actualizarResidente: (id: number, data: any) => Promise<void>;
  eliminarResidente: (id: number) => Promise<void>;

  // ── CRUD Vigilantes ──
  agregarVigilante: (data: any) => Promise<void>;
  actualizarVigilante: (id: number, data: any) => Promise<void>;
  eliminarVigilante: (id: number) => Promise<void>;

  // ── CRUD Visitantes ──
  agregarVisitante: (data: any) => Promise<void>;
  registrarEntradaVisitante: (id: number) => Promise<void>;
  registrarSalidaVisitante: (id: number) => Promise<void>;

  // ── CRUD Accesos ──
  registrarAcceso: (data: any) => Promise<void>;
  registrarSalidaAcceso: (id: number) => Promise<void>;
  buscarMatriculaEnAPI: (matricula: string) => Promise<ApiMatricula | null>;

  // ── CRUD Pagos ──
  agregarPago: (data: any) => Promise<void>;
  actualizarPago: (id: number, data: any) => Promise<void>;
  eliminarPago: (id: number) => Promise<void>;

  // ── CRUD Anuncios ──
  agregarAnuncio: (data: any) => Promise<void>;
  actualizarAnuncio: (id: number, data: any) => Promise<void>;
  eliminarAnuncio: (id: number) => Promise<void>;

  // ── CRUD Cajones ──
  agregarCajon: (data: any) => Promise<void>;
  actualizarCajon: (id: number, data: any) => Promise<void>;
  eliminarCajon: (id: number) => Promise<void>;

  // ── CRUD Matriculas ──
  agregarMatricula: (data: any) => Promise<void>;
  actualizarMatricula: (id: number, data: any) => Promise<void>;
  eliminarMatricula: (id: number) => Promise<void>;

  // ── CRUD Edificios ──
  agregarEdificio: (data: any) => Promise<any>;
  actualizarEdificio: (id: number, data: any) => Promise<void>;
  eliminarEdificio: (id: number) => Promise<void>;

  // ── CRUD Departamentos ──
  agregarDepartamento: (data: any) => Promise<any>;
  actualizarDepartamento: (id: number, data: any) => Promise<void>;
  eliminarDepartamento: (id: number) => Promise<void>;

  // ── CRUD Users (admin) ──
  agregarUsuario: (data: any) => Promise<any>;
  actualizarUsuario: (id: number, data: any) => Promise<void>;
  eliminarUsuario: (id: number) => Promise<void>;
  bloquearUsuario: (id: number) => Promise<void>;
  desbloquearUsuario: (id: number) => Promise<void>;

  // ── Helpers ──
  buscarPorMatricula: (matricula: string) => ApiMatricula | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      // Helper: extract array from API response (handles { data: [...] } or [...] or { pagos: [...] } etc.)
      const extractArray = (data: any): any[] => {
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        // Check for any property that is an array (e.g. { pagos: [...] }, { residentes: [...] })
        if (data && typeof data === 'object') {
          const keys = Object.keys(data);
          for (const key of keys) {
            if (Array.isArray(data[key])) return data[key];
          }
        }
        return [];
      };

      return ({
        // ────────────── Session ──────────────
        session: {
          user: null,
          token: null,
          isAuthenticated: false,
        },

        loading: false,

        login: async (correo: string, password: string) => {
          try {
            const res = await authService.login({ correo, password });
            // Handle different API response structures
            const responseData = res.data?.data || res.data;
            const token = responseData?.token;
            const usuario = responseData?.usuario || responseData?.user;

            if (!token || !usuario) {
              console.error('Invalid login response structure:', res.data);
              return null;
            }

            // Normalize role: ADMINISTRADOR -> admin, VIGILANTE -> vigilante, RESIDENTE -> residente
            const rolMap: Record<string, string> = {
              ADMINISTRADOR: 'admin',
              VIGILANTE: 'vigilante',
              RESIDENTE: 'residente',
            };
            const user = {
              ...usuario,
              rol: rolMap[usuario.rol?.toUpperCase()] || usuario.rol?.toLowerCase() || usuario.rol,
            };

            const userId = user.id_usuario || user.id;

            // Store token
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', token);
            }

            // Fetch profile based on role
            let profile: any = null;
            try {
              if (user.rol === 'residente') {
                const profileRes = await residentesService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              } else if (user.rol === 'vigilante') {
                const profileRes = await vigilantesService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              } else if (user.rol === 'admin') {
                const profileRes = await administradoresService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              }
            } catch (profileError) {
              // Profile fetch may fail, continue with basic user info
              console.warn('Profile fetch failed for role', user.rol, ':', profileError);
            }

            const sessionUser = {
              ...user,
              ...(profile || {}),
              apiUserId: userId,
            };

            set({
              session: {
                user: sessionUser,
                token,
                isAuthenticated: true,
              },
            });

            return sessionUser;
          } catch (error: any) {
            console.error('Login error:', error?.response?.data || error);
            // Build a meaningful error message
            const apiMsg = error?.response?.data?.message || error?.response?.data?.error;
            if (apiMsg) {
              throw new Error(apiMsg);
            }
            throw error;
          }
        },

        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({
            session: { user: null, token: null, isAuthenticated: false },
            residentes: [],
            vigilantes: [],
            administradores: [],
            accesos: [],
            accesosHoy: [],
            anuncios: [],
            pagos: [],
            pagosPendientes: [],
            pagosVencidos: [],
            cajones: [],
            matriculas: [],
            visitantes: [],
            visitantesActivos: [],
            edificios: [],
            departamentos: [],
            usuarios: [],
          });
        },

        fetchMe: async () => {
          try {
            const res = await authService.me();
            const rawUser = res.data?.data || res.data;

            if (!rawUser || (!rawUser.rol && !rawUser.role)) {
              throw new Error('Invalid user data from /auth/me');
            }

            const rolMap: Record<string, string> = {
              ADMINISTRADOR: 'admin',
              VIGILANTE: 'vigilante',
              RESIDENTE: 'residente',
            };
            const user = {
              ...rawUser,
              rol: rolMap[rawUser.rol?.toUpperCase()] || rawUser.rol?.toLowerCase() || rawUser.rol,
            };

            const userId = user.id_usuario || user.id;

            let profile: any = null;
            try {
              if (user.rol === 'residente') {
                const profileRes = await residentesService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              } else if (user.rol === 'vigilante') {
                const profileRes = await vigilantesService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              } else if (user.rol === 'admin') {
                const profileRes = await administradoresService.getByUsuario(userId);
                profile = profileRes.data?.data || profileRes.data;
              }
            } catch {
              // Profile fetch may fail
            }

            const sessionUser = {
              ...user,
              ...(profile || {}),
              apiUserId: userId,
            };

            set({
              session: {
                ...get().session,
                user: sessionUser,
                isAuthenticated: true,
              },
            });
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
            }
            set({
              session: { user: null, token: null, isAuthenticated: false },
            });
          }
        },

        // ────────────── Sidebar ──────────────
        isSidebarOpen: false,

        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        setSidebarOpen: (isOpen: boolean) => {
          set({ isSidebarOpen: isOpen });
        },

        // ────────────── Data arrays (empty initial) ──────────────
        residentes: [],
        vigilantes: [],
        administradores: [],
        edificios: [],
        departamentos: [],
        visitantes: [],
        visitantesActivos: [],
        cajones: [],
        matriculas: [],
        accesos: [],
        accesosHoy: [],
        pagos: [],
        pagosPendientes: [],
        pagosVencidos: [],
        anuncios: [],
        usuarios: [],

        // ────────────── Fetch functions ──────────────
        fetchResidentes: async () => {
          try {
            const res = await residentesService.getAll();
            set({ residentes: extractArray(res.data) });
          } catch (e) { console.error('Error fetching residentes:', e); }
        },

        fetchVigilantes: async () => {
          try {
            const res = await vigilantesService.getAll();
            set({ vigilantes: extractArray(res.data) });
          } catch (e) { console.error('Error fetching vigilantes:', e); }
        },

        fetchAdministradores: async () => {
          try {
            const res = await administradoresService.getAll();
            set({ administradores: extractArray(res.data) });
          } catch (e) { console.error('Error fetching administradores:', e); }
        },

        fetchEdificios: async () => {
          try {
            const res = await edificiosService.getAll();
            const all = extractArray(res.data);
            // Deduplicate by num_edificio, keeping the first occurrence
            const seen = new Set<string>();
            const unique = all.filter((e: any) => {
              const key = String(e.num_edificio).trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            set({ edificios: unique });
          } catch (e) { console.error('Error fetching edificios:', e); }
        },

        fetchDepartamentos: async () => {
          try {
            const res = await departamentosService.getAll();
            set({ departamentos: extractArray(res.data) });
          } catch (e) { console.error('Error fetching departamentos:', e); }
        },

        fetchVisitantes: async () => {
          try {
            const res = await visitantesService.getAll();
            set({ visitantes: extractArray(res.data) });
          } catch (e) { console.error('Error fetching visitantes:', e); }
        },

        fetchVisitantesActivos: async () => {
          try {
            const res = await visitantesService.getActivos();
            set({ visitantesActivos: extractArray(res.data) });
          } catch (e) { console.error('Error fetching visitantes activos:', e); }
        },

        fetchCajones: async () => {
          try {
            const res = await cajonesService.getAll();
            set({ cajones: extractArray(res.data) });
          } catch (e) { console.error('Error fetching cajones:', e); }
        },

        fetchMatriculas: async () => {
          try {
            const res = await matriculasService.getAll();
            set({ matriculas: extractArray(res.data) });
          } catch (e) { console.error('Error fetching matriculas:', e); }
        },

        fetchAccesos: async () => {
          try {
            const res = await accesosService.getAll();
            set({ accesos: extractArray(res.data) });
          } catch (e) { console.error('Error fetching accesos:', e); }
        },

        fetchAccesosActivos: async () => {
          try {
            const res = await accesosService.getActivos();
            set({ accesosHoy: extractArray(res.data) });
          } catch (e) { console.error('Error fetching accesos activos:', e); }
        },

        fetchAccesosPorResidente: async (residenteId: number) => {
          try {
            const res = await accesosService.getByResidente(residenteId);
            return extractArray(res.data);
          } catch (e) {
            console.error('Error fetching accesos por residente:', e);
            return [];
          }
        },

        fetchPagos: async () => {
          try {
            const res = await pagosService.getAll();
            const parsed = extractArray(res.data);
            console.log('[fetchPagos] raw res.data:', res.data, '| parsed:', parsed);
            set({ pagos: parsed });
          } catch (e) { console.error('Error fetching pagos:', e); }
        },

        fetchPagosPendientes: async () => {
          try {
            const res = await pagosService.getPendientes();
            set({ pagosPendientes: extractArray(res.data) });
          } catch (e) { console.error('Error fetching pagos pendientes:', e); }
        },

        fetchPagosVencidos: async () => {
          try {
            const res = await pagosService.getVencidos();
            set({ pagosVencidos: extractArray(res.data) });
          } catch (e) { console.error('Error fetching pagos vencidos:', e); }
        },

        fetchPagosPorResidente: async (residenteId: number) => {
          try {
            const res = await pagosService.getByResidente(residenteId);
            return extractArray(res.data);
          } catch (e) {
            console.error('Error fetching pagos por residente:', e);
            return [];
          }
        },

        fetchAnuncios: async () => {
          try {
            const res = await anunciosService.getAll();
            set({ anuncios: extractArray(res.data) });
          } catch (e) { console.error('Error fetching anuncios:', e); }
        },

        fetchUsuarios: async () => {
          try {
            const res = await usersService.getAll();
            set({ usuarios: extractArray(res.data) });
          } catch (e) { console.error('Error fetching usuarios:', e); }
        },

        // ────────────── CRUD Residentes ──────────────
        agregarResidente: async (data) => {
          try {
            const res = await residentesService.create(data);
            await get().fetchResidentes();
            return res?.data?.data || res?.data;
          } catch (e) { console.error('Error creating residente:', e); throw e; }
        },

        actualizarResidente: async (id, data) => {
          try {
            await residentesService.update(id, data);
            await get().fetchResidentes();
          } catch (e) { console.error('Error updating residente:', e); throw e; }
        },

        eliminarResidente: async (id) => {
          try {
            // Find the residente to get the associated user ID before deleting
            const residente = get().residentes.find(r => r.id_residente === id);
            const userId = residente?.id_usuario_fk;

            // Delete associated pago records first (FK constraint)
            const pagosResidente = get().pagos.filter(p => Number(p.id_residente_fk) === Number(id));
            for (const pago of pagosResidente) {
              try {
                await pagosService.delete(pago.id_pago);
              } catch (pagoErr) {
                console.warn('Could not delete pago:', pago.id_pago, pagoErr);
              }
            }

            await residentesService.delete(id);
            await get().fetchResidentes();
            await get().fetchPagos();

            // Also delete the associated user account
            if (userId) {
              try {
                await usersService.delete(userId);
                if (get().usuarios.length > 0) {
                  await get().fetchUsuarios();
                }
              } catch (userErr) {
                console.warn('Could not delete associated user account:', userErr);
              }
            }
          } catch (e) { console.error('Error deleting residente:', e); throw e; }
        },

        // ────────────── CRUD Vigilantes ──────────────
        agregarVigilante: async (data) => {
          try {
            await vigilantesService.create(data);
            await get().fetchVigilantes();
          } catch (e) { console.error('Error creating vigilante:', e); throw e; }
        },

        actualizarVigilante: async (id, data) => {
          try {
            await vigilantesService.update(id, data);
            await get().fetchVigilantes();
          } catch (e) { console.error('Error updating vigilante:', e); throw e; }
        },

        eliminarVigilante: async (id) => {
          try {
            // Find the vigilante to get the associated user ID before deleting
            const vigilante = get().vigilantes.find(v => v.id_vigilante === id);
            const userId = vigilante?.id_usuario_fk;

            await vigilantesService.delete(id);
            await get().fetchVigilantes();

            // Also delete the associated user account
            if (userId) {
              try {
                await usersService.delete(userId);
                // Refresh usuarios list if it's loaded
                if (get().usuarios.length > 0) {
                  await get().fetchUsuarios();
                }
              } catch (userErr) {
                console.warn('Could not delete associated user account:', userErr);
              }
            }
          } catch (e) { console.error('Error deleting vigilante:', e); throw e; }
        },

        // ────────────── CRUD Visitantes ──────────────
        agregarVisitante: async (data) => {
          try {
            await visitantesService.create(data);
            await get().fetchVisitantes();
            await get().fetchVisitantesActivos();
          } catch (e) { console.error('Error creating visitante:', e); throw e; }
        },

        registrarEntradaVisitante: async (id) => {
          try {
            await visitantesService.registrarEntrada(id);
            await get().fetchVisitantesActivos();
          } catch (e) { console.error('Error registrando entrada:', e); throw e; }
        },

        registrarSalidaVisitante: async (id) => {
          try {
            await visitantesService.registrarSalida(id);
            await get().fetchVisitantesActivos();
          } catch (e) { console.error('Error registrando salida:', e); throw e; }
        },

        // ────────────── CRUD Accesos ──────────────
        registrarAcceso: async (data) => {
          try {
            await accesosService.registrarEntrada(data);
            await get().fetchAccesos();
            await get().fetchAccesosActivos();
          } catch (e) { console.error('Error registrando acceso:', e); throw e; }
        },

        registrarSalidaAcceso: async (id) => {
          try {
            await accesosService.registrarSalida(id);
            await get().fetchAccesos();
            await get().fetchAccesosActivos();
          } catch (e) { console.error('Error registrando salida:', e); throw e; }
        },

        buscarMatriculaEnAPI: async (matricula: string) => {
          try {
            const res = await matriculasService.buscar(matricula);
            return res.data || null;
          } catch (e: any) {
            if (e?.response?.status === 404) return null;
            console.error('Error buscando matrícula:', e);
            return null;
          }
        },

        // ────────────── CRUD Pagos ──────────────
        agregarPago: async (data) => {
          try {
            console.log('[agregarPago] enviando datos:', JSON.stringify(data));
            const res = await pagosService.create(data);
            console.log('[agregarPago] respuesta API:', res.data);
            await get().fetchPagos();
          } catch (e: any) {
            console.error('Error creating pago:', e?.response?.data || e);
            throw e;
          }
        },

        actualizarPago: async (id, data) => {
          try {
            console.log('[actualizarPago] id:', id, 'datos:', JSON.stringify(data));
            const res = await pagosService.update(id, data);
            console.log('[actualizarPago] respuesta API:', res.data);
            await get().fetchPagos();
          } catch (e: any) {
            console.error('Error updating pago:', e?.response?.data || e);
            throw e;
          }
        },

        eliminarPago: async (id) => {
          try {
            await pagosService.delete(id);
            await get().fetchPagos();
          } catch (e) { console.error('Error deleting pago:', e); throw e; }
        },

        // ────────────── CRUD Anuncios ──────────────
        agregarAnuncio: async (data) => {
          try {
            await anunciosService.create(data);
            await get().fetchAnuncios();
          } catch (e) { console.error('Error creating anuncio:', e); throw e; }
        },

        actualizarAnuncio: async (id, data) => {
          try {
            await anunciosService.update(id, data);
            await get().fetchAnuncios();
          } catch (e) { console.error('Error updating anuncio:', e); throw e; }
        },

        eliminarAnuncio: async (id) => {
          try {
            await anunciosService.delete(id);
            await get().fetchAnuncios();
          } catch (e) { console.error('Error deleting anuncio:', e); throw e; }
        },

        // ────────────── CRUD Cajones ──────────────
        agregarCajon: async (data) => {
          try {
            await cajonesService.create(data);
            await get().fetchCajones();
          } catch (e) { console.error('Error creating cajon:', e); throw e; }
        },

        actualizarCajon: async (id, data) => {
          try {
            await cajonesService.update(id, data);
            await get().fetchCajones();
          } catch (e) { console.error('Error updating cajon:', e); throw e; }
        },

        eliminarCajon: async (id) => {
          try {
            await cajonesService.delete(id);
            await get().fetchCajones();
          } catch (e) { console.error('Error deleting cajon:', e); throw e; }
        },

        // ────────────── CRUD Matriculas ──────────────
        agregarMatricula: async (data) => {
          try {
            await matriculasService.create(data);
            await get().fetchMatriculas();
          } catch (e) { console.error('Error creating matricula:', e); throw e; }
        },

        actualizarMatricula: async (id, data) => {
          try {
            await matriculasService.update(id, data);
            await get().fetchMatriculas();
          } catch (e) { console.error('Error updating matricula:', e); throw e; }
        },

        eliminarMatricula: async (id) => {
          try {
            await matriculasService.delete(id);
            await get().fetchMatriculas();
          } catch (e) { console.error('Error deleting matricula:', e); throw e; }
        },

        // ────────────── CRUD Edificios ──────────────
        agregarEdificio: async (data) => {
          try {
            const numEdificio = String(data.num_edificio).trim();
            // Check if an edificio with the same num_edificio already exists
            await get().fetchEdificios();
            const existing = get().edificios.find(
              (e) => String(e.num_edificio).trim() === numEdificio
            );
            if (existing) {
              console.log('[agregarEdificio] Edificio already exists, reusing:', existing);
              return existing;
            }
            const payload = {
              ...data,
              num_edificio: parseInt(numEdificio, 10),
            };
            const res = await edificiosService.create(payload);
            await get().fetchEdificios();
            return res.data;
          } catch (e) { console.error('Error creating edificio:', e); throw e; }
        },

        actualizarEdificio: async (id, data) => {
          try {
            await edificiosService.update(id, data);
            await get().fetchEdificios();
          } catch (e) { console.error('Error updating edificio:', e); throw e; }
        },

        eliminarEdificio: async (id) => {
          try {
            await edificiosService.delete(id);
            await get().fetchEdificios();
          } catch (e) { console.error('Error deleting edificio:', e); throw e; }
        },

        // ────────────── CRUD Departamentos ──────────────
        agregarDepartamento: async (data) => {
          try {
            const numDepto = String(data.num_departamento).trim();
            const edificioId = Number(data.id_edificio_fk);
            // Check if a departamento with the same num and edificio already exists
            await get().fetchDepartamentos();
            const existing = get().departamentos.find(
              (d) => String(d.num_departamento).trim() === numDepto && d.id_edificio_fk === edificioId
            );
            if (existing) {
              console.log('[agregarDepartamento] Departamento already exists, reusing:', existing);
              return existing;
            }
            const res = await departamentosService.create(data);
            await get().fetchDepartamentos();
            return res.data;
          } catch (e) { console.error('Error creating departamento:', e); throw e; }
        },

        actualizarDepartamento: async (id, data) => {
          try {
            await departamentosService.update(id, data);
            await get().fetchDepartamentos();
          } catch (e) { console.error('Error updating departamento:', e); throw e; }
        },

        eliminarDepartamento: async (id) => {
          try {
            await departamentosService.delete(id);
            await get().fetchDepartamentos();
          } catch (e) { console.error('Error deleting departamento:', e); throw e; }
        },

        // ────────────── CRUD Users (Admin) ──────────────
        agregarUsuario: async (data) => {
          try {
            const res = await authService.register(data);
            await get().fetchUsuarios();
            return res.data;
          } catch (e) { console.error('Error creating usuario:', e); throw e; }
        },

        actualizarUsuario: async (id, data) => {
          try {
            await usersService.update(id, data);
            await get().fetchUsuarios();
          } catch (e) { console.error('Error updating usuario:', e); throw e; }
        },

        eliminarUsuario: async (id) => {
          try {
            await usersService.delete(id);
            await get().fetchUsuarios();
          } catch (e) { console.error('Error deleting usuario:', e); throw e; }
        },

        bloquearUsuario: async (id) => {
          try {
            await usersService.bloquear(id);
            await get().fetchUsuarios();
          } catch (e) { console.error('Error bloqueando usuario:', e); throw e; }
        },

        desbloquearUsuario: async (id) => {
          try {
            await usersService.desbloquear(id);
            await get().fetchUsuarios();
          } catch (e) { console.error('Error desbloqueando usuario:', e); throw e; }
        },

        // ────────────── Helpers ──────────────
        buscarPorMatricula: (matricula: string) => {
          return get().matriculas.find(
            (m) => m.matricula?.toUpperCase() === matricula.toUpperCase()
          );
        },
      });
    },
    {
      name: 'condominio-session',
      partialize: (state) => ({
        session: state.session,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
