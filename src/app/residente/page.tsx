'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ApiPago } from '@/types';

export default function ResidentePage() {
  const { session, anuncios, fetchAnuncios, fetchPagosPorResidente, logout } = useStore();
  const user = session.user;

  const [pagosResidente, setPagosResidente] = useState<ApiPago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAnuncios();
        const residenteId = user?.id_residente || user?.id;
        if (residenteId) {
          const pagos = await fetchPagosPorResidente(residenteId);
          setPagosResidente(pagos || []);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, fetchAnuncios, fetchPagosPorResidente]);

  const pagosPendientes = pagosResidente.filter(p => {
    const status = p.estatus || p.estado;
    return status === 'pendiente' || status === 'vencido';
  });
  
  const deudaTotal = pagosPendientes.reduce((sum, p) => sum + (p.monto || 0), 0);
  const ultimoPago = pagosResidente.find(p => (p.estatus || p.estado) === 'pagado');

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-black">Panel de Residente</h1>
          <p className="text-xl text-gray-500 font-semibold mt-1">Bienvenido</p>
        </div>
        <button 
          onClick={logout}
          className="px-8 py-2 border-2 border-red-400 text-black font-bold rounded-2xl hover:bg-red-50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Sección: Información de registro */}
        <section>
          <div className="bg-[#636eb4] text-white text-center py-2 rounded-t-lg font-bold text-lg border-2 border-[#636eb4]">
            Información de registro
          </div>
          <div className="grid grid-cols-3">
            <div className="border-2 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400">Número de edificio</div>
              <div className="py-2">{user?.edificio?.num_edificio || user?.num_edificio || '3'}</div>
            </div>
            <div className="border-2 border-l-0 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400">Departamento</div>
              <div className="py-2">{user?.departamento?.id_departamento || user?.id_departamento || '12'}</div>
            </div>
            <div className="border-2 border-l-0 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400">Número telefónico</div>
              <div className="py-2">{user?.telefono || '7351236996'}</div>
            </div>
          </div>
        </section>

        {/* Sección: Estado de pagos */}
        <section className="max-w-2xl mx-auto">
          <div className="bg-[#636eb4] text-white text-center py-2 rounded-t-lg font-bold text-lg border-2 border-[#636eb4]">
            Estado de pagos
          </div>
          <div className="border-x-2 border-b-2 border-gray-400">
            <div className="grid grid-cols-2 border-b-2 border-gray-400">
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">Estado</div>
              <div className={`py-2 text-center font-semibold ${deudaTotal === 0 ? 'bg-[#a3c981]' : 'bg-red-200'}`}>
                {deudaTotal === 0 ? 'Al Corriente' : 'Pendiente'}
              </div>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-gray-400">
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">Deuda Total</div>
              <div className="py-2 text-center">${deudaTotal}</div>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-gray-400">
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">Próximo vencimiento</div>
              <div className="py-2 text-center">24/03/2026</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">Último Pago</div>
              <div className="py-2 text-center">
                {ultimoPago?.fecha_pago ? new Date(ultimoPago.fecha_pago).toLocaleDateString('es-MX') : '29/01/2026'}
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Anuncios */}
        <section>
          <div className="bg-[#636eb4] text-white text-center py-2 rounded-t-lg font-bold text-lg border-2 border-[#636eb4]">
            Anuncios
          </div>
          <div className="border-x-2 border-b-2 border-gray-400">
            {anuncios.length > 0 ? (
              anuncios.slice(-1).map((anuncio) => (
                <div key={anuncio.id_anuncio}>
                  <div className="font-bold py-2 text-center border-b-2 border-gray-400">{anuncio.titulo}</div>
                  <div className="py-2 text-center border-b-2 border-gray-400 font-semibold">
                    {anuncio.fecha_publicacion ? new Date(anuncio.fecha_publicacion).toLocaleDateString('es-MX') : 'Fecha'}
                  </div>
                  <div className="py-12 px-6 text-center font-bold italic">
                    {anuncio.mensaje}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="font-bold py-2 text-center border-b-2 border-gray-400">Título del anuncio</div>
                <div className="py-2 text-center border-b-2 border-gray-400">Fecha de publicación</div>
                <div className="py-12 text-center font-bold">Contenido descriptivo del comunicado</div>
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}