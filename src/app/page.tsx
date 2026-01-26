'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const login = useStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);

    if (user) {
      // Redirigir según el rol
      switch (user.rol) {
        case 'admin':
          router.push('/admin');
          break;
        case 'vigilante':
          router.push('/vigilante');
          break;
        case 'residente':
          router.push('/residente');
          break;
      }
    } else {
      setError('Credenciales inválidas');
    }
  };

  // Datos de prueba para facilitar el login
  const usuariosPrueba = [
    { email: 'admin@condominio.com', password: 'admin123', rol: 'Administrador' },
    { email: 'vigilante@condominio.com', password: 'vigilante123', rol: 'Vigilante' },
    { email: 'residente@condominio.com', password: 'residente123', rol: 'Residente' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Accesos</h1>
          <p className="text-gray-600 mt-2">Sistema de gestión para condominios</p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="usuario@condominio.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

        {/* Usuarios de Prueba */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">👤 Usuarios de prueba:</h3>
          <div className="space-y-2 text-xs">
            {usuariosPrueba.map((usuario, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900">{usuario.rol}</div>
                <div className="text-gray-600">Email: {usuario.email}</div>
                <div className="text-gray-600">Password: {usuario.password}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
