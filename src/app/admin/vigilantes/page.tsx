'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Plus, Edit2, Trash2, X, Filter, Menu, ArrowUpDown } from 'lucide-react';
import { ApiVigilante } from '@/types';
import { formatearFecha } from '@/lib/utils';

type SortField = 'nombre' | 'turno' | 'fecha_alta';
type SortDir = 'asc' | 'desc';

export default function VigilantesPage() {
  const {
    vigilantes,
    fetchVigilantes,
    agregarVigilante, actualizarVigilante, eliminarVigilante,
    agregarUsuario,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterTurno, setFilterTurno] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingVigilante, setEditingVigilante] = useState<ApiVigilante | null>(null);

  const [formError, setFormError] = useState('');
  const [toastError, setToastError] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    turno: 'matutino',
    fechaAlta: todayISO,
  });

  // Auto-dismiss toast after 8 seconds
  useEffect(() => {
    if (toastError) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToastError(''), 8000);
    }
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, [toastError]);

  useEffect(() => {
    const loadData = async () => {
      try { await fetchVigilantes(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredVigilantes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let list = vigilantes.filter((v) => {
      const matchSearch =
        (v.nombre || '').toLowerCase().includes(term) ||
        (v.turno || '').toLowerCase().includes(term) ||
        (v.usuario?.correo || '').toLowerCase().includes(term);
      const matchTurno = filterTurno === 'todos' || (v.turno || '').toLowerCase() === filterTurno;
      return matchSearch && matchTurno;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nombre') {
        cmp = (a.nombre || '').localeCompare(b.nombre || '');
      } else if (sortField === 'turno') {
        cmp = (a.turno || '').localeCompare(b.turno || '');
      } else if (sortField === 'fecha_alta') {
        const da = a.fecha_alta || a.createdAt || '';
        const db = b.fecha_alta || b.createdAt || '';
        cmp = da.localeCompare(db);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [vigilantes, searchTerm, filterTurno, sortField, sortDir]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Phone validation: must be exactly 10 digits if provided
    if (formData.telefono && formData.telefono.length !== 10) {
      setFormError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    // Duplicate email check
    const emailLower = formData.email.toLowerCase();
    const duplicate = vigilantes.find(
      (v) =>
        v.usuario?.correo?.toLowerCase() === emailLower &&
        v.id_vigilante !== (editingVigilante?.id_vigilante ?? -1)
    );
    if (duplicate && !editingVigilante) {
      setToastError('Ya existe un vigilante con ese correo electrónico');
      return;
    }

    setSaving(true);

    try {
      if (editingVigilante) {
        await actualizarVigilante(editingVigilante.id_vigilante, {
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono || undefined,
          turno: formData.turno,
          fecha_alta: new Date(formData.fechaAlta).toISOString(),
        });
      } else {
        // 1) Create user account
        const newUser = await agregarUsuario({
          correo: formData.email,
          password: formData.password || 'vigilante123',
          rol: 'VIGILANTE',
        });

        const newUserId = newUser?.usuario?.id_usuario || newUser?.id_usuario || newUser?.id;
        if (!newUserId) {
          setFormError('Error al crear usuario — no se obtuvo ID');
          setSaving(false);
          return;
        }

        // 2) Create vigilante profile linked to the new user
        await agregarVigilante({
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono || undefined,
          turno: formData.turno,
          fecha_alta: new Date(formData.fechaAlta).toISOString(),
          id_usuario_fk: newUserId,
        });
      }
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar vigilante';
      setToastError(msg);
      console.error('Error guardando vigilante:', err);
    } finally {
      setSaving(false);
    }
  };

  const openModal = (vigilante?: ApiVigilante) => {
    if (vigilante) {
      setEditingVigilante(vigilante);
      const nameParts = (vigilante.nombre || '').split(' ');
      setFormData({
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        email: vigilante.usuario?.correo || '',
        password: '',
        telefono: vigilante.telefono || '',
        turno: vigilante.turno || 'matutino',
        fechaAlta: vigilante.fecha_alta
          ? new Date(vigilante.fecha_alta).toISOString().slice(0, 10)
          : vigilante.createdAt
            ? new Date(vigilante.createdAt).toISOString().slice(0, 10)
            : todayISO,
      });
    } else {
      setEditingVigilante(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        turno: 'matutino',
        fechaAlta: todayISO,
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVigilante(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este vigilante?')) {
      try { await eliminarVigilante(id); }
      catch (err) { console.error('Error eliminando vigilante:', err); }
    }
  };

  const turnoLabel = (t?: string) => {
    if (!t) return '-';
    const map: Record<string, string> = { matutino: 'Matutino', vespertino: 'Vespertino', nocturno: 'Nocturno' };
    return map[t.toLowerCase()] || t;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando vigilantes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-6">
      <div className="mx-auto w-full max-w-[1440px]">

        {/* Encabezado */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
            Panel de administración
          </h1>
          <p className="mt-1 text-base sm:text-lg md:text-[20px] font-semibold text-gray-400">
            Gestión de la unidad habitacional
          </p>
        </div>

        {/* Título de sección */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl md:text-[28px] leading-tight font-bold text-black">
            Directorio de vigilantes
          </h2>
        </div>

        {/* Barra superior */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-[570px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-[#1b1b1b]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o turno"
                className="h-[46px] sm:h-[56px] w-full rounded-2xl border-[3px] sm:border-[4px] border-black bg-white pl-14 pr-4 text-base sm:text-lg md:text-[20px] text-[#1e1e1e] placeholder:text-[#1e1e1e] outline-none focus:border-[#5d6bc7]"
              />
            </div>

            <button
              type="button"
              className="h-[46px] w-[48px] sm:h-[56px] sm:w-[58px] rounded-2xl bg-[#5d6bc7] text-white inline-flex items-center justify-center hover:brightness-110 transition"
            >
              <Search className="h-8 w-8" />
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="h-[46px] sm:h-[56px] rounded-2xl bg-[#5d6bc7] text-white px-4 sm:px-5 inline-flex items-center gap-2 text-sm sm:text-lg md:text-[20px] font-medium hover:brightness-110 transition"
            >
              <Menu className="h-7 w-7" />
              Filtrar
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="h-[46px] sm:h-[56px] rounded-2xl bg-[#5d6bc7] px-4 sm:px-6 text-white inline-flex items-center gap-2 text-sm sm:text-lg md:text-[20px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-7 w-7" />
            Nuevo Vigilante
          </button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="mb-4 rounded-xl border border-[#cdd3ff] bg-white p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Turno:</span>
              <select
                value={filterTurno}
                onChange={(e) => setFilterTurno(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              >
                <option value="todos">Todos</option>
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="nocturno">Nocturno</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Ordenar por:</span>
              <select
                value={`${sortField}-${sortDir}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split('-') as [SortField, SortDir];
                  setSortField(f);
                  setSortDir(d);
                }}
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              >
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                <option value="turno-asc">Turno A-Z</option>
                <option value="turno-desc">Turno Z-A</option>
                <option value="fecha_alta-asc">Fecha alta (antigua)</option>
                <option value="fecha_alta-desc">Fecha alta (reciente)</option>
              </select>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl border border-[#777] bg-white overflow-hidden">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5d6bc7] text-white">
                  <th
                    className="px-4 sm:px-8 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('nombre')}
                  >
                    Nombre {sortField === 'nombre' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium">Teléfono</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium">Email</th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('fecha_alta')}
                  >
                    Fecha de alta {sortField === 'fecha_alta' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('turno')}
                  >
                    Turno {sortField === 'turno' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium">Estado</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-base md:text-[20px] font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredVigilantes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600 text-lg border-t border-[#8f8f8f]">
                      No hay vigilantes para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredVigilantes.map((vigilante) => (
                    <tr key={vigilante.id_vigilante} className="bg-white">
                      <td className="px-8 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {vigilante.nombre}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {vigilante.telefono || '-'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {vigilante.usuario?.correo || '-'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {vigilante.fecha_alta
                          ? formatearFecha(vigilante.fecha_alta)
                          : vigilante.createdAt
                            ? formatearFecha(vigilante.createdAt)
                            : '-'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[15px] font-medium ${
                          (vigilante.turno || '').toLowerCase() === 'matutino'
                            ? 'bg-yellow-100 text-yellow-800'
                            : (vigilante.turno || '').toLowerCase() === 'vespertino'
                              ? 'bg-orange-100 text-orange-800'
                              : (vigilante.turno || '').toLowerCase() === 'nocturno'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                          {turnoLabel(vigilante.turno)}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f]">
                        <span
                          className={`inline-flex items-center rounded-2xl px-4 py-1.5 text-[17px] font-semibold text-white ${
                            vigilante.usuario?.cuenta_bloq ? 'bg-[#ff5757]' : 'bg-[#8BC46A]'
                          }`}
                        >
                          {vigilante.usuario?.cuenta_bloq ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f]">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDelete(vigilante.id_vigilante)}
                            className="p-2 rounded-lg text-[#ff5757] hover:bg-[#ffeaea] transition"
                            title="Eliminar"
                          >
                            <Trash2 className="h-8 w-8" />
                          </button>
                          <button
                            onClick={() => openModal(vigilante)}
                            className="rounded-2xl bg-[#5d6bc7] px-5 py-2 text-white text-[18px] font-medium hover:brightness-110 transition inline-flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => openModal()}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-16 w-16 sm:h-[102px] sm:w-[102px] rounded-full bg-[#5d6bc7] text-white shadow-xl inline-flex items-center justify-center hover:brightness-110 transition"
          title="Nuevo"
        >
          <Plus className="h-14 w-14" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingVigilante ? 'Editar Vigilante' : 'Nuevo Vigilante'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="p-5 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
              />

              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Apellido"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
              />

              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                autoComplete="new-email"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
              />

              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, telefono: val });
                }}
                placeholder="Teléfono (10 dígitos)"
                maxLength={10}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              />

              {/* Turno */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Turno</label>
                <select
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                  required
                >
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                  <option value="nocturno">Nocturno</option>
                </select>
              </div>

              {/* Fecha de alta */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Fecha de alta</label>
                <input
                  type="date"
                  value={formData.fechaAlta}
                  onChange={(e) => setFormData({ ...formData, fechaAlta: e.target.value })}
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                />
              </div>

              {!editingVigilante && (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña (opcional)"
                  autoComplete="new-password"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                />
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-lg bg-[#5d6bc7] text-white font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating error toast */}
      {toastError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-red-400 text-white px-10 py-5 rounded-2xl shadow-2xl text-lg font-semibold pointer-events-auto max-w-md text-center">
            {toastError}
          </div>
        </div>
      )}
    </div>
  );
}
