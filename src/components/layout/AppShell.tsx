import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoControls } from './DemoControls';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, hasCompletedOnboarding } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to onboarding if not completed (but not during initial render to prevent mobile menu issues)
  if (role === 'customer' && !hasCompletedOnboarding() && !location.pathname.includes('/onboarding') && location.pathname !== '/app/dashboard') {
    navigate('/app/onboarding');
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

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Demo controls (development only) */}
      {process.env.NODE_ENV === 'development' && <DemoControls />}
    </div>
  );
}