'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Filter, Plus, Edit2, Trash2, X, LogOut } from 'lucide-react';
import { User, EstadoPago } from '@/types';

export default function UsuariosPage() {
  const { usuarios, estadosPago, agregarUsuario, actualizarUsuario, eliminarUsuario } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEdificio, setFilterEdificio] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    edificio: '',
    departamento: '',
    matricula: '',
  });

  const residentes = useMemo(
    () => usuarios.filter((u) => u.rol === 'residente' && u.activo),
    [usuarios]
  );

  const getEstadoPago = (residenteId: string): EstadoPago => {
    const estado = estadosPago.find((e) => e.residenteId === residenteId);
    return estado?.estado || 'pagado';
  };

  const filteredResidentes = useMemo(() => {
    return residentes.filter((residente) => {
      const matchSearch =
        residente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (residente.matricula || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchEdificio = !filterEdificio || residente.edificio === filterEdificio;
      const matchDepartamento =
        !filterDepartamento || residente.departamento === filterDepartamento;

      return matchSearch && matchEdificio && matchDepartamento;
    });
  }, [residentes, searchTerm, filterEdificio, filterDepartamento]);

  const edificios = Array.from(new Set(residentes.map((r) => r.edificio).filter(Boolean)));
  const departamentos = Array.from(
    new Set(residentes.map((r) => r.departamento).filter(Boolean))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailExists = usuarios.some(
      (u) => u.email === formData.email && u.id !== editingUser?.id
    );

    if (emailExists) {
      setError(`Error: el correo ${formData.email} ya existe, intente de nuevo`);
      return;
    }

    if (editingUser) {
      actualizarUsuario(editingUser.id, {
        ...formData,
        rol: 'residente',
      });
    } else {
      agregarUsuario({
        ...formData,
        rol: 'residente',
        activo: true,
        password: formData.password || 'residente123',
      });
    }

    closeModal();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        telefono: user.telefono || '',
        edificio: user.edificio || '',
        departamento: user.departamento || '',
        matricula: user.matricula || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        edificio: '',
        departamento: '',
        matricula: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este residente?')) {
      eliminarUsuario(id);
    }
  };

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
              {edificios.map((e) => (
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
              {departamentos.map((d) => (
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
                    const estadoPago = getEstadoPago(residente.id);

                    return (
                      <tr key={residente.id} className="bg-[#f2f2f3]">
                        <td className="px-8 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.nombre}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.edificio}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.departamento}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.email}
                        </td>
                        <td className="px-6 py-5 border-t border-[#a2a2a2] text-[17px] text-[#2a2a2a]">
                          {residente.telefono}
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
                              onClick={() => handleDelete(residente.id)}
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
                {editingUser ? 'Editar Residente' : 'Nuevo Residente'}
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
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.edificio}
                  onChange={(e) => setFormData({ ...formData, edificio: e.target.value })}
                  placeholder="Edificio"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  required
                />
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  placeholder="Departamento"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  required
                />
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

              {!editingUser && (
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
                className="w-full h-11 rounded-lg bg-[#5f6ec9] text-white font-semibold hover:brightness-110 transition"
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