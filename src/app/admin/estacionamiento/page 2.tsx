'use client';

import { useEffect, useMemo, useState } from 'react';
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

  // Group cajones by edificio
  const edificios = useMemo(() => {
    const map = new Map<string, typeof cajones>();
    cajones.forEach((c) => {
      const key = c.departamento?.edificio?.num_edificio || `Depto ${c.id_departamento_fk || 'Sin asignar'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [cajones]);

  // Get first building cajones for display
  const firstEdificio = Array.from(edificios.keys())[0];
  const espaciosEdificio = firstEdificio ? edificios.get(firstEdificio) || [] : [];
  const half = Math.ceil(espaciosEdificio.length / 2);
  const izquierda = espaciosEdificio.slice(0, half);
  const derecha = espaciosEdificio.slice(half);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando estacionamiento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      {/* Top bar: título izquierda, botón derecha */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900">
            Panel de administrador
          </h1>

          <div className="mt-6 space-y-1">
            <p className="text-2xl font-semibold text-gray-700">
              Gestión de la Unidad Habitacional
            </p>
            <p className="text-2xl font-semibold text-gray-700">
              Estacionamiento
            </p>
          </div>
        </div>

        
      </div>

      {/* Grid centrado como la imagen */}
      <div className="mt-20 flex justify-center">
        <div className="flex gap-24">
          {/* Bloque izquierdo */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {izquierda.map((espacio) => (
              <div
                key={espacio.id_cajon}
                className={[
                  'flex h-44 w-40 items-center justify-center rounded-2xl',
                  'select-none font-extrabold tracking-wide',
                  'transition hover:opacity-90',
                  espacio.estado === 'ocupado'
                    ? 'bg-[#E4645C] text-white'
                    : 'bg-[#9BC873] text-black',
                ].join(' ')}
              >
                <span className="text-4xl">{espacio.id_cajon}</span>
              </div>
            ))}
          </div>

          {/* Bloque derecho */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {derecha.map((espacio) => (
              <div
                key={espacio.id_cajon}
                className={[
                  'flex h-44 w-40 items-center justify-center rounded-2xl',
                  'select-none font-extrabold tracking-wide',
                  'transition hover:opacity-90',
                  espacio.estado === 'ocupado'
                    ? 'bg-[#E4645C] text-white'
                    : 'bg-[#9BC873] text-black',
                ].join(' ')}
              >
                <span className="text-4xl">{espacio.id_cajon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}