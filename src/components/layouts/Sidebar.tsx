'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Users, 
  Shield, 
  Car,
  DollarSign,
  Megaphone,
  Menu,
  X,
  History,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { session, isSidebarOpen, toggleSidebar } = useStore();

  if (!session.user) return null;

  // Menú según el rol
  const getNavItems = (): NavItem[] => {
    switch (session.user?.rol) {
      case 'admin':
        return [
    
          { href: '/admin/usuarios', label: 'Residentes', icon: <Users className="w-6 h-6" /> },
          { href: '/admin/vigilantes', label: 'Vigilancia', icon: <Shield className="w-6 h-6" /> },
          { href: '/admin/estacionamiento', label: 'Estacionamiento', icon: <Car className="w-6 h-6" /> },
          { href: '/admin/pagos', label: 'Pagos', icon: <DollarSign className="w-6 h-6" /> },
          { href: '/admin/anuncios', label: 'Anuncios', icon: <Megaphone className="w-6 h-6" /> },
        ];
      case 'vigilante':
        return [
          { href: '/vigilante', label: 'Control de acceso', icon: <Shield className="w-6 h-6" /> },
          { href: '/vigilante/visitantes-activos', label: 'Registro de ingresos especiales', icon: <Users className="w-6 h-6" /> },
        ];
      case 'residente':
        return [
          { href: '/residente', label: 'Panel', icon: <LayoutDashboard className="w-6 h-6" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <>
      {/* Botón menú en la esquina superior derecha */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-6 py-4 transition-all text-white hover:bg-white/10 rounded-lg',
                isActive && 'bg-white/20'
              )}
            >
              {item.icon}
              <span className="font-medium text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Botón abrir menú */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="fixed left-0 top-0 w-64 h-screen bg-indigo-600 flex flex-col shadow-2xl z-40">
          <SidebarContent />
        </aside>
      )}
    </>
  );
}
