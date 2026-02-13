'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Plus, X, UserX } from 'lucide-react';
import { ApiVisitante } from '@/types';
import { formatearFecha } from '@/lib/utils';

export default function VisitantesActivosPage() {
  const {
    visitantesActivos,
    fetchVisitantesActivos,
    registrarSalidaVisitante,
    agregarVisitante,
    residentes,
    fetchResidentes,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    categoria: '',
    id_edificio_fk: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchVisitantesActivos(), fetchResidentes()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredVisitantes = useMemo(() => {
    return visitantesActivos.filter(
      (v) =>
        (v.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.empresa || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visitantesActivos, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agregarVisitante({
        nombre: formData.nombre,
        empresa: formData.empresa || undefined,
        categoria: formData.categoria || undefined,
        id_edificio_fk: Number(formData.id_edificio_fk) || undefined,
        activo: 'S',
      });
      await fetchVisitantesActivos();
      closeModal();
    } catch (error) {
      console.error('Error al registrar visitante:', error);
    }
  };

  const handleSalida = async (id: number) => {
    try {
      await registrarSalidaVisitante(id);
    } catch (error) {
      console.error('Error al registrar salida:', error);
    }
  };

  const openModal = () => {
    setFormData({ nombre: '', empresa: '', categoria: '', id_edificio_fk: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ececed] flex items-center justify-center">
        <p className="text-xl text-slate-600">Cargando visitantes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececed] px-4 sm:px-6 py-6">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-[56px] leading-none font-extrabold text-black">Visitantes Activos</h1>
          <p className="mt-3 text-[44px] sm:text-[30px] md:text-[44px] lg:text-[44px] font-semibold text-slate-700">
            Visitantes actualmente dentro del condominio
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
                placeholder="Buscar visitante"
                className="h-[56px] w-full rounded-2xl border-[4px] border-black bg-[#f7f7f7] pl-14 pr-4 text-[38px] sm:text-[22px] md:text-[20px] text-[#1e1e1e] placeholder:text-[#1e1e1e] outline-none focus:border-[#5d6bc7]"
              />
            </div>
          </div>

          <button
            onClick={openModal}
            className="h-[56px] rounded-2xl bg-[#5d6bc7] px-6 text-white inline-flex items-center gap-2 text-[38px] sm:text-[22px] md:text-[20px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-7 w-7" />
            Registrar Visitante
          </button>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-[#777] bg-white/40 overflow-hidden">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5d6bc7] text-white">
                  <th className="px-8 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Nombre</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Empresa</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Hora Entrada</th>
                  <th className="px-6 py-5 text-left text-[36px] sm:text-[22px] md:text-[20px] font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-600 text-lg border-t border-[#8f8f8f]">
                      No hay visitantes activos.
                    </td>
                  </tr>
                ) : (
                  filteredVisitantes.map((visitante) => (
                    <tr key={visitante.id_visitante} className="bg-[#efeff0]">
                      <td className="px-8 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {visitante.nombre}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {visitante.empresa || '-'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f] text-[18px] text-[#292929]">
                        {visitante.createdAt ? formatearFecha(visitante.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-5 border-t border-[#8f8f8f]">
                        <button
                          onClick={() => handleSalida(visitante.id_visitante)}
                          className="rounded-2xl bg-red-500 px-5 py-2 text-white text-[18px] font-medium hover:bg-red-600 transition inline-flex items-center gap-2"
                        >
                          <UserX className="h-4 w-4" />
                          Registrar Salida
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-800">Registrar Visitante</h2>
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
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Empresa (opcional)"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              />

              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
              >
                <option value="">Categoría (opcional)</option>
                <option value="delivery">Delivery</option>
                <option value="transporte">Transporte</option>
                <option value="visitante">Visitante</option>
                <option value="otros">Otros</option>
              </select>

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#5d6bc7] text-white font-semibold hover:brightness-110 transition"
              >
                Registrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
