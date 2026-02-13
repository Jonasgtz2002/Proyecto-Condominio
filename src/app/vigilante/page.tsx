'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Car,
  Bike,
  Building2,
  UserRound,
} from 'lucide-react';

type TipoIngreso = 'delivery' | 'transporte' | 'otros' | 'visitante';

export default function VigilantePage() {
  const { buscarPorMatricula, fetchMatriculas, accesosHoy, fetchAccesosHoy, registrarAcceso, session } = useStore();

  const [matricula, setMatricula] = useState('');
  const [resultado, setResultado] = useState<
    'loading' | 'found' | 'not-found' | 'granted' | 'denied' | null
  >(null);
  const [residenteEncontrado, setResidenteEncontrado] = useState<any>(null);
  const [matriculaEncontrada, setMatriculaEncontrada] = useState<any>(null);

  const [tipoActivo, setTipoActivo] = useState<TipoIngreso>('delivery');

  useEffect(() => {
    fetchMatriculas();
    fetchAccesosHoy();
  }, []);

  const registrosFiltrados = useMemo(
    () => accesosHoy.filter((a) => {
      // Map acceso types to TipoIngreso categories
      if (tipoActivo === 'visitante') return a.visitante != null;
      return false; // Other types not mapped from API accesos
    }),
    [accesosHoy, tipoActivo]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) return;

    setResultado('loading');

    setTimeout(() => {
      const found = buscarPorMatricula(matricula.trim().toUpperCase());
      if (found) {
        const residente = found.residente;
        setResidenteEncontrado(residente);
        setMatriculaEncontrada(found);
        setResultado('found');
      } else {
        setResidenteEncontrado(null);
        setMatriculaEncontrada(null);
        setResultado('not-found');
      }
    }, 350);
  };

  const handleGrantAccess = async () => {
    try {
      await registrarAcceso({
        matricula_fk: matriculaEncontrada?.matricula,
        id_vigilante_fk: session.user?.id_vigilante || session.user?.apiUserId,
      });
      setResultado('granted');
    } catch {
      setResultado('granted');
    }
  };
  const handleDenyAccess = () => setResultado('denied');

  const handleNewSearch = () => {
    setMatricula('');
    setResultado(null);
    setResidenteEncontrado(null);
    setMatriculaEncontrada(null);
  };

  const getEstadoPagoClasses = (estado?: string) => {
    switch (estado) {
      case 'pagado':
        return 'border-green-300 bg-green-50 text-green-700';
      case 'vencido':
        return 'border-red-300 bg-red-50 text-red-700';
      case 'adeudo':
        return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      default:
        return 'border-gray-300 bg-gray-100 text-gray-700';
    }
  };

  const getEstadoPagoTexto = (estado?: string) => {
    switch (estado) {
      case 'pagado':
        return 'Pagado';
      case 'vencido':
        return 'Vencido';
      case 'adeudo':
        return 'Con Adeudo';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] text-[#111]">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-5 space-y-6">
        {/* Header */}
        <section>
          <h1 className="font-extrabold tracking-tight text-[clamp(1.8rem,3vw,3rem)] leading-tight">
            Control de Acceso - Vigilancia
          </h1>
          <p className="mt-1 font-semibold text-[#626262] text-[clamp(1rem,1.8vw,1.9rem)]">
            Sistema de verificación de vehículos y registros
          </p>
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
                  className="w-full h-12 md:h-14 rounded-xl border-[3px] border-black bg-[#f3f3f3] px-4 text-[clamp(1rem,1.8vw,1.8rem)] placeholder:text-[#696969] outline-none"
                />
                <p className="mt-1 text-right text-[clamp(.95rem,1.6vw,1.8rem)] text-[#6e6e6e] leading-none">
                  {matricula.length}/10
                </p>
              </div>

              <button
                type="submit"
                className="h-12 md:h-14 px-5 md:px-6 rounded-xl bg-[#6272c8] hover:bg-[#5262b6] text-white text-[clamp(1rem,1.5vw,1.9rem)] font-medium inline-flex items-center justify-center gap-2 shadow-sm"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                Buscar
              </button>
            </div>
          </form>

          {/* Estados de búsqueda */}
          <div className="max-w-[900px]">
            {resultado === 'loading' && (
              <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base">
                Buscando matrícula...
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

            {resultado === 'found' && residenteEncontrado && (
              <div className="rounded-lg border border-gray-300 bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[15px] md:text-base">
                  <p>
                    <span className="font-semibold">Nombre:</span> {residenteEncontrado.nombre}
                  </p>
                  <p>
                    <span className="font-semibold">Edificio:</span> {residenteEncontrado.edificio?.num_edificio || matriculaEncontrada?.edificio?.num_edificio || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Departamento:</span>{' '}
                    {residenteEncontrado.departamento?.id_departamento || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Matrícula:</span> {matriculaEncontrada?.matricula}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleGrantAccess}
                    className="rounded-lg bg-green-600 hover:bg-green-700 text-white py-2.5 font-semibold"
                  >
                    Otorgar acceso
                  </button>
                  <button
                    onClick={handleDenyAccess}
                    className="rounded-lg bg-red-600 hover:bg-red-700 text-white py-2.5 font-semibold"
                  >
                    Denegar acceso
                  </button>
                </div>
              </div>
            )}

            {resultado === 'granted' && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="text-lg font-bold">Acceso otorgado</p>
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
          </div>
        </section>

        {/* Registro */}
        <section className="space-y-4">
          <div className="w-full rounded-xl bg-[#6272c8] py-2.5 px-4">
            <h3 className="text-white font-bold text-[clamp(1.1rem,2vw,2rem)]">
              Registro Especial de Ingresos
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { key: 'delivery', label: 'Delivery', icon: Bike },
              { key: 'transporte', label: 'Transporte', icon: Car },
              { key: 'otros', label: 'Otros', icon: Building2 },
              { key: 'visitante', label: 'Visitante', icon: UserRound },
            ].map(({ key, label, icon: Icon }) => {
              const active = tipoActivo === key;
              return (
                <button
                  key={key}
                  onClick={() => setTipoActivo(key as TipoIngreso)}
                  className={`h-12 rounded-xl border-[3px] text-[clamp(.95rem,1.2vw,1.45rem)] font-bold inline-flex items-center justify-center gap-2 transition
                    ${
                      active
                        ? 'border-[#6272c8] bg-white text-[#2f3d8f]'
                        : 'border-[#a0a0a0] bg-[#efefef] text-[#111]'
                    }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {['Visitante', 'Hora', 'Residente', 'Edificio', 'Tipo'].map((h) => (
                    <th
                      key={h}
                      className="border-[3px] border-[#9a9a9a] bg-[#f2f2f2] px-3 py-2 text-[clamp(.9rem,1.2vw,1.8rem)] font-extrabold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accesosHoy.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-[3px] border-[#9a9a9a] bg-white px-4 py-4 text-center text-sm md:text-base text-gray-600"
                    >
                      Sin registros de acceso hoy
                    </td>
                  </tr>
                ) : (
                  accesosHoy.map((a) => (
                    <tr key={a.id_accesos}>
                      <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">{a.visitante?.nombre || 'N/A'}</td>
                      <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">{a.hora_entrada || (a.createdAt ? new Date(a.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '')}</td>
                      <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">{a.matriculaRel?.residente?.nombre || 'N/A'}</td>
                      <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">{a.matriculaRel?.residente?.edificio?.num_edificio || 'N/A'}</td>
                      <td className="border-[3px] border-[#9a9a9a] bg-white px-3 py-2 text-sm md:text-base">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${a.hora_salida ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {a.hora_salida ? 'Salida' : 'Entrada'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}