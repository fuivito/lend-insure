import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoControls } from './DemoControls';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, membership, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-redirect to appropriate dashboard based on membership
  useEffect(() => {
    if (isLoading) return;

    if (location.pathname === '/app' || location.pathname === '/app/') {
      // Default to broker dashboard for authenticated users
      navigate('/app/broker/dashboard');
    }
  }, [location.pathname, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive layout */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Demo controls (can be removed in production) */}
      <DemoControls />
    </div>
  );
}
