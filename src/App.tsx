import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/auth';

import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Plants } from '@/pages/Plants';
import { Lines } from '@/pages/Lines';
import { Stations } from '@/pages/Stations';
import { Equipment } from '@/pages/Equipment';
import { Orders } from '@/pages/Orders';
import { Inventory } from '@/pages/Inventory';
import { NCR } from '@/pages/NCR';
import { CAPA } from '@/pages/CAPA';
import { Traceability } from '@/pages/Traceability';
import { Users } from '@/pages/Users';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

/** Redirects unauthenticated users to /login */
function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirects already-authenticated users away from /login */
function RedirectIfAuthed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<RedirectIfAuthed />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected — all routes share AppLayout as shell */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/lines" element={<Lines />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/ncr" element={<NCR />} />
              <Route path="/capa" element={<CAPA />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
