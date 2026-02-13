'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatearFecha } from '@/lib/utils';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ApiAcceso } from '@/types';

export default function HistorialPage() {
  const { session, fetchAccesosPorResidente } = useStore();
  const [historial, setHistorial] = useState<ApiAcceso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (session.user?.id_residente || session.user?.id) {
          const accesos = await fetchAccesosPorResidente(session.user.id_residente || session.user.id);
          setHistorial(accesos);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Visitas</h1>
          <p className="text-gray-600 mt-2">Cargando historial...</p>
        </div>
      </div>
    );
  }

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
              {historial.map((registro) => {
                const isEntrada = !registro.hora_salida;
                return (
                <div
                  key={registro.id_accesos}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {/* Icono */}
                  <div className={`mt-1 ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                    {isEntrada ? (
                      <ArrowDownCircle className="w-6 h-6" />
                    ) : (
                      <ArrowUpCircle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {registro.visitante ? registro.visitante.nombre : (registro.matricula_fk || 'Acceso directo')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Matrícula: {registro.matricula_fk || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isEntrada
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isEntrada ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{registro.hora_entrada || (registro.createdAt ? formatearFecha(registro.createdAt) : '')}</span>
                      {registro.vigilante && (
                        <>
                          <span>•</span>
                          <span>Vigilante: {registro.vigilante.nombre}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
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
                {historial.filter((r) => !r.hora_salida).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Visitantes Únicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(historial.filter(r => r.visitante).map((r) => r.visitante!.id_visitante)).size}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Visitas Este Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {historial.filter((r) => {
                  const fecha = r.createdAt ? new Date(r.createdAt) : null;
                  const hoy = new Date();
                  return (
                    fecha &&
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear() &&
                    !r.hora_salida
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
