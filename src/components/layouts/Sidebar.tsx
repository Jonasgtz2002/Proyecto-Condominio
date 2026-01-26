'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  UserCheck, 
  History, 
  Key,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { session, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!session.user) return null;

  // Menú según el rol
  const getNavItems = (): NavItem[] => {
    switch (session.user?.rol) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/admin/usuarios', label: 'Usuarios', icon: <Users className="w-5 h-5" /> },
        ];
      case 'vigilante':
        return [
          { href: '/vigilante', label: 'Registro', icon: <Shield className="w-5 h-5" /> },
          { href: '/vigilante/visitantes-activos', label: 'Visitantes Activos', icon: <UserCheck className="w-5 h-5" /> },
        ];
      case 'residente':
        return [
          { href: '/residente', label: 'Generar Código', icon: <Key className="w-5 h-5" /> },
          { href: '/residente/historial', label: 'Historial', icon: <History className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{session.user?.nombre}</h2>
            <p className="text-xs text-gray-500 capitalize">{session.user?.rol}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="w-64 h-full bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-white border-r border-gray-200 flex-col fixed left-0 top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
