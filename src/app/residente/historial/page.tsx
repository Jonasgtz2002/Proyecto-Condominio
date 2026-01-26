'use client';

import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatearFecha } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function HistorialPage() {
  const { session, obtenerHistorialResidente } = useStore();
  const historial = obtenerHistorialResidente(session.user!.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historial de Visitas</h1>
        <p className="text-gray-600 mt-2">
          Registro de todos los visitantes que has recibido
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial Completo ({historial.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          {historial.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros de visitas</p>
          ) : (
            <div className="space-y-3">
              {historial.map((registro) => (
                <div
                  key={registro.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {/* Icono */}
                  <div className={`mt-1 ${
                    registro.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {registro.tipo === 'entrada' ? (
                      <ArrowDownCircle className="w-6 h-6" />
                    ) : (
                      <ArrowUpCircle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{registro.visitante}</p>
                        <p className="text-sm text-gray-600 font-mono">Placa: {registro.placa}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          registro.tipo === 'entrada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {registro.tipo.toUpperCase()}
                      </span>
                    </div>

                    {registro.motivoVisita && (
                      <p className="text-sm text-gray-600 mt-2">
                        Motivo: {registro.motivoVisita}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatearFecha(registro.timestamp)}</span>
                      <span>•</span>
                      <span>Vigilante: {registro.vigilanteNombre}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {historial.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Total de Visitas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historial.filter((r) => r.tipo === 'entrada').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Visitantes Únicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(historial.map((r) => r.visitante)).size}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Visitas Este Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historial.filter((r) => {
                  const fecha = new Date(r.timestamp);
                  const hoy = new Date();
                  return (
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear() &&
                    r.tipo === 'entrada'
                  );
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
