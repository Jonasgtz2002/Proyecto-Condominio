'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogIn, LogOut, Search } from 'lucide-react';
import { formatearPlaca } from '@/lib/utils';

export default function VigilantePage() {
  const { session, registrarEntrada, registrarSalida, usuarios, obtenerVisitantesActivos } = useStore();
  const [tipoRegistro, setTipoRegistro] = useState<'entrada' | 'salida'>('entrada');
  const [formData, setFormData] = useState({
    placa: '',
    visitante: '',
    motivoVisita: '',
    residenteId: '',
  });
  const [mensaje, setMensaje] = useState('');

  const residentes = usuarios.filter((u) => u.rol === 'residente' && u.activo);
  const visitantesActivos = obtenerVisitantesActivos();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipoRegistro === 'entrada') {
      if (!formData.placa || !formData.visitante) {
        setMensaje('Por favor completa todos los campos obligatorios');
        return;
      }

      const residenteSeleccionado = residentes.find((r) => r.id === formData.residenteId);

      registrarEntrada({
        placa: formatearPlaca(formData.placa),
        visitante: formData.visitante,
        motivoVisita: formData.motivoVisita,
        residenteId: formData.residenteId || undefined,
        residenteNombre: residenteSeleccionado?.nombre,
        vigilanteId: session.user!.id,
        vigilanteNombre: session.user!.nombre,
      });

      setMensaje('✅ Entrada registrada exitosamente');
    } else {
      if (!formData.placa) {
        setMensaje('Por favor ingresa la placa del vehículo');
        return;
      }

      // Verificar que existe una entrada activa
      const entradaActiva = visitantesActivos.find(
        (v) => v.placa.toUpperCase() === formatearPlaca(formData.placa)
      );

      if (!entradaActiva) {
        setMensaje('❌ No hay registro de entrada para esta placa');
        return;
      }

      registrarSalida(
        formatearPlaca(formData.placa),
        session.user!.id,
        session.user!.nombre
      );

      setMensaje('✅ Salida registrada exitosamente');
    }

    // Limpiar formulario
    setFormData({
      placa: '',
      visitante: '',
      motivoVisita: '',
      residenteId: '',
    });

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje(''), 3000);
  };

  const buscarVisitanteActivo = () => {
    const visitante = visitantesActivos.find(
      (v) => v.placa.toUpperCase() === formatearPlaca(formData.placa)
    );
    
    if (visitante) {
      setFormData({
        ...formData,
        visitante: visitante.visitante,
        residenteId: visitante.residenteId || '',
      });
      setMensaje(`Visitante encontrado: ${visitante.visitante}`);
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('No se encontró un visitante activo con esa placa');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Accesos</h1>
        <p className="text-gray-600 mt-2">Sistema rápido para control de entrada y salida</p>
      </div>

      {/* Selector de Tipo */}
      <div className="flex gap-4">
        <Button
          onClick={() => setTipoRegistro('entrada')}
          variant={tipoRegistro === 'entrada' ? 'primary' : 'outline'}
          size="lg"
          className="flex-1 flex items-center justify-center gap-3"
        >
          <LogIn className="w-6 h-6" />
          Registrar Entrada
        </Button>
        <Button
          onClick={() => setTipoRegistro('salida')}
          variant={tipoRegistro === 'salida' ? 'primary' : 'outline'}
          size="lg"
          className="flex-1 flex items-center justify-center gap-3"
        >
          <LogOut className="w-6 h-6" />
          Registrar Salida
        </Button>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tipoRegistro === 'entrada' ? '🚗 Nueva Entrada' : '🚙 Nueva Salida'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa del Vehículo *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="ABC-123"
                  required
                />
                {tipoRegistro === 'salida' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={buscarVisitanteActivo}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {tipoRegistro === 'entrada' && (
              <>
                {/* Nombre del Visitante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Visitante *
                  </label>
                  <input
                    type="text"
                    value={formData.visitante}
                    onChange={(e) => setFormData({ ...formData, visitante: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                {/* Residente que Visita */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residente que Visita (Opcional)
                  </label>
                  <select
                    value={formData.residenteId}
                    onChange={(e) => setFormData({ ...formData, residenteId: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar residente...</option>
                    {residentes.map((residente) => (
                      <option key={residente.id} value={residente.id}>
                        {residente.nombre} - {residente.direccion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Motivo de Visita */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de Visita (Opcional)
                  </label>
                  <textarea
                    value={formData.motivoVisita}
                    onChange={(e) => setFormData({ ...formData, motivoVisita: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Visita familiar, entrega, mantenimiento, etc."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Mensaje */}
            {mensaje && (
              <div className={`p-4 rounded-lg ${
                mensaje.includes('✅') ? 'bg-green-50 text-green-700' : 
                mensaje.includes('❌') ? 'bg-red-50 text-red-700' : 
                'bg-blue-50 text-blue-700'
              }`}>
                {mensaje}
              </div>
            )}

            {/* Botón de Envío */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-xl py-6"
            >
              {tipoRegistro === 'entrada' ? '✓ Registrar Entrada' : '✓ Registrar Salida'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Visitantes Activos - Vista Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Visitantes Actualmente en el Condominio ({visitantesActivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {visitantesActivos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay visitantes activos</p>
          ) : (
            <div className="space-y-3">
              {visitantesActivos.map((visitante) => (
                <div
                  key={visitante.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{visitante.visitante}</p>
                    <p className="text-sm text-gray-600">
                      Placa: <span className="font-mono font-bold">{visitante.placa}</span>
                    </p>
                    {visitante.residenteNombre && (
                      <p className="text-sm text-gray-600">Visita a: {visitante.residenteNombre}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(visitante.timestamp).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
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
