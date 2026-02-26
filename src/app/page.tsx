'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();
  const { login, session, fetchMe } = useStore();
  const isLoggingIn = useRef(false);

  // Restore session from token on reload → redirect if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token && !session.isAuthenticated) {
        try {
          await fetchMe();
        } catch {
          // Token invalid, continue to login
        }
      }
      setInitialCheckDone(true);
    };
    checkSession();
  }, []);

  // Redirect when session is authenticated (after initial check or after login)
  useEffect(() => {
    if (!initialCheckDone && !isLoggingIn.current) return;
    if (session.isAuthenticated && session.user?.rol) {
      const routes: Record<string, string> = {
        admin: '/admin/usuarios',
        vigilante: '/vigilante',
        residente: '/residente',
      };
      const route = routes[session.user.rol];
      if (route) {
        router.push(route);
      }
    }
  }, [initialCheckDone, session.isAuthenticated, session.user?.rol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    isLoggingIn.current = true;

    try {
      const user = await login(email, password);

      if (user) {
        const routes: Record<string, string> = {
          admin: '/admin',
          vigilante: '/vigilante',
          residente: '/residente',
        };
        const route = routes[user.rol];
        if (route) {
          router.push(route);
        } else {
          setError('Rol de usuario no reconocido: ' + (user.rol || 'sin rol'));
        }
      } else {
        setError('USUARIO O CONTRASEÑA INCORRECTOS');
      }
    } catch (err: any) {
      const msg = err?.message || 'Error de conexión con el servidor';
      setError(msg);
    } finally {
      setLoading(false);
      isLoggingIn.current = false;
    }
  };

   

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Formulario de Login */}
        <div className="bg-indigo-600 rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-500 text-white px-6 py-4 rounded-2xl text-center font-bold text-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white rounded-2xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                placeholder="Correo electrónico"
                autoComplete="username"
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
                autoComplete="current-password"
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
