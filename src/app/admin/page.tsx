'use client';

import { useStore } from '@/store/useStore';
import { Users, Shield, DollarSign, Home } from 'lucide-react';

export default function AdminDashboard() {
  const { usuarios, estadosPago, registros, obtenerVisitantesActivos } = useStore();
  
  const visitantesActivos = obtenerVisitantesActivos();
  const totalResidentes = usuarios.filter((u) => u.rol === 'residente' && u.activo).length;
  const totalVigilantes = usuarios.filter((u) => u.rol === 'vigilante' && u.activo).length;
  
  const pagosVencidos = estadosPago.filter(e => e.estado === 'vencido' || e.estado === 'adeudo').length;

  const stats = [
    {
      title: 'Visitantes Activos',
      value: visitantesActivos.length,
      icon: <Home className="w-8 h-8" />,
      bgColor: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Residentes',
      value: totalResidentes,
      icon: <Users className="w-8 h-8" />,
      bgColor: 'from-green-500 to-green-600',
    },
    {
      title: 'Vigilantes Activos',
      value: totalVigilantes,
      icon: <Shield className="w-8 h-8" />,
      bgColor: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pagos Pendientes',
      value: pagosVencidos,
      icon: <DollarSign className="w-8 h-8" />,
      bgColor: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de administrador</h1>
        <p className="text-slate-300">Gestión de la Unidad Habitacional</p>
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
          {registros.slice(-5).reverse().map((registro) => (
            <div
              key={registro.id}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{registro.visitante}</p>
                  <p className="text-slate-400 text-sm">{registro.residenteNombre}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    registro.tipo === 'entrada'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/50'
                  }`}>
                    {registro.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                  </span>
                  <p className="text-slate-400 text-sm mt-1">
                    {new Date(registro.timestamp).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
