'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/layouts/Sidebar';

export default function ResidenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!session.isAuthenticated || session.user?.rol !== 'residente') {
      router.push('/');
    }
  }, [session, router]);

  if (!session.isAuthenticated || session.user?.rol !== 'residente') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
