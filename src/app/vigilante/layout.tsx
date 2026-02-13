'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/layouts/Sidebar';

export default function VigilanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, logout, isSidebarOpen, fetchMe } = useStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      if (!session.isAuthenticated) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          try { await fetchMe(); } catch { /* token inválido */ }
        }
      }
      setIsReady(true);
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (isReady && (!session.isAuthenticated || session.user?.rol !== 'vigilante')) {
      router.push('/');
    }
  }, [isReady, session, router]);

  if (!isReady || !session.isAuthenticated || session.user?.rol !== 'vigilante') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Cargando...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Botón Cerrar Sesión */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 lg:px-8 py-4 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-2 border-2 border-red-500 text-red-400 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all"
          >
            Cerrar sesión
          </button>
        </div>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
