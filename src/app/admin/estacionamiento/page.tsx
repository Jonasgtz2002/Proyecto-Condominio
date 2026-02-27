'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function EstacionamientoPage() {
  const { cajones, fetchCajones } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try { await fetchCajones(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const getLabel = (espacio: typeof cajones[number]) => {
    const edif = espacio.departamento?.edificio?.num_edificio || '';
    const depto = espacio.departamento?.num_departamento || espacio.departamento?.id_departamento || espacio.id_departamento_fk || '';
    if (edif || depto) return `Edif. ${edif} - Depto #${depto}`;
    return `Cajón ${espacio.id_cajon}`;
  };

  const isOcupado = (espacio: typeof cajones[number]) => {
    return espacio.estado === 'ocupado';
  };

  const half = Math.ceil(cajones.length / 2);
  const izquierda = cajones.slice(0, half);
  const derecha = cajones.slice(half);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando estacionamiento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-10 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            Panel de administrador
          </h1>

          <div className="mt-4 sm:mt-6 space-y-1">
            <p className="text-lg sm:text-2xl font-semibold text-gray-700">
              Gestión de la Unidad Habitacional
            </p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-700">
              Estacionamiento
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {cajones.length === 0 ? (
        <div className="mt-16 text-center text-lg text-gray-500">
          No hay cajones de estacionamiento registrados.
        </div>
      ) : (
        <div className="mt-8 sm:mt-16 flex justify-center">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 lg:gap-24">
            {/* Bloque izquierdo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-6">
              {izquierda.map((espacio) => (
                <div
                  key={espacio.id_cajon}
                  className={[
                    'flex h-32 w-28 sm:h-44 sm:w-40 flex-col items-center justify-center rounded-2xl px-2',
                    'select-none font-extrabold tracking-wide',
                    'transition hover:opacity-90',
                    isOcupado(espacio)
                      ? 'bg-[#E4645C] text-white'
                      : 'bg-[#9BC873] text-black',
                  ].join(' ')}
                >
                  <span className="text-xl sm:text-3xl">{espacio.id_cajon}</span>
                  <span className="mt-1 text-center text-[10px] sm:text-[11px] font-semibold leading-tight opacity-80">
                    {getLabel(espacio)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bloque derecho */}
            {derecha.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-6">
                {derecha.map((espacio) => (
                  <div
                    key={espacio.id_cajon}
                    className={[
                      'flex h-32 w-28 sm:h-44 sm:w-40 flex-col items-center justify-center rounded-2xl px-2',
                      'select-none font-extrabold tracking-wide',
                      'transition hover:opacity-90',
                      isOcupado(espacio)
                        ? 'bg-[#E4645C] text-white'
                        : 'bg-[#9BC873] text-black',
                    ].join(' ')}
                  >
                    <span className="text-xl sm:text-3xl">{espacio.id_cajon}</span>
                    <span className="mt-1 text-center text-[10px] sm:text-[11px] font-semibold leading-tight opacity-80">
                      {getLabel(espacio)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}