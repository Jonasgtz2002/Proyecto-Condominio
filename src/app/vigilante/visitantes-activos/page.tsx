'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Plus, X, UserX, AlertCircle, Loader2 } from 'lucide-react';
import { ApiVisitante } from '@/types';
import { formatearFecha } from '@/lib/utils';

export default function VisitantesActivosPage() {
  const {
    visitantesActivos,
    fetchVisitantesActivos,
    registrarSalidaVisitante,
    agregarVisitante,
    edificios,
    fetchEdificios,
    departamentos,
    fetchDepartamentos,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    categoria: '',
    id_edificio_fk: '',
    id_departamento_fk: '',
    matricula: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchVisitantesActivos(), fetchEdificios(), fetchDepartamentos()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter departamentos by selected edificio
  const filteredDepartamentos = useMemo(() => {
    if (!formData.id_edificio_fk) return [];
    return departamentos.filter(
      (d) => d.id_edificio_fk === Number(formData.id_edificio_fk)
    );
  }, [departamentos, formData.id_edificio_fk]);

  const filteredVisitantes = useMemo(() => {
    return visitantesActivos.filter(
      (v) =>
        (v.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.empresa || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [visitantesActivos, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await agregarVisitante({
        nombre: formData.nombre,
        empresa: formData.empresa || undefined,
        categoria: formData.categoria || undefined,
        id_edificio_fk: Number(formData.id_edificio_fk),
        id_departamento_fk: Number(formData.id_departamento_fk),
        activo: 'S',
        matricula: formData.matricula.trim() || undefined,
        hora_entrada: new Date().toISOString(),
      });
      closeModal();
    } catch (error: any) {
      console.error('Error al registrar visitante:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error al registrar visitante';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSalida = async (id: number) => {
    try {
      await registrarSalidaVisitante(id);
    } catch (error: any) {
      console.error('Error al registrar salida:', error);
      const msg = error?.response?.data?.message || error?.message || 'Error al registrar salida';
      alert(msg);
    }
  };

  const openModal = () => {
    setFormData({ nombre: '', empresa: '', categoria: '', id_edificio_fk: '', id_departamento_fk: '', matricula: '' });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-slate-600">Cargando visitantes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="w-full">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-[40px] md:text-[56px] leading-none font-extrabold text-black">Visitantes Activos</h1>
          <p className="mt-3 text-base sm:text-xl md:text-[22px] font-semibold text-slate-700">
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
                className="h-[46px] sm:h-[56px] w-full rounded-2xl border-[3px] sm:border-[4px] border-black bg-white pl-14 pr-4 text-base sm:text-lg md:text-[20px] text-[#1e1e1e] placeholder:text-[#1e1e1e] outline-none focus:border-[#5d6bc7]"
              />
            </div>
          </div>

          <button
            onClick={openModal}
            className="h-[46px] sm:h-[56px] rounded-2xl bg-[#5d6bc7] px-4 sm:px-6 text-white inline-flex items-center gap-2 text-sm sm:text-lg md:text-[20px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-7 w-7" />
            Registrar Visitante
          </button>
        </div>

        {/* Vista móvil: tarjetas */}
        <div className="md:hidden space-y-3">
          {filteredVisitantes.length === 0 ? (
            <div className="rounded-2xl border border-[#777] bg-white px-6 py-12 text-center text-slate-600">
              No hay visitantes activos.
            </div>
          ) : (
            filteredVisitantes.map((visitante) => (
              <div key={visitante.id_visitante} className="rounded-2xl border border-[#777] bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-[#292929] text-base truncate">{visitante.nombre}</p>
                  <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                    {(() => {
                      const horaEntrada = (visitante as any).hora_entrada || (visitante as any).accesos?.[0]?.hora_entrada;
                      if (horaEntrada) return formatearFecha(horaEntrada);
                      if (visitante.createdAt) return formatearFecha(visitante.createdAt);
                      return '-';
                    })()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <p><span className="font-semibold text-slate-600">Empresa:</span> {visitante.empresa || '-'}</p>
                  <p><span className="font-semibold text-slate-600">Edificio:</span> {(visitante as any).edificio?.num_edificio || '-'}</p>
                  <p><span className="font-semibold text-slate-600">Depto:</span> {(visitante as any).departamento?.num_departamento || '-'}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleSalida(visitante.id_visitante)}
                    className="w-full rounded-2xl bg-red-500 px-4 py-2 text-white text-sm font-medium hover:bg-red-600 transition inline-flex items-center justify-center gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Registrar Salida
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista desktop: tabla */}
        <div className="hidden md:block rounded-2xl border border-[#777] bg-white overflow-hidden">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5d6bc7] text-white">
                  <th className="w-[20%] px-4 py-4 text-left text-sm lg:text-base font-medium">Nombre</th>
                  <th className="w-[15%] px-3 py-4 text-left text-sm lg:text-base font-medium">Empresa</th>
                  <th className="w-[12%] px-3 py-4 text-left text-sm lg:text-base font-medium">Edificio</th>
                  <th className="w-[13%] px-3 py-4 text-left text-sm lg:text-base font-medium">Departamento</th>
                  <th className="w-[18%] px-3 py-4 text-left text-sm lg:text-base font-medium">Hora Entrada</th>
                  <th className="w-[22%] px-3 py-4 text-left text-sm lg:text-base font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-600 text-lg border-t border-[#8f8f8f]">
                      No hay visitantes activos.
                    </td>
                  </tr>
                ) : (
                  filteredVisitantes.map((visitante) => (
                    <tr key={visitante.id_visitante} className="bg-white">
                      <td className="px-4 py-4 border-t border-[#8f8f8f] text-sm lg:text-[15px] text-[#292929] truncate">
                        {visitante.nombre}
                      </td>
                      <td className="px-3 py-4 border-t border-[#8f8f8f] text-sm lg:text-[15px] text-[#292929] truncate">
                        {visitante.empresa || '-'}
                      </td>
                      <td className="px-3 py-4 border-t border-[#8f8f8f] text-sm lg:text-[15px] text-[#292929]">
                        {(visitante as any).edificio?.num_edificio || '-'}
                      </td>
                      <td className="px-3 py-4 border-t border-[#8f8f8f] text-sm lg:text-[15px] text-[#292929]">
                        {(visitante as any).departamento?.num_departamento || '-'}
                      </td>
                      <td className="px-3 py-4 border-t border-[#8f8f8f] text-sm lg:text-[15px] text-[#292929]">
                        {(() => {
                          const horaEntrada = (visitante as any).hora_entrada || (visitante as any).accesos?.[0]?.hora_entrada;
                          if (horaEntrada) return formatearFecha(horaEntrada);
                          if (visitante.createdAt) return formatearFecha(visitante.createdAt);
                          return '-';
                        })()}
                      </td>
                      <td className="px-3 py-4 border-t border-[#8f8f8f]">
                        <button
                          onClick={() => handleSalida(visitante.id_visitante)}
                          className="rounded-2xl bg-red-500 px-4 py-1.5 text-white text-sm font-medium hover:bg-red-600 transition inline-flex items-center gap-2"
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
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre *"
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

              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10) })}
                placeholder="Matrícula del vehículo (opcional)"
                maxLength={10}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7] font-mono"
              />

              <select
                value={formData.id_edificio_fk}
                onChange={(e) => setFormData({ ...formData, id_edificio_fk: e.target.value, id_departamento_fk: '' })}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
              >
                <option value="">Seleccionar Edificio *</option>
                {edificios.map((ed) => (
                  <option key={ed.id_edificio} value={ed.id_edificio}>
                    Edificio {ed.num_edificio}
                  </option>
                ))}
              </select>

              <select
                value={formData.id_departamento_fk}
                onChange={(e) => setFormData({ ...formData, id_departamento_fk: e.target.value })}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5d6bc7]"
                required
                disabled={!formData.id_edificio_fk}
              >
                <option value="">{formData.id_edificio_fk ? 'Seleccionar Departamento *' : 'Primero selecciona un edificio'}</option>
                {filteredDepartamentos.map((dep) => (
                  <option key={dep.id_departamento} value={dep.id_departamento}>
                    Departamento {dep.num_departamento || dep.id_departamento}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-[#5d6bc7] text-white font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando…
                  </>
                ) : (
                  'Registrar'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
