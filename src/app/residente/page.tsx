'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Key, Copy, Check } from 'lucide-react';

export default function ResidentePage() {
  const { session, generarCodigoAcceso, codigos } = useStore();
  const [nombreVisitante, setNombreVisitante] = useState('');
  const [horasValidez, setHorasValidez] = useState(24);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const handleGenerar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombreVisitante.trim()) {
      return;
    }

    const codigo = generarCodigoAcceso(
      session.user!.id,
      session.user!.nombre,
      nombreVisitante,
      horasValidez
    );

    setCodigoGenerado(codigo.codigo);
    setNombreVisitante('');
  };

  const copiarCodigo = () => {
    if (codigoGenerado) {
      navigator.clipboard.writeText(codigoGenerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const misCodigosActivos = codigos.filter(
    (c) => c.residenteId === session.user?.id && !c.usado && new Date() < c.validoHasta
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generar Código de Acceso</h1>
        <p className="text-gray-600 mt-2">Crea códigos para facilitar el acceso de tus visitantes</p>
      </div>

      {/* Formulario para Generar Código */}
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Código de Acceso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerar} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Visitante *
              </label>
              <input
                type="text"
                value={nombreVisitante}
                onChange={(e) => setNombreVisitante(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido por (horas)
              </label>
              <select
                value={horasValidez}
                onChange={(e) => setHorasValidez(Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 horas</option>
                <option value={4}>4 horas</option>
                <option value={8}>8 horas</option>
                <option value={24}>24 horas (1 día)</option>
                <option value={48}>48 horas (2 días)</option>
                <option value={168}>1 semana</option>
              </select>
            </div>

            <Button type="submit" size="lg" className="w-full">
              <Key className="w-5 h-5 mr-2" />
              Generar Código
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Código Generado */}
      {codigoGenerado && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Código Generado!</h3>
              <p className="text-gray-600">Comparte este código con tu visitante</p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-4">
              <p className="text-4xl font-mono font-bold text-blue-600 tracking-wider">
                {codigoGenerado}
              </p>
            </div>

            <Button
              onClick={copiarCodigo}
              variant={copiado ? 'secondary' : 'primary'}
              size="lg"
              className="w-full max-w-xs"
            >
              {copiado ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copiar Código
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Códigos Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Códigos Activos ({misCodigosActivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {misCodigosActivos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes códigos activos</p>
          ) : (
            <div className="space-y-4">
              {misCodigosActivos.map((codigo) => (
                <div
                  key={codigo.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-mono font-bold text-lg text-gray-900">{codigo.codigo}</p>
                    <p className="text-sm text-gray-600">Para: {codigo.visitante}</p>
                    <p className="text-xs text-gray-500">
                      Válido hasta: {new Date(codigo.validoHasta).toLocaleString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ACTIVO
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
