'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ApiPago, ApiAnuncio } from '@/types';
import { ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ResidentePage() {
  const { session, anuncios, fetchAnuncios, fetchPagosPorResidente } = useStore();
  const user = session.user;

  const [pagosResidente, setPagosResidente] = useState<ApiPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);

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

  // Reset carousel index if anuncios change
  useEffect(() => {
    if (carouselIdx >= anuncios.length) setCarouselIdx(0);
  }, [anuncios.length, carouselIdx]);

  const pagosPendientes = pagosResidente.filter(p => {
    const status = p.estatus || p.estado;
    return status === 'pendiente' || status === 'vencido';
  });

  const deudaTotal = pagosPendientes.reduce((sum, p) => sum + (p.monto || 0), 0);
  const ultimoPago = pagosResidente.find(p => (p.estatus || p.estado) === 'pagado');

  const currentAnuncio: ApiAnuncio | null = anuncios.length > 0 ? anuncios[carouselIdx] : null;

  const prevAnuncio = () => setCarouselIdx((i) => (i <= 0 ? anuncios.length - 1 : i - 1));
  const nextAnuncio = () => setCarouselIdx((i) => (i >= anuncios.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-black">Panel de Residente</h1>
          <p className="text-xl text-gray-500 font-semibold mt-1">Bienvenido, {user?.nombre || 'Residente'}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">

        {/* Secci\u00f3n: Informaci\u00f3n de registro */}
        <section>
          <div className="bg-[#636eb4] text-white text-center py-2 rounded-t-lg font-bold text-lg border-2 border-[#636eb4]">
            Informaci\u00f3n de registro
          </div>
          <div className="grid grid-cols-3">
            <div className="border-2 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400"># de edificio</div>
              <div className="py-2">{user?.edificio?.num_edificio || user?.num_edificio || '-'}</div>
            </div>
            <div className="border-2 border-l-0 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400">Departamento</div>
              <div className="py-2">{user?.departamento?.id_departamento || user?.id_departamento || '-'}</div>
            </div>
            <div className="border-2 border-l-0 border-gray-400 text-center">
              <div className="font-bold py-2 border-b-2 border-gray-400"># de teléfono</div>
              <div className="py-2">{user?.telefono || '-'}</div>
            </div>
          </div>
        </section>

        {/* Secci\u00f3n: Estado de pagos */}
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
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">Pr\u00f3ximo vencimiento</div>
              <div className="py-2 text-center">
                {pagosPendientes.length > 0 && pagosPendientes[0].fecha_vencimiento
                  ? new Date(pagosPendientes[0].fecha_vencimiento).toLocaleDateString('es-MX')
                  : '-'}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-bold py-2 text-center border-r-2 border-gray-400">\u00daltimo Pago</div>
              <div className="py-2 text-center">
                {ultimoPago?.fecha_ultimopago
                  ? new Date(ultimoPago.fecha_ultimopago).toLocaleDateString('es-MX')
                  : '-'}
              </div>
            </div>
          </div>
        </section>

        {/* Secci\u00f3n: Anuncios - Carrusel */}
        <section>
          <div className="bg-[#636eb4] text-white text-center py-2 rounded-t-lg font-bold text-lg border-2 border-[#636eb4]">
            Anuncios
          </div>
          <div className="border-x-2 border-b-2 border-gray-400 relative">
            {anuncios.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-semibold text-lg">
                No hay anuncios por el momento
              </div>
            ) : (
              <>
                {/* Flechas de navegaci\u00f3n */}
                {anuncios.length > 1 && (
                  <>
                    <button
                      onClick={prevAnuncio}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#636eb4] hover:bg-[#505dab] text-white rounded-full p-2 shadow-lg transition"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextAnuncio}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#636eb4] hover:bg-[#505dab] text-white rounded-full p-2 shadow-lg transition"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Contenido del anuncio actual */}
                {currentAnuncio && (
                  <div className="px-14 py-6">
                    <h3 className="text-2xl font-extrabold text-center text-gray-900">
                      {currentAnuncio.titulo}
                    </h3>
                    <p className="text-center text-sm text-gray-500 font-semibold mt-1">
                      {currentAnuncio.fecha_publicacion
                        ? new Date(currentAnuncio.fecha_publicacion).toLocaleDateString('es-MX', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })
                        : ''}
                    </p>
                    <p className="mt-6 text-center text-base text-gray-800 leading-relaxed whitespace-pre-line">
                      {currentAnuncio.mensaje}
                    </p>

                    {/* Archivo adjunto */}
                    {currentAnuncio.ruta_archivo && (
                      <div className="mt-6 flex justify-center">
                        <a
                          href={`${API_URL}/${currentAnuncio.ruta_archivo.replace(/^\/+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#636eb4] px-6 py-2.5 font-semibold text-white hover:opacity-90 transition"
                        >
                          <Paperclip className="h-4 w-4" />
                          {currentAnuncio.ruta_archivo.split('/').pop()}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Indicadores (dots) */}
                {anuncios.length > 1 && (
                  <div className="flex justify-center gap-2 pb-4">
                    {anuncios.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIdx(idx)}
                        className={`h-3 w-3 rounded-full transition-all ${
                          idx === carouselIdx
                            ? 'bg-[#636eb4] scale-110'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}