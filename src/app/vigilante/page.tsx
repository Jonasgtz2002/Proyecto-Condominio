'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { ApiMatricula } from '@/types';
import { vigilantesService } from '@/services/vigilantes.service';

export default function VigilantePage() {
  const {
    accesosHoy,
    fetchAccesosActivos,
    registrarAcceso,
    registrarSalidaAcceso,
    buscarMatriculaEnAPI,
    actualizarCajon,
    cajones,
    fetchCajones,
    session,
  } = useStore();

  const [matricula, setMatricula] = useState('');
  const [resultado, setResultado] = useState<
    'loading' | 'found' | 'not-found' | 'granted' | 'exit-registered' | 'denied' | 'error' | null
  >(null);
  const [matriculaData, setMatriculaData] = useState<ApiMatricula | null>(null);
  const [grantLoading, setGrantLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingAccesos, setLoadingAccesos] = useState(true);
  const [vigilanteId, setVigilanteId] = useState<number | null>(null);

  useEffect(() => {
    const resolveVigilanteId = async () => {
      const fromSession = session.user?.id_vigilante;
      if (fromSession) {
        setVigilanteId(Number(fromSession));
        return;
      }
      const userId = session.user?.apiUserId || session.user?.id || session.user?.id_usuario;
      if (userId) {
        try {
          const res = await vigilantesService.getByUsuario(userId);
          const profile = res.data;
          if (profile?.id_vigilante) {
            setVigilanteId(Number(profile.id_vigilante));
            return;
          }
        } catch (e) {
          console.warn('Could not fetch vigilante profile:', e);
        }
      }
    };

    resolveVigilanteId();
    Promise.all([fetchAccesosActivos(), fetchCajones()]).finally(() => setLoadingAccesos(false));
  }, []);

  // Determine if the searched matrícula is currently inside
  const accesoActivo = useMemo(() => {
    if (!matriculaData) return null;
    return accesosHoy.find(
      (a) => a.matricula_fk === matriculaData.matricula && !a.hora_salida
    ) || null;
  }, [accesosHoy, matriculaData]);

  const estaAdentro = !!accesoActivo;

  // Find the cajón linked to the resident's departamento
  const cajonResidente = useMemo(() => {
    const deptoId = matriculaData?.residente?.id_departamento_fk || matriculaData?.residente?.departamento?.id_departamento;
    if (!deptoId) return null;
    return cajones.find((c) => c.id_departamento_fk === deptoId) || null;
  }, [matriculaData, cajones]);

  // Determine button mode based on cajón estado
  const cajonDisponible = cajonResidente?.estado?.toLowerCase() === 'disponible';
  const cajonOcupado = cajonResidente?.estado?.toLowerCase() === 'ocupado';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = matricula.trim().toUpperCase();
    if (!val) return;

    setResultado('loading');
    setMatriculaData(null);
    setErrorMsg('');

    // Refresh active accesos so entry/exit status is up to date
    await fetchAccesosActivos();

    const found = await buscarMatriculaEnAPI(val);
    if (found) {
      setMatriculaData(found);
      setResultado('found');
    } else {
      setResultado('not-found');
    }
  };

  // Find cajón for the residente's departamento
  const findCajon = () => {
    const deptoId = matriculaData?.residente?.id_departamento_fk || matriculaData?.residente?.departamento?.id_departamento;
    if (!deptoId) return null;
    return cajones.find((c) => c.id_departamento_fk === deptoId) || null;
  };

  const handleGrantAccess = async () => {
    if (!matriculaData) return;
    setGrantLoading(true);
    setErrorMsg('');

    if (!vigilanteId) {
      setErrorMsg('No se pudo identificar al vigilante. Cierra sesión e inicia de nuevo.');
      setResultado('error');
      setGrantLoading(false);
      return;
    }

    try {
      await registrarAcceso({
        matricula_fk: matriculaData.matricula,
        id_vigilante_fk: vigilanteId,
      });

      // Update cajón to ocupado
      const cajon = findCajon();
      if (cajon) {
        try { await actualizarCajon(cajon.id_cajon, { estado: 'ocupado' }); } catch { }
      }

      setResultado('granted');
      await Promise.all([fetchAccesosActivos(), fetchCajones()]);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Error al registrar acceso';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setResultado('error');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    setGrantLoading(true);
    setErrorMsg('');

    try {
      // Register exit in accesos if there is an active record
      if (accesoActivo) {
        await registrarSalidaAcceso(accesoActivo.id_accesos);
      }

      // Update cajón to disponible
      const cajon = findCajon();
      if (cajon) {
        try { await actualizarCajon(cajon.id_cajon, { estado: 'disponible' }); } catch { }
      }

      setResultado('exit-registered');
      await Promise.all([fetchAccesosActivos(), fetchCajones()]);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Error al registrar salida';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setResultado('error');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleDenyAccess = () => setResultado('denied');

  const handleNewSearch = () => {
    setMatricula('');
    setResultado(null);
    setMatriculaData(null);
    setErrorMsg('');
  };

  const residente = matriculaData?.residente;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-5 space-y-6">
        {/* Encabezado */}
        <section>
          <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
            Panel de vigilancia
          </h1>
          <p className="mt-1 text-base sm:text-lg md:text-[20px] font-semibold text-gray-400">
            Gestión de la unidad habitacional
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl md:text-[28px] leading-tight font-bold text-black">
            Control de acceso
          </h2>
        </section>

        {/* Franja roja */}
        <div className="w-full bg-[#ec625b] rounded-md px-4 py-2">
          <p className="text-center text-white font-bold text-[clamp(.9rem,1.4vw,1.55rem)] leading-snug">
            Verifica la matrícula del vehículo y consulta el estado de pago del residente antes de
            otorgar acceso
          </p>
        </div>

        {/* Buscador */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-[clamp(1.6rem,2.7vw,2.7rem)] leading-tight">
            Verificación de Vehículos
          </h2>

          <form onSubmit={handleSearch} className="max-w-[900px]">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) =>
                    setMatricula(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10)
                    )
                  }
                  placeholder="Ingrese matrícula"
                  maxLength={10}
                  className="w-full h-12 md:h-14 rounded-xl border-[3px] border-black bg-white px-4 text-[clamp(1rem,1.8vw,1.8rem)] placeholder:text-[#696969] outline-none"
                />
                <p className="mt-1 text-right text-[clamp(.95rem,1.6vw,1.8rem)] text-[#6e6e6e] leading-none">
                  {matricula.length}/10
                </p>
              </div>

              <button
                type="submit"
                disabled={resultado === 'loading'}
                className="h-12 md:h-14 px-5 md:px-6 rounded-xl bg-[#6272c8] hover:bg-[#5262b6] text-white text-[clamp(1rem,1.5vw,1.9rem)] font-medium inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {resultado === 'loading' ? (
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                )}
                Buscar
              </button>
            </div>
          </form>

          {/* Estados de búsqueda */}
          <div className="max-w-[900px]">
            {resultado === 'loading' && (
              <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#6272c8]" />
                Buscando matrícula en el sistema...
              </div>
            )}

            {resultado === 'not-found' && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <p className="text-lg font-bold">Matrícula no registrada: {matricula}</p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="mt-3 rounded-lg bg-[#6272c8] hover:bg-[#5262b6] text-white px-4 py-2 font-semibold"
                >
                  Nueva búsqueda
                </button>
              </div>
            )}

            {resultado === 'found' && matriculaData && (
              <div className="rounded-lg border border-gray-300 bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[15px] md:text-base">
                  <p>
                    <span className="font-semibold">Residente:</span>{' '}
                    {residente?.nombre || 'Sin residente asociado'}
                  </p>
                  <p>
                    <span className="font-semibold">Edificio:</span>{' '}
                    {residente?.edificio?.num_edificio || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Departamento:</span>{' '}
                    {residente?.departamento?.id_departamento || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Matrícula:</span> {matriculaData.matricula}
                  </p>
                  {residente?.telefono && (
                    <p>
                      <span className="font-semibold">Teléfono:</span> {residente.telefono}
                    </p>
                  )}
                </div>

                {/* Cajón status indicator */}
                {cajonResidente ? (
                  <div className={`rounded-lg px-4 py-2 text-center font-bold text-lg ${cajonOcupado
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : cajonDisponible
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                    {cajonOcupado
                      ? `⚠ Cajón #${cajonResidente.id_cajon} — OCUPADO (vehículo dentro)`
                      : cajonDisponible
                        ? `Cajón #${cajonResidente.id_cajon} — DISPONIBLE`
                        : `Cajón #${cajonResidente.id_cajon} — ${cajonResidente.estado || 'Sin estado'}`}
                  </div>
                ) : (
                  <div className="rounded-lg px-4 py-2 text-center font-bold text-lg bg-gray-100 text-gray-600 border border-gray-300">
                    ⚠ No se encontró un cajón vinculado a este residente
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cajonResidente && cajonOcupado ? (
                    /* Cajón is occupied → show exit button */
                    <button
                      onClick={handleRegisterExit}
                      disabled={grantLoading}
                      className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2.5 font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2 sm:col-span-2"
                    >
                      {grantLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Registrando salida...</>
                      ) : (
                        <><LogOut className="w-5 h-5" /> Otorgar Salida</>
                      )}
                    </button>
                  ) : cajonResidente && cajonDisponible ? (
                    /* Cajón is available → show access button */
                    <>
                      <button
                        onClick={handleGrantAccess}
                        disabled={grantLoading}
                        className="rounded-lg bg-green-600 hover:bg-green-700 text-white py-2.5 font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {grantLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</>
                        ) : (
                          <><LogIn className="w-5 h-5" /> Otorgar Acceso</>
                        )}
                      </button>
                      <button
                        onClick={handleDenyAccess}
                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white py-2.5 font-semibold"
                      >
                        Denegar acceso
                      </button>
                    </>
                  ) : (
                    /* No cajón linked → cannot grant access */
                    <div className="sm:col-span-2 text-center text-gray-500 py-2">
                      No se puede otorgar acceso sin cajón vinculado
                    </div>
                  )}
                </div>
              </div>
            )}

            {resultado === 'granted' && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="text-lg font-bold">Acceso otorgado — entrada registrada</p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="mt-3 rounded-lg bg-[#6272c8] hover:bg-[#5262b6] text-white px-4 py-2 font-semibold"
                >
                  Nueva búsqueda
                </button>
              </div>
            )}

            {resultado === 'exit-registered' && (
              <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <LogOut className="w-6 h-6" />
                  <p className="text-lg font-bold">Salida registrada correctamente</p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="mt-3 rounded-lg bg-[#6272c8] hover:bg-[#5262b6] text-white px-4 py-2 font-semibold"
                >
                  Nueva búsqueda
                </button>
              </div>
            )}

            {resultado === 'denied' && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-6 h-6" />
                  <p className="text-lg font-bold">Acceso denegado</p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="mt-3 rounded-lg bg-[#6272c8] hover:bg-[#5262b6] text-white px-4 py-2 font-semibold"
                >
                  Nueva búsqueda
                </button>
              </div>
            )}

            {resultado === 'error' && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-lg font-bold">Error al registrar acceso</p>
                </div>
                <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
                <button
                  onClick={() => setResultado('found')}
                  className="mt-3 rounded-lg bg-[#6272c8] hover:bg-[#5262b6] text-white px-4 py-2 font-semibold"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Accesos activos (actualmente dentro) */}
        <section className="space-y-4">
          <div className="w-full rounded-xl bg-[#6272c8] py-2.5 px-4">
            <h3 className="text-white font-bold text-[clamp(1.1rem,2vw,2rem)]">
              Accesos Activos (dentro del condominio)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {['Matrícula', 'Residente / Visitante', 'Hora Entrada', 'Edificio', 'Estado'].map((h) => (
                    <th
                      key={h}
                      className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-[clamp(.9rem,1.2vw,1.8rem)] font-extrabold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingAccesos ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-[3px] border-[#9a9a9a] bg-white px-4 py-4 text-center text-sm md:text-base text-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cargando accesos...
                      </div>
                    </td>
                  </tr>
                ) : accesosHoy.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-[3px] border-[#9a9a9a] bg-white px-4 py-4 text-center text-sm md:text-base text-gray-600"
                    >
                      No hay accesos activos en este momento
                    </td>
                  </tr>
                ) : (
                  accesosHoy.map((a) => {
                    const mat = a.matricula || a.matriculaRel;
                    const persona = mat?.residente?.nombre || a.visitante?.nombre || 'N/A';
                    const edificio = mat?.residente?.edificio?.num_edificio || 'N/A';
                    const horaEntrada = a.hora_entrada
                      ? new Date(a.hora_entrada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      : 'N/A';

                    return (
                      <tr key={a.id_accesos}>
                        <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base font-mono">
                          {a.matricula_fk || 'N/A'}
                        </td>
                        <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">
                          {persona}
                        </td>
                        <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">
                          {horaEntrada}
                        </td>
                        <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">
                          {edificio}
                        </td>
                        <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                            Dentro
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}