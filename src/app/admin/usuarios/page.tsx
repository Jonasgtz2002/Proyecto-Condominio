'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Filter, Plus, Edit2, Trash2, X } from 'lucide-react';
import { ApiResidente } from '@/types';

export default function UsuariosPage() {
  const {
    residentes, pagos, edificios, departamentos,
    fetchResidentes, fetchPagos, fetchEdificios, fetchDepartamentos,
    agregarResidente, actualizarResidente, eliminarResidente,
    agregarUsuario, agregarEdificio, agregarDepartamento,
    agregarPago, actualizarPago,
    agregarCajon, fetchCajones, actualizarCajon,
    actualizarDepartamento,
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
  const [pagoWarning, setPagoWarning] = useState('');
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss error after 10 seconds
  useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (error) {
      errorTimerRef.current = setTimeout(() => setError(''), 10000);
    }
    return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
  }, [error]);

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
    // Payment fields
    estadoPago: 'pagado',
    montoPago: '',
    fechaInicio: '',
    fechaProximoPago: '',
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
    const pagoResidente = pagos.find((p) => Number(p.id_residente_fk) === Number(residenteId));
    if (!pagoResidente) return 'sin_info';
    return pagoResidente?.estatus || pagoResidente?.estado || 'pendiente';
  };

  const getPagoResidente = (residenteId: number) => {
    return pagos.find((p) => Number(p.id_residente_fk) === Number(residenteId)) || null;
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

    // Phone validation: must be exactly 10 digits if provided
    if (formData.telefono && formData.telefono.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

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
        if (crearDepartamento && formData.nuevoDepartamento.trim()) {
          // In edit mode: update the existing department's num_departamento
          // so the cajón (already linked to it) reflects the new number
          const existingDeptoId = editingResidente.id_departamento_fk;
          if (existingDeptoId) {
            await actualizarDepartamento(existingDeptoId, {
              num_departamento: formData.nuevoDepartamento.trim(),
              ...(finalEdificioId ? { id_edificio_fk: finalEdificioId } : {}),
            });
            finalDeptoId = existingDeptoId;
            console.log('[EDIT] Departamento actualizado num_departamento:', formData.nuevoDepartamento.trim());
          } else if (finalEdificioId) {
            // No existing dept — create new
            const dp = await agregarDepartamento({ id_edificio_fk: finalEdificioId, num_departamento: formData.nuevoDepartamento.trim() });
            finalDeptoId = dp?.id_departamento;
          }
        }

        await actualizarResidente(editingResidente.id_residente, {
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          telefono: formData.telefono,
          id_edificio_fk: finalEdificioId,
          id_departamento_fk: finalDeptoId,
        });

        // Update or create pago for this residente
        try {
          const freshPagos = useStore.getState().pagos;
          const pagoExistente = freshPagos.find((p) => Number(p.id_residente_fk) === Number(editingResidente.id_residente));
          const pagoData: any = {
            monto: formData.estadoPago === 'pagado' ? 0 : (formData.montoPago ? Number(formData.montoPago) : 0),
            estado: formData.estadoPago || 'pendiente',
            estatus: formData.estadoPago || 'pendiente',
            id_residente_fk: editingResidente.id_residente,
          };
          if (formData.fechaInicio) pagoData.fecha_ultimopago = formData.fechaInicio;
          if (formData.fechaProximoPago) pagoData.fecha_vencimiento = formData.fechaProximoPago;

          if (pagoData.fecha_ultimopago) pagoData.fecha_ultimopago = new Date(pagoData.fecha_ultimopago).toISOString();
          if (pagoData.fecha_vencimiento) pagoData.fecha_vencimiento = new Date(pagoData.fecha_vencimiento).toISOString();
          console.log('[EDIT] Pago existente:', pagoExistente, 'Datos a enviar:', JSON.stringify(pagoData));

          if (pagoExistente) {
            await actualizarPago(pagoExistente.id_pago, pagoData);
          } else {
            await agregarPago(pagoData);
          }
        } catch (pagoErr: any) {
          console.error('[EDIT] Error guardando pago:', pagoErr?.response?.data || pagoErr);
          // Don't block — resident was saved successfully
        }
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
          const dp = await agregarDepartamento({ id_edificio_fk: finalEdificioId, num_departamento: formData.nuevoDepartamento.trim() });
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
          // Re-fetch from store in case the data was just created
          const freshEdificios = useStore.getState().edificios;
          const freshDepartamentos = useStore.getState().departamentos;
          if (!finalEdificioId && crearEdificio) {
            const found = freshEdificios.find((e) => e.num_edificio === formData.nuevoEdificio.trim());
            finalEdificioId = found?.id_edificio;
          }
          if (!finalDeptoId && crearDepartamento && finalEdificioId) {
            const found = freshDepartamentos.find((d) => d.id_edificio_fk === finalEdificioId);
            finalDeptoId = found?.id_departamento;
          }
        }

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
          matricula: formData.matricula.trim() || undefined,
        });

        // 5) Find the newly created residente from the refreshed store
        const freshResidentes = useStore.getState().residentes;
        const createdResidente = freshResidentes.find(
          (r) => Number(r.id_usuario_fk) === Number(newUserId)
        );
        const newResidenteId = createdResidente?.id_residente;
        console.log('Nuevo residente creado, id_residente:', newResidenteId, 'id_usuario_fk:', newUserId);

        // 6) Create pago record
        if (newResidenteId) {
          try {
            const pagoData: any = {
              monto: formData.estadoPago === 'pagado' ? 0 : (formData.montoPago ? Number(formData.montoPago) : 0),
              estado: formData.estadoPago || 'pendiente',
              estatus: formData.estadoPago || 'pendiente',
              id_residente_fk: newResidenteId,
            };
            if (formData.fechaInicio) pagoData.fecha_ultimopago = formData.fechaInicio;
            if (formData.fechaProximoPago) pagoData.fecha_vencimiento = formData.fechaProximoPago;
            if (pagoData.fecha_ultimopago) pagoData.fecha_ultimopago = new Date(pagoData.fecha_ultimopago).toISOString();
            if (pagoData.fecha_vencimiento) pagoData.fecha_vencimiento = new Date(pagoData.fecha_vencimiento).toISOString();
            console.log('[CREATE] Creando pago con datos:', JSON.stringify(pagoData));
            await agregarPago(pagoData);
          } catch (pagoErr: any) {
            console.error('[CREATE] Error creando pago:', pagoErr?.response?.data || pagoErr);
            // Don't block — resident was saved successfully
          }
        } else {
          console.warn('[CREATE] No se encontró id_residente después de crear. userId:', newUserId);
        }

        // 7) Create parking spot (cajón de estacionamiento)
        if (finalDeptoId) {
          try {
            await agregarCajon({
              estado: 'disponible',
              id_departamento_fk: finalDeptoId,
            });
            console.log('[CREATE] Cajón creado para depto:', finalDeptoId);
          } catch (cajonErr: any) {
            console.error('[CREATE] Error creando cajón:', cajonErr?.response?.data || cajonErr);
          }
        }
      }
      // Always refresh pagos after save
      await fetchPagos();
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
      const pagoExistente = pagos.find((p) => Number(p.id_residente_fk) === Number(residente.id_residente));
      setFormData({
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        email: residente.usuario?.correo || '',
        password: '',
        telefono: residente.telefono || '',
        id_edificio: residente.id_edificio_fk?.toString() || '',
        id_departamento: residente.id_departamento_fk?.toString() || '',
        matricula: residente.matriculas?.[0]?.matricula || '',
        nuevoEdificio: '',
        nuevoDireccion: '',
        nuevoDepartamento: '',
        estadoPago: pagoExistente?.estatus || pagoExistente?.estado || 'pagado',
        montoPago: pagoExistente?.monto != null ? String(pagoExistente.monto) : '',
        fechaInicio: pagoExistente?.fecha_ultimopago ? pagoExistente.fecha_ultimopago.split('T')[0] : '',
        fechaProximoPago: pagoExistente?.fecha_vencimiento ? pagoExistente.fecha_vencimiento.split('T')[0] : '',
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
        estadoPago: 'pagado',
        montoPago: '',
        fechaInicio: '',
        fechaProximoPago: '',
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
    <div className="min-h-screen bg-white px-4 sm:px-6 py-6">
      {/* Contenedor principal SIN zoom visual */}
      <div className="mx-auto w-full max-w-[1440px]">

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
            Directorio de residentes
          </h1>
          <p className="mt-2 text-base sm:text-lg md:text-[22px] font-semibold text-slate-700">
            Información sobre los residentes
          </p>
        </div>

        {/* Barra acciones */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-[540px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-7 sm:w-7 text-[#1a1a1a]" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[46px] sm:h-[54px] w-full rounded-2xl border-[3px] border-black bg-white pl-14 pr-4 text-base sm:text-lg md:text-[18px] text-[#1d1d1d] placeholder:text-[#1d1d1d] outline-none focus:border-[#5f6ec9]"
              />
            </div>

            <button
              type="button"
              className="h-[46px] w-[48px] sm:h-[54px] sm:w-[58px] rounded-2xl bg-[#5f6ec9] text-white flex items-center justify-center hover:brightness-110 transition"
            >
              <Search className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="h-[46px] sm:h-[54px] rounded-2xl bg-[#5f6ec9] text-white px-4 sm:px-5 inline-flex items-center gap-2 text-sm sm:text-lg md:text-[18px] font-medium hover:brightness-110 transition"
            >
              <Filter className="h-5 w-5 sm:h-7 sm:w-7" />
              Filtrar
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="h-[46px] sm:h-[54px] rounded-2xl bg-[#5f6ec9] text-white px-4 sm:px-6 inline-flex items-center gap-2 text-sm sm:text-lg md:text-[18px] font-medium hover:brightness-110 transition"
          >
            <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
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

        {/* Vista móvil: tarjetas */}
        <div className="md:hidden space-y-3">
          {filteredResidentes.length === 0 ? (
            <div className="rounded-2xl border border-[#8b8b8b] bg-white px-6 py-10 text-center text-slate-600">
              No hay residentes para mostrar
            </div>
          ) : (
            filteredResidentes.map((residente) => {
              const estadoPago = getEstadoPago(residente.id_residente);
              const pago = getPagoResidente(residente.id_residente);
              return (
                <div key={residente.id_residente} className="rounded-2xl border border-[#8b8b8b] bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#2a2a2a] text-base truncate">{residente.nombre}</p>
                      <p className="text-sm text-slate-500 truncate">{residente.usuario?.correo || '-'}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-2xl px-3 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${estadoPago === 'pagado'
                        ? 'bg-[#8BC46A] text-white'
                        : estadoPago === 'sin_info'
                          ? 'bg-gray-400 text-white'
                          : 'bg-[#ff5757] text-white'
                        }`}
                    >
                      {estadoPago === 'pagado' ? 'Pagado' : estadoPago === 'sin_info' ? 'Sin info' : 'Pago Vencido'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><span className="font-semibold text-slate-600">Edificio:</span> {residente.edificio?.num_edificio || '-'}</p>
                    <p><span className="font-semibold text-slate-600">Depto:</span> {residente.departamento?.num_departamento || residente.departamento?.id_departamento || '-'}</p>
                    <p><span className="font-semibold text-slate-600">Tel:</span> {residente.telefono || '-'}</p>
                    <p><span className="font-semibold text-slate-600">Matrícula:</span> {residente.matriculas?.map(m => m.matricula).join(', ') || '-'}</p>
                    <p><span className="font-semibold text-slate-600">Monto:</span> {pago ? `$${Number(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-'}</p>
                    <p className="col-span-2"><span className="font-semibold text-slate-600">Próx. pago:</span> {pago?.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => openModal(residente)}
                      className="p-2 rounded-lg text-[#5f6ec9] hover:bg-[#e9ecff] transition"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(residente.id_residente)}
                      className="p-2 rounded-lg text-[#ff5757] hover:bg-[#ffeaea] transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista desktop: tabla */}
        <div className="hidden md:block rounded-2xl border border-[#8b8b8b] overflow-hidden bg-white">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#5f6ec9] text-white">
                  <th className="w-[13%] text-left font-medium text-sm lg:text-base px-3 lg:px-4 py-4">Nombre</th>
                  <th className="w-[7%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Edificio</th>
                  <th className="w-[7%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Depto</th>
                  <th className="w-[15%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Email</th>
                  <th className="w-[10%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Teléfono</th>
                  <th className="w-[10%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Matrícula</th>
                  <th className="w-[8%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Monto</th>
                  <th className="w-[10%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Próx. pago</th>
                  <th className="w-[10%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Estatus</th>
                  <th className="w-[10%] text-left font-medium text-sm lg:text-base px-2 lg:px-3 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredResidentes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-600 text-lg">
                      No hay residentes para mostrar
                    </td>
                  </tr>
                ) : (
                  filteredResidentes.map((residente) => {
                    const estadoPago = getEstadoPago(residente.id_residente);
                    const pago = getPagoResidente(residente.id_residente);

                    return (
                      <tr key={residente.id_residente} className="bg-white">
                        <td className="px-3 lg:px-4 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a] truncate">
                          {residente.nombre}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a]">
                          {residente.edificio?.num_edificio || '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a]">
                          {residente.departamento?.num_departamento || residente.departamento?.id_departamento || '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a] truncate">
                          {residente.usuario?.correo || '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a]">
                          {residente.telefono || '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a] truncate font-mono">
                          {residente.matriculas?.map(m => m.matricula).join(', ') || '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a]">
                          {pago ? `$${Number(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2] text-sm lg:text-[15px] text-[#2a2a2a]">
                          {pago?.fecha_vencimiento
                            ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX')
                            : '-'}
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2]">
                          <span
                            className={`inline-flex items-center rounded-2xl px-3 py-1 text-xs lg:text-sm font-semibold whitespace-nowrap ${estadoPago === 'pagado'
                              ? 'bg-[#8BC46A] text-white'
                              : estadoPago === 'sin_info'
                                ? 'bg-gray-400 text-white'
                                : 'bg-[#ff5757] text-white'
                              }`}
                          >
                            {estadoPago === 'pagado' ? 'Pagado' : estadoPago === 'sin_info' ? 'Sin info' : 'Vencido'}
                          </span>
                        </td>
                        <td className="px-2 lg:px-3 py-4 border-t border-[#a2a2a2]">
                          <div className="flex items-center gap-1">
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
                              <Trash2 className="h-5 w-5" />
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
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-16 w-16 sm:h-[92px] sm:w-[92px] rounded-full bg-[#5f6ec9] text-white shadow-xl inline-flex items-center justify-center hover:brightness-110 transition"
          title="Nuevo Residente"
        >
          <Plus className="h-8 w-8 sm:h-12 sm:w-12" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
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

            <form onSubmit={handleSubmit} autoComplete="off" className="p-5 space-y-4">

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
                autoComplete="new-email"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (e.target.value !== val) {
                          setError('El número de edificio solo puede contener dígitos');
                        }
                        setFormData({ ...formData, nuevoEdificio: val });
                      }}
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
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (e.target.value !== val) {
                        setError('El número de departamento solo puede contener dígitos');
                      }
                      setFormData({ ...formData, nuevoDepartamento: val });
                    }}
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
                      <option key={d.id_departamento} value={d.id_departamento}>Depto #{d.num_departamento || d.id_departamento}</option>
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
                placeholder="Matrícula (opcional)"
                className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
              />

              {!editingResidente && (
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña (opcional)"
                  autoComplete="new-password"
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                />
              )}

              {/* ── Payment fields ── */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="text-sm font-semibold text-slate-700">Información de pago</label>

                <select
                  value={formData.estadoPago}
                  onChange={(e) => {
                    const newEstado = e.target.value;
                    setFormData({
                      ...formData,
                      estadoPago: newEstado,
                      montoPago: newEstado === 'pagado' ? '0' : formData.montoPago,
                    });
                  }}
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                >
                  <option value="pagado">Pagado</option>
                  <option value="vencido">Pago Vencido</option>
                </select>

                <input
                  type="number"
                  value={formData.estadoPago === 'pagado' ? '0' : formData.montoPago}
                  onChange={(e) => setFormData({ ...formData, montoPago: e.target.value })}
                  placeholder="Monto de deuda ($)"
                  min="0"
                  step="0.01"
                  disabled={formData.estadoPago === 'pagado'}
                  className={`w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9] ${formData.estadoPago === 'pagado' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                />

                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Fecha de inicio / último pago</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Fecha de próximo pago</label>
                  <input
                    type="date"
                    value={formData.fechaProximoPago}
                    onChange={(e) => setFormData({ ...formData, fechaProximoPago: e.target.value })}
                    className="w-full h-11 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-[#5f6ec9]"
                  />
                </div>
              </div>

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

      {/* Floating error toast */}
      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-red-400 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-2xl text-sm sm:text-lg font-semibold pointer-events-auto max-w-[90vw] sm:max-w-md text-center">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}