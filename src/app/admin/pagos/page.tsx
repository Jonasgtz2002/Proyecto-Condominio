'use client';

import { useStore } from '@/store/useStore';

export default function PagosPage() {
  const { estadosPago } = useStore();

  const estadoUI = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return { label: 'Pagado', dot: 'bg-[#86B95B]' };
      case 'vencido':
        return { label: 'Pago Vencido', dot: 'bg-[#E25B52]' };
      case 'adeudo':
        return { label: 'Adeudo', dot: 'bg-[#F2C94C]' };
      default:
        return { label: estado, dot: 'bg-gray-400' };
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Panel de administrador
          </h1>

          <div className="mt-4 space-y-0.5">
            <p className="text-xl font-semibold text-gray-700">
              Gestión de la Unidad Habitacional
            </p>
            <p className="text-xl font-semibold text-gray-700">
              Estatus de pagos
            </p>
          </div>
        </div>

        
      </div>

      {/* Tabla */}
      <div className="mt-14 flex justify-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-[#CED8FF]">
                  <th className="w-[28%] px-6 py-5 text-left text-lg font-extrabold text-gray-900">
                    Residente
                  </th>
                  <th className="w-[22%] px-6 py-5 text-left text-lg font-extrabold text-gray-900">
                    Estado
                  </th>
                  <th className="w-[16%] px-6 py-5 text-center text-lg font-extrabold text-gray-900">
                    Deuda total
                  </th>
                  <th className="w-[18%] px-6 py-5 text-center text-lg font-extrabold text-gray-900">
                    Próximo vencimiento
                  </th>
                  <th className="w-[16%] px-6 py-5 text-center text-lg font-extrabold text-gray-900">
                    Último pago
                  </th>
                </tr>
              </thead>

              <tbody>
                {estadosPago.map((pago) => {
                  const ui = estadoUI(pago.estado);

                  return (
                    <tr
                      key={pago.residenteId}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      {/* Residente */}
                      <td className="px-6 py-5 text-gray-900">
                        {pago.residenteNombre || 'Nombre'}
                      </td>

                      {/* Estado (dot + label) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full ${ui.dot}`} />
                          <span className="text-gray-900">{ui.label}</span>
                        </div>
                      </td>

                      {/* Deuda */}
                      <td className="px-6 py-5 text-center font-semibold text-gray-900">
                        ${Number(pago.deudaTotal || 0).toLocaleString('es-MX')}
                      </td>

                      {/* Próximo vencimiento */}
                      <td className="px-6 py-5 text-center text-gray-900">
                        {pago.proximoVencimiento
                          ? new Date(pago.proximoVencimiento).toLocaleDateString('es-MX')
                          : '--/--/----'}
                      </td>

                      {/* Último pago */}
                      <td className="px-6 py-5 text-center text-gray-900">
                        {pago.ultimoPago
                          ? new Date(pago.ultimoPago).toLocaleDateString('es-MX')
                          : '--/--/----'}
                      </td>
                    </tr>
                  );
                })}

                {/* Opcional: si no hay data, que no se vea vacío */}
                {estadosPago.length === 0 && (
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