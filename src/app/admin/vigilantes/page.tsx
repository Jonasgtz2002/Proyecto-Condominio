'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Plus, Edit2, Trash2, X, Filter, Menu, LogOut } from 'lucide-react';
import { ApiVigilante } from '@/types';
import { formatearFecha } from '@/lib/utils';

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
  const [showModal, setShowModal] = useState(false);
  const [editingVigilante, setEditingVigilante] = useState<ApiVigilante | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try { await fetchVigilantes(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const filteredVigilantes = useMemo(() => {
    return vigilantes.filter(
      (v) =>
        (v.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.usuario?.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vigilantes, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVigilante) {
        await actualizarVigilante(editingVigilante.id_vigilante, {
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono || undefined,
        });
      } else {
        // 1) Create user account
        const newUser = await agregarUsuario({
          correo: formData.email,
          password: formData.password || 'vigilante123',
          rol: 'VIGILANTE',
        });
        // 2) Create vigilante profile linked to the new user
        await agregarVigilante({
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono || undefined,
          id_usuario_fk: newUser?.usuario?.id_usuario || newUser?.id_usuario || newUser?.id,
        });
      }
      closeModal();
    } catch (err: any) {
      console.error('Error guardando vigilante:', err);
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
      });
    } else {
      setEditingVigilante(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
      });
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando vigilantes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececed] px-4 sm:px-6 py-6">
      {/* ancho controlado para evitar “efecto zoom” */}
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Top-right */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="rounded-2xl border border-red-400 bg-white px-6 py-3 text-[18px] font-semibold text-[#1e1e1e] hover:bg-red-50 transition"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Cerrar sesión
            </span>
          </button>
        </div>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-[56px] leading-none font-extrabold text-black">Vigilantes</h1>
          <p className="mt-3 text-[44px] sm:text-[30px] md:text-[44px] lg:text-[44px] font-semibold text-slate-700">
            Información sobre los vigilantes
          </p>
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
                placeholder="Buscar"
                className="h-[56px] w-full rounded-2xl border-[4px] border-black bg-[#f7f7f7] pl-14 pr-4 text-[38px] sm:text-[22px] md:text-[20px] text-[#1e1e1e] placeholder:text-[#1e1e1e] outline-none focus:border-[#5d6bc7]"
              />
            </div>

            <button
              type="button"
              className="h-[56px] w-[58px] rounded-2xl bg-[#5d6bc7] text-white inline-flex items-center justify-center hover:brightness-110 transition"
            >
              <Search className="h-8 w-8" />
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="h-[56px] rounded-2xl bg-[#5d6bc7] text-white px-5 inline-flex items-center gap-2 text-[38px] sm:text-[22px] md:text-[20px] font-medium hover:brightness-110 transition"
            >
              <Menu className="h-7 w-7" />
              Filtrar
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="h-[56px] rounded-2xl bg-[#5d6bc7] px-6 text-white inline-flex items-center gap-2 text-[38px] sm:text-[22px] md:text-[20px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-7 w-7" />
            Nuevo Residente
          </button>
        </div>

        {/* Filtros opcionales */}
        {showFilters && (
          <div className="mb-4 rounded-xl border border-[#cdd3ff] bg-white p-3">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Puedes agregar aquí más filtros (turno / estado) si quieres.
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl border border-[#777] bg-white/40 overflow-hidden">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5d6bc7] text-white">
                  <th className="px-8 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Nombre</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Teléfono</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Email</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Fecha de alta</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Turno</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Estado</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Acciones</th>
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
                    <tr key={vigilante.id_vigilante} className="bg-[#efeff0]">
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
                        {vigilante.createdAt ? formatearFecha(vigilante.createdAt) : '-'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        -
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f]">
                        <span
                          className="inline-flex items-center rounded-2xl px-4 py-1.5 text-[17px] font-semibold text-white bg-[#8BC46A]"
                        >
                          Activo
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
          className="fixed bottom-8 right-8 h-[102px] w-[102px] rounded-full bg-[#5d6bc7] text-white shadow-xl inline-flex items-center justify-center hover:brightness-110 transition"
          title="Nuevo"
        >
          <Plus className="h-14 w-14" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
              />

              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Teléfono"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              />

              {!editingVigilante && (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña (opcional)"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                />
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#5d6bc7] text-white font-semibold hover:brightness-110 transition"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}