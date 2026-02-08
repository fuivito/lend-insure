import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMembership?: boolean;
}

export function ProtectedRoute({ children, requireMembership = true }: ProtectedRouteProps) {
  const location = useLocation();
  const { session, isLoading, isCheckingMembership, hasMembership, hasPendingInvitation } = useAuth();

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
