'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function PagosPage() {
  const { pagos, fetchPagos } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try { await fetchPagos(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const estadoUI = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return { label: 'Pagado', dot: 'bg-[#86B95B]' };
      default:
        return { label: 'Pago Vencido', dot: 'bg-[#E25B52]' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-6 sm:py-8">
      {/* Top bar */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
          Panel de administración
        </h1>
        <p className="mt-1 text-base sm:text-lg md:text-[20px] font-semibold text-gray-400">
          Gestión de la unidad habitacional
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl md:text-[28px] leading-tight font-bold text-black">
          Estatus de pagos
        </h2>
      </div>

      {/* Tabla */}
      <div className="mt-8 sm:mt-14 flex justify-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-[#CED8FF]">
                  <th className="w-[28%] px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-lg font-extrabold text-gray-900">
                    Residente
                  </th>
                  <th className="w-[22%] px-3 sm:px-6 py-3 sm:py-5 text-left text-sm sm:text-lg font-extrabold text-gray-900">
                    Estado
                  </th>
                  <th className="w-[16%] px-3 sm:px-6 py-3 sm:py-5 text-center text-sm sm:text-lg font-extrabold text-gray-900">
                    Deuda total
                  </th>
                  <th className="w-[16%] px-3 sm:px-6 py-3 sm:py-5 text-center text-sm sm:text-lg font-extrabold text-gray-900">
                    Fecha límite
                  </th>
                  <th className="w-[16%] px-3 sm:px-6 py-3 sm:py-5 text-center text-sm sm:text-lg font-extrabold text-gray-900">
                    Último pago
                  </th>
                </tr>
              </thead>

              <tbody>
                {pagos.map((pago) => {
                  const ui = estadoUI(pago.estatus || pago.estado || '');

                  return (
                    <tr
                      key={pago.id_pago}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      {/* Residente */}
                      <td className="px-6 py-5 text-gray-900">
                        {pago.residente
                          ? pago.residente.nombre
                          : 'Sin residente'}
                      </td>

                      {/* Estado (dot + label) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full ${ui.dot}`} />
                          <span className="text-gray-900">{ui.label}</span>
                        </div>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-5 text-center font-semibold text-gray-900">
                        ${Number(pago.monto || 0).toLocaleString('es-MX')}
                      </td>

                      {/* Fecha límite */}
                      <td className="px-6 py-5 text-center text-gray-900">
                        {pago.fecha_vencimiento
                          ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX')
                          : '--/--/----'}
                      </td>

                      {/* Último pago */}
                      <td className="px-6 py-5 text-center text-gray-900">
                        {pago.fecha_ultimopago
                          ? new Date(pago.fecha_ultimopago).toLocaleDateString('es-MX')
                          : '-'}
                      </td>
                    </tr>
                  );
                })}

                {pagos.length === 0 && (
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No hay registros de pagos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}