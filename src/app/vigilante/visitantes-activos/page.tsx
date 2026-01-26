'use client';

import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, User, Car, Home } from 'lucide-react';

export default function VisitantesActivosPage() {
  const { obtenerVisitantesActivos } = useStore();
  const visitantesActivos = obtenerVisitantesActivos();

  const calcularTiempoTranscurrido = (entrada: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - new Date(entrada).getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos} min`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visitantes Activos</h1>
        <p className="text-gray-600 mt-2">
          {visitantesActivos.length} {visitantesActivos.length === 1 ? 'visitante' : 'visitantes'} en el condominio
        </p>
      </div>

      {visitantesActivos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <User className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay visitantes activos</h3>
            <p className="text-gray-600">Todos los visitantes han salido del condominio</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visitantesActivos.map((visitante) => (
            <Card key={visitante.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{visitante.visitante}</h3>
                      <p className="text-sm text-gray-500">
                        Ingresó hace {calcularTiempoTranscurrido(visitante.timestamp)}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      ACTIVO
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Placa</p>
                        <p className="font-mono font-bold text-gray-900">{visitante.placa}</p>
                      </div>
                    </div>

                    {visitante.residenteNombre && (
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Visita a</p>
                          <p className="font-semibold text-gray-900">{visitante.residenteNombre}</p>
                        </div>
                      </div>
                    )}

                    {visitante.motivoVisita && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Motivo</p>
                          <p className="text-sm text-gray-900">{visitante.motivoVisita}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Hora de entrada</p>
                        <p className="text-sm text-gray-900">
                          {new Date(visitante.timestamp).toLocaleString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
