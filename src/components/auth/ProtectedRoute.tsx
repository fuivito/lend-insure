import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMembership?: boolean;
}

export function ProtectedRoute({ children, requireMembership = true }: ProtectedRouteProps) {
  const location = useLocation();
  const { session, isLoading, isCheckingMembership, hasMembership, hasPendingInvitation, membershipError, refreshMembership, signOut } = useAuth();

  // Show loading while checking auth state
  if (isLoading || isCheckingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // API error - show error instead of redirecting to onboarding
  if (requireMembership && membershipError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="text-lg font-semibold text-foreground">Connection Error</h2>
          <p className="text-sm text-muted-foreground">
            Unable to reach the server. Please check your connection and try again.
          </p>
          <p className="text-xs text-muted-foreground/70">{membershipError}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={refreshMembership}>
              Retry
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but no membership - handle onboarding flows
  if (requireMembership && !hasMembership) {
    // If they have a pending invitation, redirect to accept invite page
    if (hasPendingInvitation) {
      return <Navigate to="/accept-invite" state={{ from: location }} replace />;
    }

    // Otherwise, redirect to create org page
    return <Navigate to="/create-org" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
