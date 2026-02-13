'use client';

import { useMemo, useState } from 'react';

interface EspacioEstacionamiento {
  id: string;
  codigo: string;
  edificio: string;
  numero: string;
  ocupado: boolean;
  residenteId?: string;
  residenteNombre?: string;
}

const generarEspacios = (): EspacioEstacionamiento[] => {
  const espacios: EspacioEstacionamiento[] = [];

  ['E1', 'E2', 'E3'].forEach((edificio) => {
    for (let i = 1; i <= 18; i++) {
      const numero = i.toString().padStart(2, '0');
      espacios.push({
        id: `${edificio}-${numero}`,
        codigo: `${edificio} ${numero}`,
        edificio,
        numero,
        ocupado: Math.random() > 0.5,
      });
    }
  });

  return espacios;
};

export default function EstacionamientoPage() {
  const [espacios] = useState<EspacioEstacionamiento[]>(generarEspacios());

  // En la captura solo se ve un edificio (E1) con 18 lugares (9 + 9)
  const espaciosE1 = useMemo(
    () => espacios.filter((e) => e.edificio === 'E1'),
    [espacios]
  );

  const izquierda = espaciosE1.slice(0, 9);
  const derecha = espaciosE1.slice(9, 18);

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
          {/* Bloque izquierdo (3x3) */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {izquierda.map((espacio) => (
              <div
                key={espacio.id}
                className={[
                  'flex h-44 w-40 items-center justify-center rounded-2xl',
                  'select-none font-extrabold tracking-wide',
                  'transition hover:opacity-90',
                  espacio.ocupado
                    ? 'bg-[#E4645C] text-white'
                    : 'bg-[#9BC873] text-black',
                ].join(' ')}
              >
                <span className="text-4xl">{espacio.codigo}</span>
              </div>
            ))}
          </div>

          {/* Bloque derecho (3x3) */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {derecha.map((espacio) => (
              <div
                key={espacio.id}
                className={[
                  'flex h-44 w-40 items-center justify-center rounded-2xl',
                  'select-none font-extrabold tracking-wide',
                  'transition hover:opacity-90',
                  espacio.ocupado
                    ? 'bg-[#E4645C] text-white'
                    : 'bg-[#9BC873] text-black',
                ].join(' ')}
              >
                <span className="text-4xl">{espacio.codigo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}