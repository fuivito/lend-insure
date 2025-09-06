import { useState, useEffect } from 'react';
import { authService, type User, type UserRole } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [role, setRole] = useState<UserRole>(authService.getCurrentRole());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const login = async (userRole: UserRole = 'customer') => {
    const user = await authService.login(userRole);
    setUser(user);
    setRole(userRole);
    setIsAuthenticated(true);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRole('customer');
    setIsAuthenticated(false);
  };

  const switchRole = (newRole: UserRole) => {
    authService.setRole(newRole);
    setUser(authService.getCurrentUser());
    setRole(newRole);
  };

  const hasCompletedOnboarding = () => {
    return authService.hasCompletedOnboarding();
  };

  return {
    user,
    role,
    isAuthenticated,
    login,
    logout,
    switchRole,
    hasCompletedOnboarding,
    hasRole: (checkRole: UserRole) => role === checkRole
  };
}