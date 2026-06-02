import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">FactoryNXT MES</h1>
                    <p className="text-sm text-muted-foreground">Manufacturing Execution System</p>
                  </div>
                </div>
              }
            />
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-medium">404 — Page not found</h2>
                    <a href="/" className="text-sm text-primary hover:underline">Go home</a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
