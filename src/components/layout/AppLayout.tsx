import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Factory, Package, ClipboardList,
  AlertTriangle, Users, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Plants', href: '/plants', icon: Factory },
  { name: 'Lines', href: '/lines', icon: Factory },
  { name: 'Stations', href: '/stations', icon: Factory },
  { name: 'Equipment', href: '/equipment', icon: Settings },
  { name: 'Production Orders', href: '/orders', icon: ClipboardList },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'NCR', href: '/ncr', icon: AlertTriangle },
  { name: 'CAPA', href: '/capa', icon: AlertTriangle },
  { name: 'Traceability', href: '/traceability', icon: Package },
  { name: 'Users', href: '/users', icon: Users },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold">FactoryNXT</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-background border-r">
          <div className="flex h-16 items-center px-6 border-b">
            <h1 className="text-xl font-bold">FactoryNXT</h1>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-x-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.roles?.join(', ')}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-md hover:bg-accent"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-background px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
        </div>
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
