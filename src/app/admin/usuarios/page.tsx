'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { User, UserRole } from '@/types';

export default function UsuariosPage() {
  const { usuarios, agregarUsuario, eliminarUsuario } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'residente' as UserRole,
    telefono: '',
    direccion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agregarUsuario({
      ...formData,
      activo: true,
    });
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'residente',
      telefono: '',
      direccion: '',
    });
    setShowForm(false);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de desactivar este usuario?')) {
      eliminarUsuario(id);
    }
  };

  const usuariosActivos = usuarios.filter((u) => u.activo);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra vigilantes y residentes del condominio</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Agregar Usuario
        </Button>
      </div>

      {/* Formulario de Nuevo Usuario */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="residente">Residente</option>
                    <option value="vigilante">Vigilante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formData.rol === 'residente' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección (Torre/Apto)
                    </label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Torre A, Apto 301"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Usuario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Activos ({usuariosActivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Teléfono</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dirección</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosActivos.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{usuario.nombre}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.rol === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : usuario.rol === 'vigilante'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {usuario.rol.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{usuario.telefono || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{usuario.direccion || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEliminar(usuario.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Desactivar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
