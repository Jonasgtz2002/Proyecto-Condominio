'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Users, Shield, DollarSign, Home } from 'lucide-react';

export default function AdminDashboard() {
  const {
    residentes, vigilantes, visitantesActivos, accesos, pagosVencidos,
    fetchResidentes, fetchVigilantes, fetchVisitantesActivos, fetchAccesos, fetchPagosVencidos,
  } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchResidentes(),
          fetchVigilantes(),
          fetchVisitantesActivos(),
          fetchAccesos(),
          fetchPagosVencidos(),
        ]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const stats = [
    {
      title: 'Visitantes Activos',
      value: visitantesActivos.length,
      icon: <Home className="w-8 h-8" />,
      bgColor: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Residentes',
      value: residentes.length,
      icon: <Users className="w-8 h-8" />,
      bgColor: 'from-green-500 to-green-600',
    },
    {
      title: 'Vigilantes Activos',
      value: vigilantes.length,
      icon: <Shield className="w-8 h-8" />,
      bgColor: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pagos Vencidos',
      value: pagosVencidos.length,
      icon: <DollarSign className="w-8 h-8" />,
      bgColor: 'from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
          Panel de administración
        </h1>
        <p className="mt-1 text-base sm:text-lg md:text-[20px] font-semibold text-gray-400">
          Gestión de la unidad habitacional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-6 shadow-lg border border-white/20`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="text-white/80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {accesos.slice(-5).reverse().map((acceso) => (
            <div
              key={acceso.id_accesos}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">
                    {acceso.visitante
                      ? acceso.visitante.nombre
                      : (acceso.matricula_fk || 'Desconocido')}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Matrícula: {acceso.matricula_fk || ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    !acceso.hora_salida
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {!acceso.hora_salida ? 'Entrada' : 'Salida'}
                  </span>
                  <p className="text-slate-400 text-sm mt-1">
                    {acceso.hora_entrada || (acceso.createdAt ? new Date(acceso.createdAt).toLocaleString('es-MX') : '')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {accesos.length === 0 && (
            <p className="text-slate-400 text-center py-4">No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
}
