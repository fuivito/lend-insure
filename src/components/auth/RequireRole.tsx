import { useAuth } from '@/contexts/AuthContext';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'READ_ONLY';

const ROLE_HIERARCHY: Record<Role, number> = {
  READ_ONLY: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

interface RequireRoleProps {
  children: React.ReactNode;
  /** Roles that are allowed access (OR logic - any of these roles works) */
  allowedRoles?: Role[];
  /** Minimum role required (uses hierarchy - this role or higher) */
  minimumRole?: Role;
  /** What to show if access is denied (null = hide completely) */
  fallback?: React.ReactNode;
}

export function RequireRole({
  children,
  allowedRoles,
  minimumRole,
  fallback = null,
}: RequireRoleProps) {
  const { membership } = useAuth();
  const userRole = membership?.role as Role | undefined;

  if (!userRole) {
    return <>{fallback}</>;
  }

  // Check allowed roles (OR logic)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  // Check minimum role (hierarchy)
  if (minimumRole) {
    const userLevel = ROLE_HIERARCHY[userRole];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];
    if (userLevel < requiredLevel) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience components for common patterns
export function RequireOwner({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RequireRole allowedRoles={['OWNER']} fallback={fallback}>{children}</RequireRole>;
}

export function RequireAdmin({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RequireRole allowedRoles={['OWNER', 'ADMIN']} fallback={fallback}>{children}</RequireRole>;
}

export function RequireMember({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RequireRole minimumRole="MEMBER" fallback={fallback}>{children}</RequireRole>;
}

export function RequireWrite({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RequireMember fallback={fallback}>{children}</RequireMember>;
}
