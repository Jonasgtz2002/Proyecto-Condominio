'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Filter, Plus, Edit2, Trash2, X, LogOut } from 'lucide-react';
import { ApiResidente } from '@/types';

export default function UsuariosPage() {
  const {
    residentes, pagos, edificios, departamentos,
    fetchResidentes, fetchPagos, fetchEdificios, fetchDepartamentos,
    agregarResidente, actualizarResidente, eliminarResidente,
    agregarUsuario, agregarEdificio, agregarDepartamento,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEdificio, setFilterEdificio] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingResidente, setEditingResidente] = useState<ApiResidente | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Toggle: select existing or create new
  const [crearEdificio, setCrearEdificio] = useState(false);
  const [crearDepartamento, setCrearDepartamento] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    id_edificio: '',
    id_departamento: '',
    matricula: '',
    // New edificio/depto fields
    nuevoEdificio: '',
    nuevoDireccion: '',
    nuevoDepartamento: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchResidentes(), fetchPagos(), fetchEdificios(), fetchDepartamentos()]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const getEstadoPago = (residenteId: number): string => {
    const pagoResidente = pagos.find((p) => p.id_residente_fk === residenteId);
    return pagoResidente?.estatus || pagoResidente?.estado || 'pagado';
  };

  const filteredResidentes = useMemo(() => {
    return residentes.filter((residente) => {
      const fullName = (residente.nombre || '').toLowerCase();
      const email = residente.usuario?.correo || '';
      const matchSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEdificio = !filterEdificio || residente.edificio?.num_edificio === filterEdificio;
      const matchDepartamento =
        !filterDepartamento || String(residente.departamento?.id_departamento) === filterDepartamento;

      return matchSearch && matchEdificio && matchDepartamento;
    });
  }, [residentes, searchTerm, filterEdificio, filterDepartamento]);

  const edificiosList = Array.from(new Set(residentes.map((r) => r.edificio?.num_edificio).filter(Boolean)));
  const departamentosList = Array.from(
    new Set(residentes.map((r) => r.departamento?.id_departamento).filter((v): v is number => v != null).map(String))
  );

  // Filter departamentos by selected edificio in form
  const departamentosFiltrados = useMemo(() => {
    if (!formData.id_edificio) return departamentos;
    return departamentos.filter((d) => d.id_edificio_fk === Number(formData.id_edificio));
  }, [departamentos, formData.id_edificio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingResidente) {
        // ── Edit mode ──
        let finalEdificioId = formData.id_edificio ? Number(formData.id_edificio) : undefined;
        let finalDeptoId = formData.id_departamento ? Number(formData.id_departamento) : undefined;

        if (crearEdificio && formData.nuevoEdificio.trim()) {
          const ed = await agregarEdificio({ num_edificio: formData.nuevoEdificio.trim() });
          finalEdificioId = ed?.id_edificio;
        }
        if (crearDepartamento && finalEdificioId) {
          const dp = await agregarDepartamento({ id_edificio_fk: finalEdificioId });
          finalDeptoId = dp?.id_departamento;
        }

        await actualizarResidente(editingResidente.id_residente, {
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono,
          id_edificio_fk: finalEdificioId,
          id_departamento_fk: finalDeptoId,
        });
      } else {
        // ── Create mode ──

        // 1) Edificio: create new or use selected
        let finalEdificioId: number | undefined;
        if (crearEdificio && formData.nuevoEdificio.trim()) {
          const ed = await agregarEdificio({ num_edificio: formData.nuevoEdificio.trim() });
          console.log('Edificio creado:', ed);
          finalEdificioId = ed?.id_edificio;
          if (!finalEdificioId) {
            // Refetch and find by name as fallback
            await fetchEdificios();
            const found = edificios.find((e) => e.num_edificio === formData.nuevoEdificio.trim());
            finalEdificioId = found?.id_edificio;
          }
        } else if (formData.id_edificio) {
          finalEdificioId = Number(formData.id_edificio);
        }

        // 2) Departamento: create new or use selected
        let finalDeptoId: number | undefined;
        if (crearDepartamento) {
          if (!finalEdificioId) {
            setError('Debes seleccionar o crear un edificio antes del departamento');
            setSaving(false);
            return;
          }
          const dp = await agregarDepartamento({ id_edificio_fk: finalEdificioId });
          console.log('Departamento creado:', dp);
          finalDeptoId = dp?.id_departamento;
          if (!finalDeptoId) {
            await fetchDepartamentos();
            const found = departamentos.find((d) => d.id_edificio_fk === finalEdificioId);
            finalDeptoId = found?.id_departamento;
          }
        } else if (formData.id_departamento) {
          finalDeptoId = Number(formData.id_departamento);
        }

        // Validate that edificio and departamento were resolved
        if (!finalEdificioId || !finalDeptoId) {
          setError('Debes seleccionar o crear un edificio y un departamento');
          setSaving(false);
          return;
        }

        // 3) Create user account
        const newUser = await agregarUsuario({
          correo: formData.email,
          password: formData.password || 'residente123',
          rol: 'RESIDENTE',
        });

        const newUserId = newUser?.usuario?.id_usuario || newUser?.id_usuario || newUser?.id;
        if (!newUserId) {
          setError('Error al crear usuario — no se obtuvo ID');
          setSaving(false);
          return;
        }

        // 4) Create residente profile
        await agregarResidente({
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono,
          id_usuario_fk: newUserId,
          id_edificio_fk: finalEdificioId,
          id_departamento_fk: finalDeptoId,
        });
      }
      closeModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const openModal = (residente?: ApiResidente) => {
    if (residente) {
      setEditingResidente(residente);
      const nameParts = (residente.nombre || '').split(' ');
      setFormData({
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        email: residente.usuario?.correo || '',
        password: '',
        telefono: residente.telefono || '',
        id_edificio: residente.id_edificio_fk?.toString() || '',
        id_departamento: residente.id_departamento_fk?.toString() || '',
        matricula: '',
        nuevoEdificio: '',
        nuevoDireccion: '',
        nuevoDepartamento: '',
      });
    } else {
      setEditingResidente(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        id_edificio: '',
        id_departamento: '',
        matricula: '',
        nuevoEdificio: '',
        nuevoDireccion: '',
        nuevoDepartamento: '',
      });
    }
    setCrearEdificio(false);
    setCrearDepartamento(false);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResidente(null);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este residente?')) {
      try {
        await eliminarResidente(id);
      } catch (err) {
        console.error('Error eliminando residente:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando residentes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeeeef] px-4 sm:px-6 py-6">
      {/* Contenedor principal SIN zoom visual */}
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Top right */}
        <div className="flex justify-end mb-4">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-red-400 bg-white px-5 py-2.5 text-[18px] font-semibold text-[#1f1f1f] hover:bg-red-50 transition"
            type="button"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            Cerrar sesión
          </button>
        </div>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-[42px] leading-tight font-extrabold text-black">
            Directorio de residentes
          </h1>
          <p className="mt-2 text-[40px] sm:text-[36px] md:text-[22px] font-semibold text-slate-700">
            Información sobre los residentes
          </p>
        </div>

        {/* Barra acciones */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-[540px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-7 w-7 text-[#1a1a1a]" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[54px] w-full rounded-2xl border-[3px] border-black bg-[#f6f6f7] pl-14 pr-4 text-[34px] sm:text-[20px] md:text-[18px] text-[#1d1d1d] placeholder:text-[#1d1d1d] outline-none focus:border-[#5f6ec9]"
              />
            </div>

            <button
              type="button"
              className="h-[54px] w-[58px] rounded-2xl bg-[#5f6ec9] text-white flex items-center justify-center hover:brightness-110 transition"
            >
              <Search className="h-8 w-8" />
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="h-[54px] rounded-2xl bg-[#5f6ec9] text-white px-5 inline-flex items-center gap-2 text-[36px] sm:text-[20px] md:text-[18px] font-medium hover:brightness-110 transition"
            >
              <Filter className="h-7 w-7" />
              Filtrar
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="h-[54px] rounded-2xl bg-[#5f6ec9] text-white px-6 inline-flex items-center gap-2 text-[36px] sm:text-[20px] md:text-[18px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-7 w-7" />
            Nuevo Residente
          </button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={filterEdificio}
              onChange={(e) => setFilterEdificio(e.target.value)}
              className="h-[50px] rounded-xl border border-[#cfd3f3] bg-white px-4 text-[17px] text-slate-700 outline-none focus:ring-2 focus:ring-[#6a76c9]"
            >
              <option value="">Filtrar edificio</option>
              {edificiosList.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            <select
              value={filterDepartamento}
              onChange={(e) => setFilterDepartamento(e.target.value)}
              className="h-[50px] rounded-xl border border-[#cfd3f3] bg-white px-4 text-[17px] text-slate-700 outline-none focus:ring-2 focus:ring-[#6a76c9]"
            >
              <option value="">Filtrar departamento</option>
              {departamentosList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabla estilo referencia */}
        <div className="rounded-2xl border border-[#8b8b8b] overflow-hidden bg-white/40">
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5f6ec9] text-white">
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-8 py-5">Nombre</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Edificio</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Departamento</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Email</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Teléfono</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Estatus</th>
                  <th className="text-left font-medium text-[34px] sm:text-[20px] md:text-[18px] px-6 py-5">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredResidentes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-600 text-lg">
                      No hay residentes para mostrar
                    </td>
                  </tr>
                ) : (
                  filteredResidentes.map((residente) => {
                    const estadoPago = getEstadoPago(residente.id_residente);

                    return (
                      <tr key={residente.id_residente} className="bg-[#f2f2f3]">
                        <td className="px-8 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.nombre}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.edificio?.num_edificio || '-'}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.departamento?.id_departamento || '-'}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.usuario?.correo || '-'}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.telefono || '-'}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2]">
                          <span
                            className={`inline-flex items-center rounded-2xl px-4 py-1.5 text-[20px] sm:text-[16px] font-semibold ${
                              estadoPago === 'pagado'
                                ? 'bg-[#8BC46A] text-white'
                                : 'bg-[#ff5757] text-white'
                            }`}
                          >
                            {estadoPago === 'pagado' ? 'Pagado' : 'Vencido'}
                          </span>
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(residente)}
                              className="p-2 rounded-lg text-[#5f6ec9] hover:bg-[#e9ecff] transition"
                              title="Editar"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(residente.id_residente)}
                              className="p-2 rounded-lg text-[#ff5757] hover:bg-[#ffeaea] transition"
                              title="Eliminar"
                            >
                              <Trash2 className="h-6 w-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAB + */}
        <button
          type="button"
          onClick={() => openModal()}
          className="fixed bottom-8 right-8 h-[92px] w-[92px] rounded-full bg-[#5f6ec9] text-white shadow-xl inline-flex items-center justify-center hover:brightness-110 transition"
          title="Nuevo Residente"
        >
          <Plus className="h-12 w-12" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingResidente ? 'Editar Residente' : 'Nuevo Residente'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                required
              />

              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Apellido"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                required
              />

              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                required
              />

              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Teléfono"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Edificio</label>
                  <button
                    type="button"
                    onClick={() => { setCrearEdificio(!crearEdificio); setFormData({ ...formData, id_edificio: '', nuevoEdificio: '', nuevoDireccion: '' }); }}
                    className="text-xs text-[#5f6ec9] font-semibold hover:underline"
                  >
                    {crearEdificio ? '← Seleccionar existente' : '+ Crear nuevo'}
                  </button>
                </div>
                {crearEdificio ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.nuevoEdificio}
                      onChange={(e) => setFormData({ ...formData, nuevoEdificio: e.target.value })}
                      placeholder="Nº Edificio"
                      className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                      required
                    />
                    <input
                      type="text"
                      value={formData.nuevoDireccion}
                      onChange={(e) => setFormData({ ...formData, nuevoDireccion: e.target.value })}
                      placeholder="Dirección (opcional)"
                      className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                    />
                  </div>
                ) : (
                  <select
                    value={formData.id_edificio}
                    onChange={(e) => setFormData({ ...formData, id_edificio: e.target.value, id_departamento: '' })}
                    className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  >
                    <option value="">Seleccionar Edificio</option>
                    {edificios.map((ed) => (
                      <option key={ed.id_edificio} value={ed.id_edificio}>{ed.num_edificio}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Departamento</label>
                  <button
                    type="button"
                    onClick={() => { setCrearDepartamento(!crearDepartamento); setFormData({ ...formData, id_departamento: '', nuevoDepartamento: '' }); }}
                    className="text-xs text-[#5f6ec9] font-semibold hover:underline"
                  >
                    {crearDepartamento ? '← Seleccionar existente' : '+ Crear nuevo'}
                  </button>
                </div>
                {crearDepartamento ? (
                  <input
                    type="text"
                    value={formData.nuevoDepartamento}
                    onChange={(e) => setFormData({ ...formData, nuevoDepartamento: e.target.value })}
                    placeholder="Nº Departamento"
                    className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                    required
                  />
                ) : (
                  <select
                    value={formData.id_departamento}
                    onChange={(e) => setFormData({ ...formData, id_departamento: e.target.value })}
                    className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  >
                    <option value="">Seleccionar Departamento</option>
                    {departamentosFiltrados.map((d) => (
                      <option key={d.id_departamento} value={d.id_departamento}>Depto #{d.id_departamento}</option>
                    ))}
                  </select>
                )}
              </div>

              <input
                type="text"
                value={formData.matricula}
                onChange={(e) =>
                  setFormData({ ...formData, matricula: e.target.value.toUpperCase() })
                }
                placeholder="Matrícula"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                required
              />

              {!editingResidente && (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña (opcional)"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                />
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-lg bg-[#5f6ec9] text-white font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}