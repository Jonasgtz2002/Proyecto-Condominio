'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, session, fetchMe } = useStore();

  // Restore session from token on reload → redirect if already authenticated
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && !session.isAuthenticated) {
      fetchMe();
    }
  }, []);

  useEffect(() => {
    if (session.isAuthenticated && session.user?.rol) {
      switch (session.user.rol) {
        case 'admin': router.push('/admin'); break;
        case 'vigilante': router.push('/vigilante'); break;
        case 'residente': router.push('/residente'); break;
      }
    }
  }, [session.isAuthenticated, session.user?.rol]);

  const handleResetStorage = () => {
    if (confirm('¿Deseas resetear los datos? Esto limpiará el localStorage y recargará la página.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user) {
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
        setError('USUARIO O CONTRASEÑA INCORRECTOS');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Datos de prueba para facilitar el login
  const usuariosPrueba = [
    { email: 'admin@condominio.com', password: 'admin123', rol: 'Administrador' },
    { email: 'vigilante@condominio.com', password: 'vigilante123', rol: 'Vigilante' },
    { email: 'residente@condominio.com', password: 'residente123', rol: 'Residente' },
  ];

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Formulario de Login */}
        <div className="bg-indigo-600 rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-2xl text-center font-bold text-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white rounded-2xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                placeholder="Correo electrónico"
                required
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white rounded-2xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                placeholder="Contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-2xl transition-all text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-white hover:text-gray-200 transition-colors text-base"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Usuarios de Prueba */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">👤 Usuarios de prueba:</h3>
            <button
              onClick={handleResetStorage}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors"
            >
              Resetear Datos
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {usuariosPrueba.map((usuario, index) => (
              <div key={index} className="bg-white/20 p-3 rounded-lg border border-white/30">
                <div className="font-semibold text-white">{usuario.rol}</div>
                <div className="text-white">Email: {usuario.email}</div>
                <div className="text-white">Password: {usuario.password}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
