'use client';

import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Shield, Home, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { usuarios, registros, obtenerVisitantesActivos } = useStore();
  
  const visitantesActivos = obtenerVisitantesActivos();
  const totalUsuarios = usuarios.filter((u) => u.activo).length;
  const totalVigilantes = usuarios.filter((u) => u.rol === 'vigilante' && u.activo).length;
  const totalResidentes = usuarios.filter((u) => u.rol === 'residente' && u.activo).length;

  // Registros de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const registrosHoy = registros.filter((r) => {
    const fechaRegistro = new Date(r.timestamp);
    fechaRegistro.setHours(0, 0, 0, 0);
    return fechaRegistro.getTime() === hoy.getTime();
  });

  const stats = [
    {
      title: 'Visitantes Activos',
      value: visitantesActivos.length,
      icon: <Home className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Usuarios',
      value: totalUsuarios,
      icon: <Users className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Vigilantes',
      value: totalVigilantes,
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Registros Hoy',
      value: registrosHoy.length,
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Vista general del sistema de control de accesos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visitantes Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Visitantes en el Condominio</CardTitle>
        </CardHeader>
        <CardContent>
          {visitantesActivos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay visitantes activos en este momento</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Visitante</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Placa</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Residente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hora Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {visitantesActivos.map((registro) => (
                    <tr key={registro.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{registro.visitante}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">{registro.placa}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{registro.residenteNombre || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(registro.timestamp).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Últimos Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Visitante</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Placa</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vigilante</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registros
                  .slice(-10)
                  .reverse()
                  .map((registro) => (
                    <tr key={registro.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            registro.tipo === 'entrada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {registro.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{registro.visitante}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">{registro.placa}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{registro.vigilanteNombre}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(registro.timestamp).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
