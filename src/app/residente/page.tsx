'use client';

import { useStore } from '@/store/useStore';
import { Home, Phone, DollarSign, Calendar, Megaphone } from 'lucide-react';

export default function ResidentePage() {
  const { session, anuncios, estadosPago } = useStore();
  const user = session.user;

  const estadoPago = estadosPago.find(e => e.residenteId === user?.id);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'vencido':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'adeudo':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'Al Corriente';
      case 'vencido':
        return 'Pago Vencido';
      case 'adeudo':
        return 'Adeudo';
      default:
        return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Residente</h1>
        <p className="text-slate-300">Bienvenido, {user?.nombre}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de Registro */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Información de registro
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Número de edificio</p>
                <p className="text-white font-semibold text-2xl">{user?.edificio}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Departamento</p>
                <p className="text-white font-semibold text-2xl">{user?.departamento}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Número telefónico
              </p>
              <p className="text-white font-semibold text-lg">{user?.telefono}</p>
            </div>
          </div>
        </div>

        {/* Estado de Pagos */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Estado de pagos
          </h2>
          {estadoPago ? (
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Estado</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getEstadoColor(estadoPago.estado)}`}>
                  {getEstadoLabel(estadoPago.estado)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Deuda Total</p>
                  <p className="text-white font-bold text-2xl">${estadoPago.deudaTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Próximo vencimiento</p>
                  <p className="text-white font-semibold">{estadoPago.proximoVencimiento.toLocaleDateString('es-MX')}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Último Pago</p>
                <p className="text-white font-semibold">
                  {estadoPago.ultimoPago ? estadoPago.ultimoPago.toLocaleDateString('es-MX') : 'Sin pagos registrados'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-300">No hay información de pagos disponible</p>
          )}
        </div>
      </div>

      {/* Anuncios */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Anuncios
        </h2>
        <div className="space-y-4">
          {anuncios.slice(-3).reverse().map((anuncio) => (
            <div key={anuncio.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold">{anuncio.titulo}</h3>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {anuncio.fecha.toLocaleDateString('es-MX')}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{anuncio.cuerpo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
